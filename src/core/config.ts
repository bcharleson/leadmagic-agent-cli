import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';
import { readFile, writeFile, mkdir } from 'fs/promises';

export interface Config {
  api_key?: string;
}

const CONFIG_DIR = join(homedir(), '.leadmagic-cli');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export async function loadConfig(): Promise<Config> {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    const raw = await readFile(CONFIG_FILE, 'utf8');
    return JSON.parse(raw) as Config;
  } catch {
    return {};
  }
}

export async function saveConfig(config: Config): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

export async function clearConfig(): Promise<void> {
  await saveConfig({});
}

export { CONFIG_FILE, CONFIG_DIR };
