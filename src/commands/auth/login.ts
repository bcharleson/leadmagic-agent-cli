import type { Command } from 'commander';
import { saveConfig } from '../../core/config.js';

export function registerLoginCommand(program: Command): void {
  program
    .command('login')
    .description('Save your LeadMagic API key')
    .option('--api-key <key>', 'API key (non-interactive)')
    .action(async (options: { apiKey?: string }) => {
      let apiKey = options.apiKey;

      if (!apiKey) {
        const { input } = await import('@inquirer/prompts');
        apiKey = await input({ message: 'LeadMagic API Key:' });
      }

      if (!apiKey?.trim()) {
        console.error('API key cannot be empty');
        process.exitCode = 1;
        return;
      }

      await saveConfig({ api_key: apiKey.trim() });
      console.log('API key saved to ~/.leadmagic-cli/config.json');
    });
}
