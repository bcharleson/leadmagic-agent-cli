import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import type { CompanyFundingResponse } from '../../core/types.js';

export const fundingCommand: CommandDefinition = {
  name: 'companies_funding',
  group: 'companies',
  subcommand: 'funding',
  description:
    'Get detailed funding history and financial data for a company. Returns funding rounds, investors, total raised, acquisitions, leadership, top competitors, and recent news. Cost: 4 credits if found; free if not found.',
  examples: [
    'leadmagic companies funding --domain stripe.com',
    'leadmagic companies funding --company-name "Stripe" --pretty',
  ],
  inputSchema: z
    .object({
      company_domain: z.string().optional(),
      company_name: z.string().optional(),
    })
    .refine(
      (d) => d.company_domain || d.company_name,
      'Provide either --domain or --company-name',
    ),
  cliMappings: {
    options: [
      { field: 'company_domain', flags: '--domain <domain>', description: 'Company domain (e.g. stripe.com)' },
      { field: 'company_name', flags: '--company-name <name>', description: 'Company name' },
    ],
  },
  handler: async (input, client) => {
    return client.post<CompanyFundingResponse>('/v1/companies/company-funding', {
      company_domain: input.company_domain,
      company_name: input.company_name,
    });
  },
};
