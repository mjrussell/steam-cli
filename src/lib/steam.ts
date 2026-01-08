import SteamAPI from 'steamapi';
import { getApiKey, getSteamId, saveConfig, loadConfig } from './config';
import type { GameInfo, ReviewData } from '../types/index';

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

  // Configure with localhost referer for domain-restricted API keys
  steamClient = new SteamAPI(apiKey, {
    headers: {
      'Referer': 'http://localhost/',
      'Origin': 'http://localhost'
    }
  } as any);
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

  // Make direct API call to get Deck playtime (library doesn't expose it)
  const apiKey = await getApiKey();
  const response = await fetch(
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${id}&include_appinfo=1&include_played_free_games=1&format=json`,
    {
      headers: {
        'Referer': 'http://localhost/',
        'Origin': 'http://localhost'
      }
    }
  );
  
  const data = await response.json() as any;
  const games = data.response?.games || [];
  
  return games.map((game: any) => ({
    appId: game.appid,
    name: game.name,
    playtime: game.playtime_forever,
    playtimeLastTwoWeeks: game.playtime_2weeks || 0,
    playtimeDeck: game.playtime_deck_forever || 0,
    imgIconUrl: game.img_icon_url,
    imgLogoUrl: game.img_logo_url
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

export async function getGameReviews(appId: number): Promise<ReviewData | null> {
  try {
    const response = await fetch(
      `https://store.steampowered.com/appreviews/${appId}?json=1&language=all&purchase_type=all`
    );
    const data = await response.json() as any;
    
    if (!data.query_summary) {
      return null;
    }
    
    const summary = data.query_summary;
    return {
      reviewScore: summary.review_score || 0,
      reviewScoreDesc: summary.review_score_desc || 'No Reviews',
      totalPositive: summary.total_positive || 0,
      totalNegative: summary.total_negative || 0,
      totalReviews: summary.total_reviews || 0
    };
  } catch {
    return null;
  }
}

export async function enrichGamesWithReviews(
  games: GameInfo[],
  onProgress?: (current: number, total: number) => void
): Promise<GameInfo[]> {
  const enriched: GameInfo[] = [];
  
  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    onProgress?.(i + 1, games.length);
    
    const reviews = await getGameReviews(game.appId);
    
    enriched.push({
      ...game,
      reviewScore: reviews?.reviewScore,
      reviewScoreDesc: reviews?.reviewScoreDesc,
      reviewPositive: reviews?.totalPositive,
      reviewNegative: reviews?.totalNegative
    });
    
    // Small delay to avoid rate limiting
    if (i < games.length - 1) {
      await new Promise(r => setTimeout(r, 50));
    }
  }
  
  return enriched;
}
