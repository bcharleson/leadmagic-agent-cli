import type { Command } from 'commander';
import { loadConfig } from '../../core/config.js';
import { ENV_VAR } from '../../core/auth.js';
import { LeadMagicClient } from '../../core/client.js';
import type { CreditsResponse } from '../../core/types.js';

export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Show authentication status and remaining credits')
    .option('--api-key <key>', 'API key to check (overrides stored key)')
    .action(async (options: { apiKey?: string }) => {
      const config = await loadConfig();
      const envKey = process.env[ENV_VAR];

      let apiKey: string | undefined = options.apiKey;
      let source = 'flag';

      if (!apiKey) {
        if (envKey) {
          apiKey = envKey;
          source = `env (${ENV_VAR})`;
        } else if (config.api_key) {
          apiKey = config.api_key;
          source = '~/.leadmagic-cli/config.json';
        }
      }

      if (!apiKey) {
        console.log('Status: not authenticated');
        console.log(`Run: leadmagic login  OR  export ${ENV_VAR}=your_key`);
        process.exitCode = 1;
        return;
      }

      const maskedKey = apiKey.slice(0, 6) + '...' + apiKey.slice(-4);
      console.log(`Status: authenticated`);
      console.log(`Key:    ${maskedKey}`);
      console.log(`Source: ${source}`);

      // Fetch remaining credits
      try {
        const client = new LeadMagicClient({ apiKey });
        const result = await client.get<CreditsResponse>('/v1/credits');
        console.log(`Credits: ${result.credits.toLocaleString()}`);
      } catch {
        console.log('Credits: (unable to fetch — check key validity)');
      }
    });
}
