import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import type { EmailValidationResponse } from '../../core/types.js';

export const validateEmailCommand: CommandDefinition = {
  name: 'people_validate_email',
  group: 'people',
  subcommand: 'validate-email',
  description:
    'Validate an email address and get company context. Returns status (valid/invalid/unknown), catch-all detection, MX records, and company enrichment. Cost: 0.25 credits for valid/invalid; free for unknown.',
  examples: [
    'leadmagic people validate-email --email john@acme.com',
    'leadmagic people validate-email --email ceo@stripe.com --pretty',
  ],
  inputSchema: z.object({
    email: z.string().email('Must be a valid email address'),
  }),
  cliMappings: {
    options: [
      { field: 'email', flags: '--email <email>', description: 'Email address to validate (required)' },
    ],
  },
  handler: async (input, client) => {
    return client.post<EmailValidationResponse>('/v1/people/email-validation', {
      email: input.email,
    });
  },
};
