import SteamAPI from 'steamapi';
import type { GameInfo } from '../types/index.js';
export declare function getSteamClient(): Promise<SteamAPI>;
export declare function resolveUser(usernameOrId: string): Promise<string>;
export declare function getUserLibrary(steamId?: string): Promise<GameInfo[]>;
export declare function getGameDetails(appId: number): Promise<import("steamapi").GameDetails>;
export declare function setConfiguredUser(usernameOrId: string): Promise<void>;
