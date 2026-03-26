import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import type { B2BProfileResponse } from '../../core/types.js';

export const emailToProfileCommand: CommandDefinition = {
  name: 'people_email_to_profile',
  group: 'people',
  subcommand: 'email-to-profile',
  description:
    'Reverse-lookup: find a LinkedIn profile URL from a work or personal email address. Cost: 10 credits if found; free if not found.',
  examples: [
    'leadmagic people email-to-profile --work-email john@acme.com',
    'leadmagic people email-to-profile --personal-email john.doe@gmail.com --pretty',
  ],
  inputSchema: z
    .object({
      work_email: z.string().email().optional(),
      personal_email: z.string().email().optional(),
    })
    .refine(
      (d) => d.work_email || d.personal_email,
      'Provide at least one of: --work-email, --personal-email',
    ),
  cliMappings: {
    options: [
      { field: 'work_email', flags: '--work-email <email>', description: 'Work email address' },
      { field: 'personal_email', flags: '--personal-email <email>', description: 'Personal email address' },
    ],
  },
  handler: async (input, client) => {
    return client.post<B2BProfileResponse>('/v1/people/b2b-profile', {
      work_email: input.work_email,
      personal_email: input.personal_email,
    });
  },
};
