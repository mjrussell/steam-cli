import SteamAPI from 'steamapi';
import { getApiKey, getSteamId, saveConfig, loadConfig } from './config.js';
let steamClient = null;
export async function getSteamClient() {
    if (steamClient) {
        return steamClient;
    }
    const apiKey = await getApiKey();
    if (!apiKey) {
        throw new Error('Steam API key not found. Set STEAM_API_KEY env var or run: steam config set-key <key>');
    }
    // Configure with localhost referer for domain-restricted API keys
    steamClient = new SteamAPI(apiKey, {
        headers: {
            'Referer': 'http://localhost/',
            'Origin': 'http://localhost'
        }
    });
    return steamClient;
}
export async function resolveUser(usernameOrId) {
    const client = await getSteamClient();
    // If it looks like a Steam ID (all digits), return as-is
    if (/^\d+$/.test(usernameOrId)) {
        return usernameOrId;
    }
    // Otherwise resolve the vanity URL
    return await client.resolve(usernameOrId);
}
export async function getUserLibrary(steamId) {
    const client = await getSteamClient();
    // Use provided steamId or get from config
    const id = steamId || await getSteamId();
    if (!id) {
        throw new Error('Steam ID not configured. Run: steam config set-user <username>');
    }
    const games = await client.getUserOwnedGames(id, {
        includeAppInfo: true,
        includeFreeGames: true
    });
    return games.map((userPlaytime) => ({
        appId: userPlaytime.game.id,
        name: userPlaytime.game.name,
        playtime: userPlaytime.minutes,
        playtimeLastTwoWeeks: userPlaytime.recentMinutes,
        imgIconUrl: userPlaytime.game.iconURL,
        imgLogoUrl: userPlaytime.game.logoURL
    }));
}
export async function getGameDetails(appId) {
    const client = await getSteamClient();
    return await client.getGameDetails(appId);
}
export async function setConfiguredUser(usernameOrId) {
    const steamId = await resolveUser(usernameOrId);
    const config = await loadConfig();
    config.steamId = steamId;
    config.username = usernameOrId;
    await saveConfig(config);
}
