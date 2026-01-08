import SteamAPI from 'steamapi';
import { getApiKey, getSteamId, saveConfig, loadConfig } from './config.js';
import type { GameInfo } from '../types/index.js';

let steamClient: SteamAPI | null = null;

export async function getSteamClient(): Promise<SteamAPI> {
  if (steamClient) {
    return steamClient;
  }

  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error(
      'Steam API key not found. Set STEAM_API_KEY env var or run: steam config set-key <key>'
    );
  }

  steamClient = new SteamAPI(apiKey);
  return steamClient;
}

export async function resolveUser(usernameOrId: string): Promise<string> {
  const client = await getSteamClient();
  
  // If it looks like a Steam ID (all digits), return as-is
  if (/^\d+$/.test(usernameOrId)) {
    return usernameOrId;
  }
  
  // Otherwise resolve the vanity URL
  return await client.resolve(usernameOrId);
}

export async function getUserLibrary(steamId?: string): Promise<GameInfo[]> {
  const client = await getSteamClient();
  
  // Use provided steamId or get from config
  const id = steamId || await getSteamId();
  if (!id) {
    throw new Error('Steam ID not configured. Run: steam config set-user <username>');
  }

  const games = await client.getUserOwnedGames(id);
  
  return games.map((game: any) => ({
    appId: game.appID,
    name: game.name,
    playtime: game.playTime,
    playtimeLastTwoWeeks: game.playTime2,
    imgIconUrl: game.iconURL,
    imgLogoUrl: game.logoURL
  }));
}

export async function getGameDetails(appId: number) {
  const client = await getSteamClient();
  return await client.getGameDetails(appId);
}

export async function setConfiguredUser(usernameOrId: string): Promise<void> {
  const steamId = await resolveUser(usernameOrId);
  const config = await loadConfig();
  
  config.steamId = steamId;
  config.username = usernameOrId;
  
  await saveConfig(config);
}
