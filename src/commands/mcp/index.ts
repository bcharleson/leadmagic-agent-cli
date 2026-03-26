import type { Command } from 'commander';
import { startMcpServer } from '../../mcp/server.js';

export function registerMcpCommand(program: Command): void {
  program
    .command('mcp')
    .description('Start the LeadMagic MCP server (for use with AI agents)')
    .action(async () => {
      await startMcpServer();
    });
}
