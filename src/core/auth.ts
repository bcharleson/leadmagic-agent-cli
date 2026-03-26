import { loadConfig } from './config.js';
import { AuthError } from './errors.js';

export const ENV_VAR = 'LEADMAGIC_API_KEY';

export async function resolveApiKey(flagKey?: string): Promise<string> {
  // 1. CLI flag (--api-key)
  if (flagKey) return flagKey;

  // 2. Environment variable
  const envKey = process.env[ENV_VAR];
  if (envKey) return envKey;

  // 3. Stored config (~/.leadmagic-cli/config.json)
  const config = await loadConfig();
  if (config.api_key) return config.api_key;

  throw new AuthError(
    `No API key found. Set ${ENV_VAR}, use --api-key, or run: leadmagic login`,
  );
}
