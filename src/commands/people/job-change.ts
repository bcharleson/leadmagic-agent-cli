import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import type { JobChangeResponse } from '../../core/types.js';

export const jobChangeCommand: CommandDefinition = {
  name: 'people_job_change',
  group: 'people',
  subcommand: 'job-change',
  description:
    'Detect if a person has changed jobs or left a specific company. Returns status (NO_CHANGE, JOB_CHANGE_DETECTED, NEVER_WORKED_THERE), current position, and work history. Useful for churn detection and re-engagement. Cost: 3 credits always charged regardless of result.',
  examples: [
    'leadmagic people job-change --profile-url https://linkedin.com/in/johndoe --company-domain acme.com',
    'leadmagic people job-change --profile-url https://linkedin.com/in/janedoe --company-name "Old Corp" --pretty',
  ],
  inputSchema: z
    .object({
      profile_url: z.string().url('Must be a valid LinkedIn profile URL'),
      company_domain: z.string().optional(),
      company_name: z.string().optional(),
    })
    .refine(
      (d) => d.company_domain || d.company_name,
      'Provide either --company-domain or --company-name',
    ),
  cliMappings: {
    options: [
      { field: 'profile_url', flags: '--profile-url <url>', description: 'LinkedIn profile URL (required)' },
      { field: 'company_domain', flags: '--company-domain <domain>', description: 'Company domain to check against' },
      { field: 'company_name', flags: '--company-name <name>', description: 'Company name to check against' },
    ],
  },
  handler: async (input, client) => {
    return client.post<JobChangeResponse>('/v1/people/job-change-detector', {
      profile_url: input.profile_url,
      company_domain: input.company_domain,
      company_name: input.company_name,
    });
  },
};
