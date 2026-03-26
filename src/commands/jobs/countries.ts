import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import type { JobCountry } from '../../core/types.js';

export const jobCountriesCommand: CommandDefinition = {
  name: 'jobs_countries',
  group: 'jobs',
  subcommand: 'countries',
  description:
    'Get the list of supported countries for job search filtering. Returns country IDs, names, and codes. Use the country_id values with the jobs find command. Free — no credits used.',
  examples: [
    'leadmagic jobs countries',
    'leadmagic jobs countries --pretty',
  ],
  inputSchema: z.object({}),
  cliMappings: {
    options: [],
  },
  handler: async (_input, client) => {
    return client.post<JobCountry[]>('/v1/jobs/get-job-countries');
  },
};
