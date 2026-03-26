export { validateEmailCommand } from './validate-email.js';
export { findEmailCommand } from './find-email.js';
export { findMobileCommand } from './find-mobile.js';
export { profileCommand } from './profile.js';
export { emailToProfileCommand } from './email-to-profile.js';
export { profileToEmailCommand } from './profile-to-email.js';
export { personalEmailCommand } from './personal-email.js';
export { findRoleCommand } from './find-role.js';
export { findEmployeesCommand } from './find-employees.js';
export { jobChangeCommand } from './job-change.js';

import { validateEmailCommand } from './validate-email.js';
import { findEmailCommand } from './find-email.js';
import { findMobileCommand } from './find-mobile.js';
import { profileCommand } from './profile.js';
import { emailToProfileCommand } from './email-to-profile.js';
import { profileToEmailCommand } from './profile-to-email.js';
import { personalEmailCommand } from './personal-email.js';
import { findRoleCommand } from './find-role.js';
import { findEmployeesCommand } from './find-employees.js';
import { jobChangeCommand } from './job-change.js';

export const peopleCommands = [
  validateEmailCommand,
  findEmailCommand,
  findMobileCommand,
  profileCommand,
  emailToProfileCommand,
  profileToEmailCommand,
  personalEmailCommand,
  findRoleCommand,
  findEmployeesCommand,
  jobChangeCommand,
];
