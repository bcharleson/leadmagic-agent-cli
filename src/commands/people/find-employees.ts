import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import type { EmployeeFinderResponse } from '../../core/types.js';

export const findEmployeesCommand: CommandDefinition = {
  name: 'people_find_employees',
  group: 'people',
  subcommand: 'find-employees',
  description:
    'List employees at a company. Returns name, title, and company info for each employee. Default limit is 20 (max 100). Cost: 0.05 credits per employee returned (20 employees = 1 credit); free if no employees found.',
  examples: [
    'leadmagic people find-employees --company-domain stripe.com',
    'leadmagic people find-employees --company-name "Acme Corp" --limit 50',
    'leadmagic people find-employees --company-domain hubspot.com --limit 100 --pretty',
  ],
  inputSchema: z
    .object({
      company_domain: z.string().optional(),
      company_name: z.string().optional(),
      limit: z.coerce.number().min(1).max(100).default(20).optional(),
    })
    .refine(
      (d) => d.company_domain || d.company_name,
      'Provide either --company-domain or --company-name',
    ),
  cliMappings: {
    options: [
      { field: 'company_domain', flags: '--company-domain <domain>', description: 'Company domain (e.g. stripe.com)' },
      { field: 'company_name', flags: '--company-name <name>', description: 'Company name (alternative to domain)' },
      { field: 'limit', flags: '--limit <n>', description: 'Number of employees to return (1-100, default 20)' },
    ],
  },
  handler: async (input, client) => {
    return client.post<EmployeeFinderResponse>('/v1/people/employee-finder', {
      company_domain: input.company_domain,
      company_name: input.company_name,
      limit: input.limit,
    });
  },
};
