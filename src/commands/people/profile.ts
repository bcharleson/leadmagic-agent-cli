import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import type { ProfileSearchResponse } from '../../core/types.js';

export const profileCommand: CommandDefinition = {
  name: 'people_profile',
  group: 'people',
  subcommand: 'profile',
  description:
    'Fetch a full LinkedIn profile by URL. Returns name, title, bio, company, location, work experience, education, and certifications. Use --extended for profile image. Cost: 1 credit if found; free if not found. Rate limit: 100 req/min.',
  examples: [
    'leadmagic people profile --profile-url https://linkedin.com/in/johndoe',
    'leadmagic people profile --profile-url https://linkedin.com/in/janedoe --extended',
    'leadmagic people profile --profile-url https://linkedin.com/in/johndoe --skip-cache --pretty',
  ],
  inputSchema: z.object({
    profile_url: z.string().url('Must be a valid LinkedIn profile URL'),
    extended_response: z.boolean().optional().default(false),
    skip_cache: z.boolean().optional().default(false),
  }),
  cliMappings: {
    options: [
      { field: 'profile_url', flags: '--profile-url <url>', description: 'LinkedIn profile URL (required)' },
      { field: 'extended_response', flags: '--extended', description: 'Include profile image URL in response' },
      { field: 'skip_cache', flags: '--skip-cache', description: 'Force fresh data (bypasses cache)' },
    ],
  },
  handler: async (input, client) => {
    return client.post<ProfileSearchResponse>('/v1/people/profile-search', {
      profile_url: input.profile_url,
      extended_response: input.extended_response || undefined,
      skip_cache: input.skip_cache || undefined,
    });
  },
};
