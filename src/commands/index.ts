import type { Command } from 'commander';
import { z } from 'zod';
import type { CommandDefinition, GlobalOptions } from '../core/types.js';
import { resolveApiKey } from '../core/auth.js';
import { LeadMagicClient } from '../core/client.js';
import { output, outputError } from '../core/output.js';

import { registerLoginCommand } from './auth/login.js';
import { registerLogoutCommand } from './auth/logout.js';
import { registerStatusCommand } from './auth/status.js';
import { registerMcpCommand } from './mcp/index.js';

import { peopleCommands } from './people/index.js';
import { companiesCommands } from './companies/index.js';
import { jobsCommands } from './jobs/index.js';
import { adsCommands } from './ads/index.js';

// All commands used by MCP server
export const allCommands: CommandDefinition[] = [
  ...peopleCommands,
  ...companiesCommands,
  ...jobsCommands,
  ...adsCommands,
];

function kebab(str: string): string {
  return str.replace(/_/g, '-');
}

function registerCommandGroup(
  program: Command,
  groupName: string,
  commands: CommandDefinition[],
): void {
  const groupCmd = program.command(groupName).description(`LeadMagic ${groupName} operations`);

  for (const cmdDef of commands) {
    const cmd = groupCmd.command(cmdDef.subcommand).description(cmdDef.description);

    // Register options
    if (cmdDef.cliMappings.options) {
      for (const opt of cmdDef.cliMappings.options) {
        // Boolean flags (no value placeholder) vs value flags
        if (opt.flags.endsWith('>') || opt.flags.includes('<')) {
          cmd.option(opt.flags, opt.description);
        } else {
          cmd.option(opt.flags, opt.description);
        }
      }
    }

    // Help examples
    if (cmdDef.examples?.length) {
      cmd.addHelpText(
        'after',
        '\nExamples:\n' + cmdDef.examples.map((e) => `  $ ${e}`).join('\n'),
      );
    }

    cmd.action(async (...actionArgs: unknown[]) => {
      // Commander passes options as the last argument before `command`
      const cmdInstance = actionArgs[actionArgs.length - 1] as Command;
      const opts = cmdInstance.optsWithGlobals() as GlobalOptions & Record<string, unknown>;

      try {
        const apiKey = await resolveApiKey(opts.apiKey);
        const client = new LeadMagicClient({ apiKey });

        // Build input from options
        const raw: Record<string, unknown> = {};

        if (cmdDef.cliMappings.options) {
          for (const optDef of cmdDef.cliMappings.options) {
            // Derive camelCase key from the flags string
            const flagMatch = optDef.flags.match(/--([a-z][a-z0-9-]*)/);
            if (!flagMatch) continue;
            const camelKey = flagMatch[1].replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
            const val = opts[camelKey];
            if (val !== undefined && val !== false) {
              raw[optDef.field] = val;
            }
          }
        }

        const parsed = cmdDef.inputSchema.safeParse(raw);
        if (!parsed.success) {
          const issues = parsed.error.issues;
          const missing = issues
            .filter((i) => i.code === 'custom' || i.message.includes('required'))
            .map((i) => i.message);
          const msg =
            missing.length > 0
              ? missing.join('; ')
              : issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
          throw new Error(msg);
        }

        const result = await cmdDef.handler(parsed.data, client);
        output(result, opts);
      } catch (error) {
        outputError(error, opts);
      }
    });
  }
}

export function registerAllCommands(program: Command): void {
  // Auth commands (top-level)
  registerLoginCommand(program);
  registerLogoutCommand(program);
  registerStatusCommand(program);
  registerMcpCommand(program);

  // Credits (top-level convenience command)
  program
    .command('credits')
    .description('Check your remaining LeadMagic credit balance')
    .option('--api-key <key>', 'API key (overrides stored key)')
    .option('--output <format>', 'Output format: json (default) or pretty')
    .option('--pretty', 'Pretty-print JSON output')
    .option('--quiet', 'Suppress output (exit code only)')
    .addHelpText('after', '\nExamples:\n  $ leadmagic credits\n  $ leadmagic credits --pretty')
    .action(async (opts: GlobalOptions) => {
      try {
        const apiKey = await resolveApiKey(opts.apiKey);
        const client = new LeadMagicClient({ apiKey });
        const result = await client.get<{ credits: number }>('/v1/credits');
        output(result, opts);
      } catch (error) {
        outputError(error, opts);
      }
    });

  // Group commands
  const groups = new Map<string, CommandDefinition[]>();
  for (const cmd of allCommands) {
    if (!groups.has(cmd.group)) groups.set(cmd.group, []);
    groups.get(cmd.group)!.push(cmd);
  }

  for (const [groupName, commands] of groups) {
    registerCommandGroup(program, groupName, commands);
  }
}
