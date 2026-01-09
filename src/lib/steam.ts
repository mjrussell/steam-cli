import SteamAPI from 'steamapi';
import { getApiKey, getSteamId, saveConfig, loadConfig } from './config';
import type { GameInfo, ReviewData, DeckCompatCategory } from '../types/index';
import { DECK_COMPAT_LABELS } from '../types/index';

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

export interface GenreTagData {
  genres: string[];
  tags: string[];
}

export async function getGameGenresTags(appId: number): Promise<GenreTagData | null> {
  try {
    const response = await fetch(
      `https://steamspy.com/api.php?request=appdetails&appid=${appId}`
    );
    const data = await response.json() as any;
    
    const genres = data.genre 
      ? data.genre.split(', ').map((g: string) => g.trim()).filter(Boolean)
      : [];
    
    const tags = data.tags 
      ? Object.keys(data.tags)
      : [];
    
    return { genres, tags };
  } catch {
    return null;
  }
}

export async function getDeckCompatibility(appId: number): Promise<DeckCompatCategory | null> {
  try {
    const response = await fetch(
      `https://store.steampowered.com/saleaction/ajaxgetdeckappcompatibilityreport?nAppID=${appId}`
    );
    const data = await response.json() as any;
    
    if (data.success !== 1 || !data.results) {
      return null;
    }
    
    return (data.results.resolved_category as DeckCompatCategory) ?? null;
  } catch {
    return null;
  }
}

export interface EnrichOptions {
  reviews?: boolean;
  deckCompat?: boolean;
  genresTags?: boolean;
}

export interface FilterOptions {
  reviewScores?: number[];
  minReviewScore?: number;
  maxReviewScore?: number;
  deckCompatValues?: DeckCompatCategory[];
  genres?: string[];
  tags?: string[];
}

export async function enrichAndFilter(
  games: GameInfo[],
  enrich: EnrichOptions,
  filter: FilterOptions,
  limit?: number,
  onProgress?: (checked: number, found: number, total: number) => void
): Promise<GameInfo[]> {
  const results: GameInfo[] = [];
  
  for (let i = 0; i < games.length; i++) {
    // Early termination if we have enough
    if (limit && results.length >= limit) {
      break;
    }
    
    const game = games[i];
    onProgress?.(i + 1, results.length, games.length);
    
    // Fetch needed data in parallel
    const [reviews, compat, genresTags] = await Promise.all([
      enrich.reviews ? getGameReviews(game.appId) : Promise.resolve(null),
      enrich.deckCompat ? getDeckCompatibility(game.appId) : Promise.resolve(null),
      enrich.genresTags ? getGameGenresTags(game.appId) : Promise.resolve(null)
    ]);
    
    // Build enriched game
    const enriched: GameInfo = {
      ...game,
      ...(enrich.reviews && {
        reviewScore: reviews?.reviewScore,
        reviewScoreDesc: reviews?.reviewScoreDesc,
        reviewPositive: reviews?.totalPositive,
        reviewNegative: reviews?.totalNegative
      }),
      ...(enrich.deckCompat && {
        deckCompat: compat ?? undefined,
        deckCompatDesc: compat !== null ? DECK_COMPAT_LABELS[compat] : undefined
      }),
      ...(enrich.genresTags && {
        genres: genresTags?.genres,
        tags: genresTags?.tags
      })
    };
    
    // Check filters
    let passes = true;
    
    if (filter.reviewScores && enriched.reviewScore !== undefined) {
      passes = passes && filter.reviewScores.includes(enriched.reviewScore);
    }
    
    if (filter.minReviewScore !== undefined) {
      passes = passes && (enriched.reviewScore || 0) >= filter.minReviewScore;
    }
    
    if (filter.maxReviewScore !== undefined) {
      passes = passes && (enriched.reviewScore || 0) <= filter.maxReviewScore;
    }
    
    if (filter.deckCompatValues) {
      passes = passes && enriched.deckCompat !== undefined && 
               filter.deckCompatValues.includes(enriched.deckCompat);
    }
    
    if (filter.genres && filter.genres.length > 0) {
      const gameGenres = enriched.genres?.map(g => g.toLowerCase()) || [];
      passes = passes && filter.genres.some(fg => 
        gameGenres.some(gg => gg.includes(fg.toLowerCase()))
      );
    }
    
    if (filter.tags && filter.tags.length > 0) {
      const gameTags = enriched.tags?.map(t => t.toLowerCase()) || [];
      passes = passes && filter.tags.some(ft => 
        gameTags.some(gt => gt.includes(ft.toLowerCase()))
      );
    }
    
    if (passes) {
      results.push(enriched);
    }
    
    // Small delay to avoid rate limiting
    if (i < games.length - 1 && (!limit || results.length < limit)) {
      await new Promise(r => setTimeout(r, 50));
    }
  }
  
  return results;
}
