import fs from 'fs/promises';
import path from 'path';
import { homedir } from 'os';
import type { Config } from '../types/index';

const CONFIG_DIR = path.join(homedir(), '.steam-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export async function loadConfig(): Promise<Config> {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Config doesn't exist yet, return empty
    return {};
  }
}

export async function saveConfig(config: Config): Promise<void> {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export async function getApiKey(): Promise<string | undefined> {
  // Check env var first
  if (process.env.STEAM_API_KEY) {
    return process.env.STEAM_API_KEY;
  }
  
  // Then check config file
  const config = await loadConfig();
  return config.apiKey;
}

export async function getSteamId(): Promise<string | undefined> {
  const config = await loadConfig();
  return config.steamId;
}

export async function getUsername(): Promise<string | undefined> {
  const config = await loadConfig();
  return config.username;
}
