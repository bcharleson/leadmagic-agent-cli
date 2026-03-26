import { startMcpServer } from './mcp/server.js';

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

startMcpServer().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Failed to start MCP server:', message);
  process.exit(1);
});
