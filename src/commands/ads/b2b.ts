import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import type { B2BAdsResponse } from '../../core/types.js';

export const b2bAdsCommand: CommandDefinition = {
  name: 'ads_b2b',
  group: 'ads',
  subcommand: 'b2b',
  description:
    'Find B2B LinkedIn ads running for a company. Returns ad content, links, and images targeting professional audiences. Cost: 0.2 credits if found; free if not found.',
  examples: [
    'leadmagic ads b2b --domain stripe.com',
    'leadmagic ads b2b --company-name "Salesforce" --pretty',
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
    return client.post<B2BAdsResponse>('/v1/ads/b2b-ads-search', {
      company_domain: input.company_domain,
      company_name: input.company_name,
    });
  },
};
