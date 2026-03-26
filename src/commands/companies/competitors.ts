import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import type { CompetitorsResponse } from '../../core/types.js';

export const competitorsCommand: CommandDefinition = {
  name: 'companies_competitors',
  group: 'companies',
  subcommand: 'competitors',
  description:
    'Find competitors for a company. Returns a list of competing companies with descriptions, employee counts, valuations, and funding data. Cost: 5 credits if found; free if not found.',
  examples: [
    'leadmagic companies competitors --domain stripe.com',
    'leadmagic companies competitors --company-name "Stripe" --pretty',
    'leadmagic companies competitors --company-url https://stripe.com',
  ],
  inputSchema: z
    .object({
      company_domain: z.string().optional(),
      company_url: z.string().url().optional(),
      company_name: z.string().optional(),
    })
    .refine(
      (d) => d.company_domain || d.company_url || d.company_name,
      'Provide at least one of: --domain, --company-url, --company-name',
    ),
  cliMappings: {
    options: [
      { field: 'company_domain', flags: '--domain <domain>', description: 'Company domain (e.g. stripe.com)' },
      { field: 'company_url', flags: '--company-url <url>', description: 'Company website URL' },
      { field: 'company_name', flags: '--company-name <name>', description: 'Company name' },
    ],
  },
  handler: async (input, client) => {
    return client.post<CompetitorsResponse>('/v1/companies/competitors-search', {
      company_domain: input.company_domain,
      company_url: input.company_url,
      company_name: input.company_name,
    });
  },
};
