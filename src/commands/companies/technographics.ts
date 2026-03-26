import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import type { TechnographicsResponse } from '../../core/types.js';

export const technographicsCommand: CommandDefinition = {
  name: 'companies_technographics',
  group: 'companies',
  subcommand: 'technographics',
  description:
    'Get the technology stack for a company by domain. Returns all detected technologies with categories and sub-technologies. Useful for sales targeting (e.g., "companies using Salesforce"). Cost: 1 credit if found; free if not found.',
  examples: [
    'leadmagic companies technographics --domain stripe.com',
    'leadmagic companies technographics --domain hubspot.com --pretty',
    'leadmagic companies technographics --domain salesforce.com --fields name,categories',
  ],
  inputSchema: z.object({
    company_domain: z.string().min(1, 'Company domain is required'),
  }),
  cliMappings: {
    options: [
      { field: 'company_domain', flags: '--domain <domain>', description: 'Company domain (required, e.g. stripe.com)' },
    ],
  },
  handler: async (input, client) => {
    return client.post<TechnographicsResponse>('/v1/companies/technographics', {
      company_domain: input.company_domain,
    });
  },
};
