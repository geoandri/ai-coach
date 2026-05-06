# MCP Setup

The MCP server starts automatically alongside the app on port 3001. Make sure the app is
running before starting a coaching session.

## Claude Desktop

Add the following to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ai-coach": {
      "command": "npx",
      "args": ["mcp-remote", "http://localhost:3001/mcp"]
    }
  }
}
```

Restart Claude Desktop after saving the file.

## Claude Code

Run once (from any directory):

```bash
claude mcp add --transport http ai-coach http://localhost:3001/mcp
```

## Starting a coaching session

1. Start the app (`node --env-file=.env dist/index.js`)
2. Open a new conversation in Claude Desktop or Claude Code
3. Select a coach persona from the AI Coach connector (plug icon) — e.g. `trail-running-coach`
4. Claude will guide the session from there
