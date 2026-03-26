import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import type { GoogleAdsResponse } from '../../core/types.js';

export const googleAdsCommand: CommandDefinition = {
  name: 'ads_google',
  group: 'ads',
  subcommand: 'google',
  description:
    'Find Google Ads currently running for a company. Returns ad headlines, descriptions, display URLs, final URLs, and ad types. Useful for competitive intelligence and ad copy research. Cost: 0.2 credits if found; free if not found.',
  examples: [
    'leadmagic ads google --domain stripe.com',
    'leadmagic ads google --company-name "HubSpot" --pretty',
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
    return client.post<GoogleAdsResponse>('/v1/ads/google-ads-search', {
      company_domain: input.company_domain,
      company_name: input.company_name,
    });
  },
};
