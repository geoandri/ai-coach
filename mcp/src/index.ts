import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js'
import { AiCoachClient } from './client.js'
import { athleteTools, handleAthleteTool } from './tools/athletes.js'
import { planTools, handlePlanTool } from './tools/plans.js'
import { activityTools, handleActivityTool } from './tools/activities.js'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'http'

const __dirname = dirname(fileURLToPath(import.meta.url))

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8080/api'
const publicUrl = process.env.PUBLIC_URL ?? backendUrl
const client = new AiCoachClient(backendUrl, publicUrl)

// Load coach persona prompts from docs/personas/ at startup.
// Files starting with _ (e.g. _base.md, _template.md) are skipped.
const personasDir = join(__dirname, '..', '..', 'docs', 'personas')

interface CoachPrompt {
  name: string
  description: string
  content: string
}

function loadPersonas(): CoachPrompt[] {
  try {
    return readdirSync(personasDir)
      .filter(f => f.endsWith('.md') && !f.startsWith('_'))
      .map(f => {
        const name = basename(f, '.md')
        const content = readFileSync(join(personasDir, f), 'utf-8')
        const titleMatch = content.match(/^#\s+(.+)$/m)
        const description = titleMatch
          ? `Load the ${titleMatch[1]} persona as your coaching context`
          : `Load the ${name} coach persona`
        return { name, description, content }
      })
  } catch {
    return []
  }
}

const personas = loadPersonas()

function createMcpServer(): Server {
  const server = new Server(
    { name: 'ai-coach', version: '1.0.0' },
    { capabilities: { tools: {}, prompts: {} } }
  )

  const allTools = [...athleteTools, ...planTools, ...activityTools]

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: allTools
  }))

  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: personas.map(p => ({
      name: p.name,
      description: p.description
    }))
  }))

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const persona = personas.find(p => p.name === request.params.name)
    if (!persona) {
      throw new Error(`Unknown prompt: ${request.params.name}`)
    }
    return {
      description: persona.description,
      messages: [
        {
          role: 'user' as const,
          content: { type: 'text' as const, text: persona.content }
        }
      ]
    }
  })

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    try {
      const athleteToolNames = new Set(athleteTools.map(t => t.name))
      const planToolNames = new Set(planTools.map(t => t.name))
      const activityToolNames = new Set(activityTools.map(t => t.name))

      if (athleteToolNames.has(name)) {
        return await handleAthleteTool(name, args, client)
      } else if (planToolNames.has(name)) {
        return await handlePlanTool(name, args, client)
      } else if (activityToolNames.has(name)) {
        return await handleActivityTool(name, args, client)
      } else {
        return {
          content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }],
          isError: true
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return {
        content: [{ type: 'text' as const, text: `Error: ${message}` }],
        isError: true
      }
    }
  })

  return server
}

async function startHttp(port: number) {
  const httpServer = createServer(async (req, res) => {
    if (req.url !== '/mcp') {
      res.writeHead(404).end()
      return
    }

    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
    const server = createMcpServer()

    res.on('close', () => { transport.close() })

    await server.connect(transport)
    await transport.handleRequest(req, res)
  })

  httpServer.listen(port, () => {
    process.stderr.write(`AI Coach MCP server listening on http://0.0.0.0:${port}/mcp (backend: ${backendUrl}, public: ${publicUrl})\n`)
    process.stderr.write(`Loaded ${personas.length} persona(s): ${personas.map(p => p.name).join(', ') || 'none'}\n`)
  })
}

async function startStdio() {
  const transport = new StdioServerTransport()
  const server = createMcpServer()
  await server.connect(transport)
  process.stderr.write(`AI Coach MCP server started via stdio (backend: ${backendUrl})\n`)
  process.stderr.write(`Loaded ${personas.length} persona(s): ${personas.map(p => p.name).join(', ') || 'none'}\n`)
}

async function main() {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : undefined
  if (port) {
    await startHttp(port)
  } else {
    await startStdio()
  }
}

main().catch(err => {
  process.stderr.write(`Fatal: ${err}\n`)
  process.exit(1)
})
