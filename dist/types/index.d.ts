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
}
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
