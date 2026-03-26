import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import type { MobileFinderResponse } from '../../core/types.js';

export const findMobileCommand: CommandDefinition = {
  name: 'people_find_mobile',
  group: 'people',
  subcommand: 'find-mobile',
  description:
    'Find a mobile/phone number for a person. Provide a LinkedIn profile URL, work email, or personal email. At least one identifier is required. Cost: 5 credits if found; free if not found.',
  examples: [
    'leadmagic people find-mobile --profile-url https://linkedin.com/in/johndoe',
    'leadmagic people find-mobile --work-email john@acme.com',
    'leadmagic people find-mobile --personal-email john.doe@gmail.com --pretty',
  ],
  inputSchema: z
    .object({
      profile_url: z.string().url().optional(),
      work_email: z.string().email().optional(),
      personal_email: z.string().email().optional(),
    })
    .refine(
      (d) => d.profile_url || d.work_email || d.personal_email,
      'Provide at least one of: --profile-url, --work-email, --personal-email',
    ),
  cliMappings: {
    options: [
      { field: 'profile_url', flags: '--profile-url <url>', description: 'LinkedIn profile URL' },
      { field: 'work_email', flags: '--work-email <email>', description: 'Work email address' },
      { field: 'personal_email', flags: '--personal-email <email>', description: 'Personal email address' },
    ],
  },
  handler: async (input, client) => {
    return client.post<MobileFinderResponse>('/v1/people/mobile-finder', {
      profile_url: input.profile_url,
      work_email: input.work_email,
      personal_email: input.personal_email,
    });
  },
};
