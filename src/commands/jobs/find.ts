import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import type { JobsFinderResponse } from '../../core/types.js';

export const jobsFindCommand: CommandDefinition = {
  name: 'jobs_find',
  group: 'jobs',
  subcommand: 'find',
  description:
    'Search job postings with rich filters: company, title, location, experience level, remote, salary, and more. Paginated (default 20, max 50 per page). Cost: 1 credit per job returned; free if no results. Rate limit: 100 req/min.',
  examples: [
    'leadmagic jobs find --job-title "Software Engineer" --company-domain stripe.com',
    'leadmagic jobs find --job-title "Sales Manager" --has-remote --experience-level senior',
    'leadmagic jobs find --company-name "Acme Corp" --location "San Francisco" --per-page 50 --pretty',
    'leadmagic jobs find --job-title "DevOps" --posted-within 7d --page 2',
  ],
  inputSchema: z.object({
    company_name: z.string().optional(),
    company_website: z.string().optional(),
    job_title: z.string().optional(),
    job_description: z.string().optional(),
    experience_level: z.enum(['entry', 'mid', 'senior', 'executive']).optional(),
    has_remote: z
      .union([z.boolean(), z.string().transform((v) => v === 'true')])
      .optional(),
    location: z.string().optional(),
    city_name: z.string().optional(),
    posted_within: z.string().optional(),
    posted_after: z.string().optional(),
    posted_before: z.string().optional(),
    page: z.coerce.number().min(1).default(1).optional(),
    per_page: z.coerce.number().min(1).max(50).default(20).optional(),
  }),
  cliMappings: {
    options: [
      { field: 'company_name', flags: '--company-name <name>', description: 'Filter by company name' },
      { field: 'company_website', flags: '--company-domain <domain>', description: 'Filter by company domain' },
      { field: 'job_title', flags: '--job-title <title>', description: 'Filter by job title' },
      { field: 'job_description', flags: '--description <text>', description: 'Filter by description keyword' },
      { field: 'experience_level', flags: '--experience-level <level>', description: 'entry | mid | senior | executive' },
      { field: 'has_remote', flags: '--has-remote', description: 'Only return remote jobs' },
      { field: 'location', flags: '--location <location>', description: 'Filter by location (city, state, country)' },
      { field: 'city_name', flags: '--city <city>', description: 'Filter by city name' },
      { field: 'posted_within', flags: '--posted-within <days>', description: 'Jobs posted within N days (e.g. 7, 30)' },
      { field: 'posted_after', flags: '--posted-after <date>', description: 'Jobs posted after this date (YYYY-MM-DD)' },
      { field: 'posted_before', flags: '--posted-before <date>', description: 'Jobs posted before this date (YYYY-MM-DD)' },
      { field: 'page', flags: '--page <n>', description: 'Page number (default 1)' },
      { field: 'per_page', flags: '--per-page <n>', description: 'Results per page (1-50, default 20)' },
    ],
  },
  handler: async (input, client) => {
    return client.post<JobsFinderResponse>('/v1/jobs/jobs-finder', {
      company_name: input.company_name,
      company_website: input.company_website,
      job_title: input.job_title,
      job_description: input.job_description,
      experience_level: input.experience_level,
      has_remote: input.has_remote,
      location: input.location,
      city_name: input.city_name,
      posted_within: input.posted_within,
      posted_after: input.posted_after,
      posted_before: input.posted_before,
      page: input.page,
      per_page: input.per_page,
    });
  },
};
