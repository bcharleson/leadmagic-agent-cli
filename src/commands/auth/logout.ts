import type { Command } from 'commander';
import { clearConfig } from '../../core/config.js';

export function registerLogoutCommand(program: Command): void {
  program
    .command('logout')
    .description('Remove stored API key')
    .action(async () => {
      await clearConfig();
      console.log('Logged out — API key removed from ~/.leadmagic-cli/config.json');
    });
}
