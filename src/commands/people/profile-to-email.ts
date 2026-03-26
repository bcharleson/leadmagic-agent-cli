import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import type { B2BProfileEmailResponse } from '../../core/types.js';

export const profileToEmailCommand: CommandDefinition = {
  name: 'people_profile_to_email',
  group: 'people',
  subcommand: 'profile-to-email',
  description:
    'Find a professional work email from a LinkedIn profile URL. Cost: 5 credits if found; free if not found.',
  examples: [
    'leadmagic people profile-to-email --profile-url https://linkedin.com/in/johndoe',
    'leadmagic people profile-to-email --profile-url https://linkedin.com/in/janedoe --pretty',
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
    return client.post<B2BProfileEmailResponse>('/v1/people/b2b-profile-email', {
      profile_url: input.profile_url,
    });
  },
};
