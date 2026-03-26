import { Command } from 'commander';
import { createRequire } from 'node:module';
import { registerAllCommands } from './commands/index.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

const program = new Command();

program
  .name('leadmagic')
  .description(
    'LeadMagic CLI — people enrichment, company intel, job data, and ad intelligence.\nDual-mode: runs as a standard CLI or as an MCP server for AI agents.',
  )
  .version(version)
  .option('--api-key <key>', 'LeadMagic API key (overrides env + stored config)')
  .option('--output <format>', 'Output format: json (default) or pretty')
  .option('--pretty', 'Pretty-print JSON output (shorthand for --output pretty)')
  .option('--quiet', 'Suppress all output; use exit code only (0=success, 1=error)')
  .option('--fields <fields>', 'Comma-separated fields to include in output (dot notation supported)');

registerAllCommands(program);

program.addHelpText(
  'after',
  `
Quick Start:
  $ leadmagic login                                         # Save API key
  $ leadmagic credits                                       # Check balance
  $ leadmagic people validate-email --email you@co.com      # Validate email
  $ leadmagic people find-email --first-name Jane --last-name Doe --domain acme.com
  $ leadmagic companies search --domain stripe.com --pretty
  $ leadmagic jobs find --job-title "Sales Manager" --has-remote
  $ leadmagic ads google --domain hubspot.com --pretty
  $ leadmagic mcp                                           # Start MCP server

Environment:
  LEADMAGIC_API_KEY   API key (alternative to login/--api-key)

Config:
  ~/.leadmagic-cli/config.json   Stored API key location
`,
);

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(JSON.stringify({ error: message, code: 'FATAL' }));
  process.exit(1);
});
