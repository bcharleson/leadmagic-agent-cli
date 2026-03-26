import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import type { RoleFinderResponse } from '../../core/types.js';

export const findRoleCommand: CommandDefinition = {
  name: 'people_find_role',
  group: 'people',
  subcommand: 'find-role',
  description:
    'Find the person holding a specific job title at a company. Returns name, LinkedIn profile URL, and company info. Useful for finding decision-makers (e.g., "VP of Sales" at "Stripe"). Cost: 2 credits if found; free if not found.',
  examples: [
    'leadmagic people find-role --job-title "VP of Sales" --company-domain stripe.com',
    'leadmagic people find-role --job-title "CTO" --company-name "Acme Corp" --pretty',
    'leadmagic people find-role --job-title "Head of Marketing" --company-domain hubspot.com',
  ],
  inputSchema: z
    .object({
      job_title: z.string().min(1, 'Job title is required'),
      company_domain: z.string().optional(),
      company_name: z.string().optional(),
    })
    .refine(
      (d) => d.company_domain || d.company_name,
      'Provide either --company-domain or --company-name',
    ),
  cliMappings: {
    options: [
      { field: 'job_title', flags: '--job-title <title>', description: 'Job title to search for (required)' },
      { field: 'company_domain', flags: '--company-domain <domain>', description: 'Company domain (e.g. stripe.com)' },
      { field: 'company_name', flags: '--company-name <name>', description: 'Company name (alternative to domain)' },
    ],
  },
  handler: async (input, client) => {
    return client.post<RoleFinderResponse>('/v1/people/role-finder', {
      job_title: input.job_title,
      company_domain: input.company_domain,
      company_name: input.company_name,
    });
  },
};
