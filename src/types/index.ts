export interface Config {
  apiKey?: string;
  steamId?: string;
  username?: string;
}

export interface GameInfo {
  appId: number;
  name: string;
  playtime: number;
  playtimeLastTwoWeeks?: number;
  playtimeDeck?: number;
  imgIconUrl?: string;
  imgLogoUrl?: string;
  reviewScore?: number;
  reviewScoreDesc?: string;
  reviewPositive?: number;
  reviewNegative?: number;
  deckCompat?: DeckCompatCategory;
  deckCompatDesc?: string;
}

export type DeckCompatCategory = 0 | 1 | 2 | 3;

export const DECK_COMPAT_LABELS: Record<DeckCompatCategory, string> = {
  0: 'Unknown',
  1: 'Unsupported',
  2: 'Playable',
  3: 'Verified'
};

export interface ReviewData {
  reviewScore: number;
  reviewScoreDesc: string;
  totalPositive: number;
  totalNegative: number;
  totalReviews: number;
}

export const REVIEW_CATEGORIES = [
  'overwhelmingly-negative',
  'very-negative', 
  'negative',
  'mostly-negative',
  'mixed',
  'mostly-positive',
  'positive',
  'very-positive',
  'overwhelmingly-positive'
] as const;

export type ReviewCategory = typeof REVIEW_CATEGORIES[number];

export interface GameDetails {
  name: string;
  appId: number;
  description: string;
  shortDescription: string;
  developers: string[];
  publishers: string[];
  genres: string[];
  categories: string[];
  tags: string[];
  price?: {
    current: number;
    original: number;
    discount: number;
  };
  metacritic?: number;
  recommendations?: number;
  releaseDate: string;
}
