import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import type { MetaAdsResponse } from '../../core/types.js';

export const metaAdsCommand: CommandDefinition = {
  name: 'ads_meta',
  group: 'ads',
  subcommand: 'meta',
  description:
    'Find Meta (Facebook/Instagram) ads running for a company. Returns ad content, images, video URLs, platform, and start dates. Cost: 0.2 credits if found; free if not found.',
  examples: [
    'leadmagic ads meta --domain stripe.com',
    'leadmagic ads meta --company-name "Shopify" --pretty',
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
    return client.post<MetaAdsResponse>('/v1/ads/meta-ads-search', {
      company_domain: input.company_domain,
      company_name: input.company_name,
    });
  },
};
