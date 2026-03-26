import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import type { EmailFinderResponse } from '../../core/types.js';

export const findEmailCommand: CommandDefinition = {
  name: 'people_find_email',
  group: 'people',
  subcommand: 'find-email',
  description:
    'Find a professional email address by name and company domain or name. Provide first+last name OR full name, plus company domain or company name. Cost: 1 credit if found; free if not found.',
  examples: [
    'leadmagic people find-email --first-name John --last-name Smith --domain acme.com',
    'leadmagic people find-email --full-name "Jane Doe" --company-name "Stripe"',
    'leadmagic people find-email --first-name Sarah --last-name Connor --domain skynet.io --pretty',
  ],
  inputSchema: z
    .object({
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      full_name: z.string().optional(),
      domain: z.string().optional(),
      company_name: z.string().optional(),
    })
    .refine(
      (d) => (d.first_name && d.last_name) || d.full_name,
      'Provide either --first-name + --last-name OR --full-name',
    )
    .refine(
      (d) => d.domain || d.company_name,
      'Provide either --domain or --company-name',
    ),
  cliMappings: {
    options: [
      { field: 'first_name', flags: '--first-name <name>', description: 'First name' },
      { field: 'last_name', flags: '--last-name <name>', description: 'Last name' },
      { field: 'full_name', flags: '--full-name <name>', description: 'Full name (alternative to first/last)' },
      { field: 'domain', flags: '--domain <domain>', description: 'Company domain (e.g. stripe.com)' },
      { field: 'company_name', flags: '--company-name <name>', description: 'Company name (alternative to domain)' },
    ],
  },
  handler: async (input, client) => {
    return client.post<EmailFinderResponse>('/v1/people/email-finder', {
      first_name: input.first_name,
      last_name: input.last_name,
      full_name: input.full_name,
      domain: input.domain,
      company_name: input.company_name,
    });
  },
};
