export { jobsFindCommand } from './find.js';
export { jobCountriesCommand } from './countries.js';
export { jobTypesCommand } from './types.js';

import { jobsFindCommand } from './find.js';
import { jobCountriesCommand } from './countries.js';
import { jobTypesCommand } from './types.js';

export const jobsCommands = [
  jobsFindCommand,
  jobCountriesCommand,
  jobTypesCommand,
];
