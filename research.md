# Steam CLI Research

## Requirements
- Access user's game library
- Get game details (genres, tags, playtime, reviews, etc.)
- Discovery/filtering by topics
- Find "hidden gems" (owned but unplayed, highly rated, etc.)
- Maybe browse Steam store

## Research Areas
1. Official Steam Web API
2. Node.js/TypeScript libraries
3. Authentication methods
4. Available data points


## Steam Web API

Official API: https://steamcommunity.com/dev
- Requires an API key
- Provides access to:
  - Player summaries
  - Owned games list
  - Game stats/achievements
  - News feeds
  - Server queries

## Node.js Libraries Found

### steam-user (v5.3.0)
- **Focus:** Steam client protocol (like being a Steam client)
- **Good for:** Bot accounts, full client emulation
- **NOT ideal for our use case** - too heavy, meant for bot automation
- GitHub: https://github.com/DoctorMcKay/node-steam-user

### Need to research:
- steam-web / steam-webapi - simpler Web API wrappers
- steamapi - another Web API wrapper
- Check if there's a good library for:
  - Getting user's library
  - Game details
  - Tags/genres
  - Reviews/ratings


## Top Steam API Libraries

### steamapi (by lloti)
- **Version:** 3.1.4 (updated 4 days ago)
- **Weekly downloads:** 6,476
- **License:** MIT
- **Description:** "A nice Steam API wrapper"
- **NPM:** https://www.npmjs.com/package/steamapi
- ✅ Most popular, actively maintained

### steam-api-sdk (by amire155)
- **Version:** 1.6.2 (10 months ago)
- **Weekly downloads:** 119
- **Description:** "A Node.js wrapper for the Steam Web API, includes many tools for fetching and parsing data"
- Could be worth checking out

### steam-user (by doctormckay)
- **Weekly downloads:** 6,030
- Too heavy - full Steam client emulation
- ❌ Not suitable for our use case


## `steamapi` library details

- **ES Modules only** (import, not require)
- **TypeScript support** (built-in type declarations)
- **Caching built-in** (configurable)
- **Methods available:**
  - `resolve()` - Convert Steam URLs/vanity URLs to SteamID64
  - `getUserSummary()` - Get user profile info
  - `getGameDetails()` - Get game details
  - ... (need to check full method list)

**GitHub:** https://github.com/xDimGG/node-steamapi
**Docs:** https://github.com/xDimGG/node-steamapi/blob/master/docs/classes/default.md#methods


## ✅ Recommended Library: `steamapi` by lloti

**Why this is the best choice:**
- ✅ Actively maintained (updated 4 days ago)
- ✅ Most popular (6,476 weekly downloads)
- ✅ Built-in TypeScript support
- ✅ ES Modules (modern)
- ✅ Built-in caching
- ✅ Clean, well-documented API

### Key Methods Available:

**User Library:**
- `getUserOwnedGames(id, opts)` - Get user's game library with playtime
- `getUserRecentGames(id, count)` - Recently played games (last 2 weeks)
- `getUserAchievements(id, app, lang)` - Achievements for a game
- `getUserStats(id, app)` - Stats for a game

**Game Details:**
- `getGameDetails(app, opts)` - Full game info (price, description, tags, genres, etc.)
- `getGameNews(app, opts)` - News for a game
- `getGamePlayers(app)` - Current player count
- `getGameSchema(app, lang)` - Game schema (achievements, stats)
- `getGameAchievementPercentages(app)` - Global achievement percentages

**Discovery:**
- `getAppList()` - Every game on Steam (~186k+ games!)
- `getFeaturedGames(opts)` - Featured games on Steam store
- `getFeaturedCategories(opts)` - Featured categories

**User Info:**
- `getUserSummary(id)` - Profile info
- `getUserBans(id)` - Ban info
- `getUserLevel(id)` - Steam level
- `getUserFriends(id)` - Friends list
- `getUserBadges(id)` - Badge collection

**Utility:**
- `resolve(query)` - Convert Steam URLs/vanity URLs to SteamID64

### What Data is Available:

From `getGameDetails()`:
- Name, description, short description
- Developers, publishers
- Genres, categories, tags
- Price info (current, original, discount)
- Screenshots, movies/trailers
- System requirements
- Release date
- Metacritic score
- Recommendations (thumbs up/down)
- Supported languages, platforms

From `getUserOwnedGames()`:
- Game name, app ID
- Playtime forever (minutes)
- Playtime last 2 weeks (minutes)
- Icon/logo URLs
- Optional: more detailed info if requested

## Architecture Plan

### CLI Structure:
```
steam-cli/
├── src/
│   ├── commands/
│   │   ├── library.ts    # List/filter your library
│   │   ├── discover.ts   # Find games by criteria
│   │   ├── game.ts       # Get info about a game
│   │   ├── hidden.ts     # Find hidden gems
│   │   └── stats.ts      # Stats/achievements
│   ├── lib/
│   │   ├── steam.ts      # SteamAPI wrapper
│   │   ├── filters.ts    # Filtering logic
│   │   └── display.ts    # CLI output formatting
│   └── index.ts          # CLI entry point
├── package.json
└── tsconfig.json
```

### Features to Build:

**Phase 1: Core**
- `steam library` - Show your game library
- `steam library --filter genre:RPG` - Filter by genre
- `steam library --unplayed` - Games with 0 playtime
- `steam game <name/id>` - Get game details
- `steam config set-user <username>` - Configure your Steam ID

**Phase 2: Discovery**
- `steam discover --genre RPG --tag singleplayer` - Find games
- `steam hidden-gems` - Owned but unplayed, highly rated games
- `steam similar <game>` - Find similar games (via tags/genres)

**Phase 3: Stats**
- `steam stats <game>` - Your stats/achievements
- `steam compare <friend> <game>` - Compare progress

### Data We Can Use:

✅ **Genre** - getGameDetails()
✅ **Tags** - getGameDetails()  
✅ **Playtime** - getUserOwnedGames()
✅ **Reviews/Rating** - getGameDetails() (recommendations count)
✅ **Release Date** - getGameDetails()
✅ **Price** - getGameDetails()
✅ **Metacritic Score** - getGameDetails()
❌ **Steam Reviews Score** - Need to parse store page or use different source

### Authentication:
- Requires Steam Web API key (free, get at steamcommunity.com/dev/apikey)
- Store in config file or env var
- Some endpoints don't require key (app list, game details)

## Next Steps:

1. ✅ Research complete
2. Create project scaffold with TypeScript + steamapi
3. Build basic `steam library` command
4. Add filtering/sorting
5. Build discovery features
6. Polish CLI output (tables, colors, etc.)

