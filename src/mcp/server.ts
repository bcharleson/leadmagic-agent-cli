import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { resolveApiKey } from '../core/auth.js';
import { LeadMagicClient } from '../core/client.js';
import { allCommands } from '../commands/index.js';

export async function startMcpServer(): Promise<void> {
  const apiKey = await resolveApiKey();
  const client = new LeadMagicClient({ apiKey });

  const server = new McpServer({
    name: 'leadmagic',
    version: '0.1.0',
  });

  for (const cmdDef of allCommands) {
    server.registerTool(
      cmdDef.name,
      {
        description: cmdDef.description,
        inputSchema: cmdDef.inputSchema,
      },
      async (args: Record<string, unknown>) => {
        try {
          const parsed = cmdDef.inputSchema.safeParse(args);
          if (!parsed.success) {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: JSON.stringify({
                    error: 'Invalid input',
                    details: parsed.error.issues,
                  }),
                },
              ],
              isError: true,
            };
          }

          const result = await cmdDef.handler(parsed.data, client);
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          const code =
            error instanceof Error && 'code' in error
              ? (error as { code: string }).code
              : 'UNKNOWN_ERROR';
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({ error: message, code }),
              },
            ],
            isError: true,
          };
        }
      },
    );
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`LeadMagic MCP server started — ${allCommands.length} tools registered`);
}
