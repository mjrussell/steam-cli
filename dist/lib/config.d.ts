import type { Config } from '../types/index.js';
export declare function loadConfig(): Promise<Config>;
export declare function saveConfig(config: Config): Promise<void>;
export declare function getApiKey(): Promise<string | undefined>;
export declare function getSteamId(): Promise<string | undefined>;
export declare function getUsername(): Promise<string | undefined>;
