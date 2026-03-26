import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import type { JobType } from '../../core/types.js';

export const jobTypesCommand: CommandDefinition = {
  name: 'jobs_types',
  group: 'jobs',
  subcommand: 'types',
  description:
    'Get the list of supported job types for job search filtering (e.g. Full-time, Part-time, Contract, Internship). Returns type IDs and names. Use the type IDs with the jobs find command. Free — no credits used.',
  examples: [
    'leadmagic jobs types',
    'leadmagic jobs types --pretty',
  ],
  inputSchema: z.object({}),
  cliMappings: {
    options: [],
  },
  handler: async (_input, client) => {
    return client.post<JobType[]>('/v1/jobs/get-job-types');
  },
};
