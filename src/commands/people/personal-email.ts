import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import type { PersonalEmailFinderResponse } from '../../core/types.js';

export const personalEmailCommand: CommandDefinition = {
  name: 'people_personal_email',
  group: 'people',
  subcommand: 'personal-email',
  description:
    'Find personal email addresses for a person from their LinkedIn profile URL. Returns all personal emails found plus the primary one. Cost: 2 credits if found; free if not found.',
  examples: [
    'leadmagic people personal-email --profile-url https://linkedin.com/in/johndoe',
    'leadmagic people personal-email --profile-url https://linkedin.com/in/janedoe --pretty',
  ],
  inputSchema: z.object({
    profile_url: z.string().url('Must be a valid LinkedIn profile URL'),
  }),
  cliMappings: {
    options: [
      { field: 'profile_url', flags: '--profile-url <url>', description: 'LinkedIn profile URL (required)' },
    ],
  },
  handler: async (input, client) => {
    return client.post<PersonalEmailFinderResponse>('/v1/people/personal-email-finder', {
      profile_url: input.profile_url,
    });
  },
};
