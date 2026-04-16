import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { RunningCoachClient } from './client.js';
import { athleteTools, handleAthleteTool } from './tools/athletes.js';
import { planTools, handlePlanTool } from './tools/plans.js';
import { activityTools, handleActivityTool } from './tools/activities.js';
const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8080/api';
const client = new RunningCoachClient(backendUrl);
const server = new Server({ name: 'running-coach', version: '1.0.0' }, { capabilities: { tools: {} } });
const allTools = [...athleteTools, ...planTools, ...activityTools];
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: allTools
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        const athleteToolNames = new Set(athleteTools.map(t => t.name));
        const planToolNames = new Set(planTools.map(t => t.name));
        const activityToolNames = new Set(activityTools.map(t => t.name));
        if (athleteToolNames.has(name)) {
            return await handleAthleteTool(name, args, client);
        }
        else if (planToolNames.has(name)) {
            return await handlePlanTool(name, args, client);
        }
        else if (activityToolNames.has(name)) {
            return await handleActivityTool(name, args, client);
        }
        else {
            return {
                content: [{ type: 'text', text: `Unknown tool: ${name}` }],
                isError: true
            };
        }
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
            content: [{ type: 'text', text: `Error: ${message}` }],
            isError: true
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    process.stderr.write(`Running Coach MCP server started (backend: ${backendUrl})\n`);
}
main().catch(err => {
    process.stderr.write(`Fatal: ${err}\n`);
    process.exit(1);
});
//# sourceMappingURL=index.js.map