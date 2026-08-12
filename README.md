# Mobbin MCP Integration

This repository is configured to use the [Mobbin](https://mobbin.com) MCP
(Model Context Protocol) server, giving Claude Code access to Mobbin's design
reference library directly from your editor.

## What's configured

The server is declared in [`.mcp.json`](./.mcp.json) at **project scope**, so
anyone who opens this repo in Claude Code is prompted to enable it — no manual
setup required.

```json
{
  "mcpServers": {
    "mobbin": {
      "type": "http",
      "url": "https://api.mobbin.com/mcp"
    }
  }
}
```

## Using it

1. Open this repository in Claude Code.
2. When prompted, approve the `mobbin` MCP server for this project.
3. Run `/mcp` to confirm it's connected and to complete any authentication
   Mobbin requires.

## Alternative: user scope

If you'd rather have Mobbin available in **every** project instead of just this
repo, add it to your personal config instead of relying on the committed
`.mcp.json`:

```bash
claude mcp add mobbin --scope user --transport http https://api.mobbin.com/mcp
```

Project scope (this repo) and user scope (your machine) are independent — use
whichever fits how broadly you want the server available.
