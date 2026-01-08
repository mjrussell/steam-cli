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
    // Make direct API call to get Deck playtime (library doesn't expose it)
    const apiKey = await getApiKey();
    const response = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${id}&include_appinfo=1&include_played_free_games=1&format=json`, {
        headers: {
            'Referer': 'http://localhost/',
            'Origin': 'http://localhost'
        }
    });
    const data = await response.json();
    const games = data.response?.games || [];
    return games.map((game) => ({
        appId: game.appid,
        name: game.name,
        playtime: game.playtime_forever,
        playtimeLastTwoWeeks: game.playtime_2weeks || 0,
        playtimeDeck: game.playtime_deck_forever || 0,
        imgIconUrl: game.img_icon_url,
        imgLogoUrl: game.img_logo_url
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
