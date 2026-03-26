import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import type { CompanySearchResponse } from '../../core/types.js';

export const companySearchCommand: CommandDefinition = {
  name: 'companies_search',
  group: 'companies',
  subcommand: 'search',
  description:
    'Search for company information by domain, LinkedIn URL, or company name. Returns industry, employee count, revenue, funding, headquarters, specialties, and competitors. Cost: 1 credit if found. Rate limit: 100 req/min.',
  examples: [
    'leadmagic companies search --domain stripe.com',
    'leadmagic companies search --company-name "Acme Corp" --pretty',
    'leadmagic companies search --profile-url https://linkedin.com/company/stripe',
  ],
  inputSchema: z
    .object({
      company_domain: z.string().optional(),
      profile_url: z.string().url().optional(),
      company_name: z.string().optional(),
    })
    .refine(
      (d) => d.company_domain || d.profile_url || d.company_name,
      'Provide at least one of: --domain, --profile-url, --company-name',
    ),
  cliMappings: {
    options: [
      { field: 'company_domain', flags: '--domain <domain>', description: 'Company domain (e.g. stripe.com)' },
      { field: 'profile_url', flags: '--profile-url <url>', description: 'LinkedIn company URL' },
      { field: 'company_name', flags: '--company-name <name>', description: 'Company name' },
    ],
  },
  handler: async (input, client) => {
    return client.post<CompanySearchResponse>('/v1/companies/company-search', {
      company_domain: input.company_domain,
      profile_url: input.profile_url,
      company_name: input.company_name,
    });
  },
};
