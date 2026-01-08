# Steam CLI - Build Plan

## Context
Building a CLI tool to browse Steam library, filter/sort games, and discover hidden gems. Similar to whatshouldisteam.com but CLI-based with more options.

**User:** Matt Russell (Steam: LordFaramir, 440 games)

## Library Selection
✅ **Using: `steamapi` by lloti**
- Most popular (6.5k weekly downloads)
- Actively maintained (updated 4 days ago)
- Built-in TypeScript support
- Has all needed APIs

See `research.md` for full evaluation.

## Architecture Decision

**Separate `library` vs `store` commands:**
- `steam library` - Browse/filter YOUR games (focus here first)
- `steam store` - Browse Steam store catalog (build later, maybe)

This removes ambiguity about whether you're discovering in your library vs the store.

## Phase 1: Core Library (START HERE)

### Setup
1. Scaffold project using **create-cli skill** (`~/clawd/skills/create-cli/`)
2. Install dependencies: `steamapi`, CLI framework (commander/yargs)
3. Config command: `steam config set-user <username>` to save Steam ID

### Basic Commands
```bash
steam library                    # List all games
steam library --limit 10         # Show top 10
steam game <name/id>            # Detailed game info
```

### Data to Display
- Game name
- Playtime (total hours)
- Last played
- Genres/tags (abbreviated)
- Rating (Metacritic if available)

## Phase 2: Filtering & Sorting

### Sorting Options
```bash
steam library --sort playtime    # Most/least played
steam library --sort name        # Alphabetical
steam library --sort rating      # By Metacritic/reviews
steam library --sort recent      # Recently played
```

### Filter Options
```bash
# Playtime filters
steam library --unplayed         # 0 hours
steam library --min-hours 10     # At least 10 hours
steam library --max-hours 5      # Under 5 hours

# Quality filters
steam library --genre RPG        # By genre
steam library --tag roguelike    # By tag
steam library --min-rating 80    # Metacritic >= 80
steam library --reviews positive # Steam reviews

# Combinations
steam library --unplayed --min-rating 85  # Hidden gems!
```

## Phase 3: Polish

### Better Output
- Use tables for clean display (cli-table3 or similar)
- Color coding (chalk):
  - Green: highly rated
  - Yellow: mixed reviews
  - Gray: unplayed
- Icons/emoji for genres?

### Additional Features
- `steam random` - Pick a random game (with filters)
- `steam stats <game>` - Your achievements/stats
- Config file for defaults (`~/.steam-cli.json`)

## Phase 4: Store (Later/Optional)

```bash
steam store --genre RPG --tag singleplayer
steam store --trending
steam store --new-releases
```

## Implementation Notes

### Authentication
- Need Steam Web API key: https://steamcommunity.com/dev/apikey
- Store in config file or env var `STEAM_API_KEY`
- Matt's Steam username: `LordFaramir`

### API Methods to Use
- `getUserOwnedGames()` - Get library with playtime
- `getGameDetails()` - Full game info (genres, tags, ratings)
- `resolve()` - Convert username to SteamID64

### Project Structure
```
steam-cli/
├── src/
│   ├── commands/
│   │   ├── library.ts    # Main library command
│   │   ├── game.ts       # Game details
│   │   ├── config.ts     # Configuration
│   │   └── stats.ts      # Stats/achievements
│   ├── lib/
│   │   ├── steam.ts      # SteamAPI wrapper
│   │   ├── filters.ts    # Filtering logic
│   │   ├── sorters.ts    # Sorting logic
│   │   └── display.ts    # CLI output formatting
│   ├── types/
│   │   └── index.ts      # Type definitions
│   └── index.ts          # CLI entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Success Criteria

**MVP (Phase 1-2):**
- Can list library with playtime
- Can filter by genre, tags, playtime
- Can sort by various criteria
- Can find "hidden gems" (unplayed + highly rated)
- Clean, readable output

**Nice to Have (Phase 3-4):**
- Store browsing
- Friends' games comparison
- Random game picker
- Achievements/stats tracking

## Next Actions

1. Use create-cli skill to scaffold project
2. Set up TypeScript + steamapi
3. Implement config command
4. Build basic library listing
5. Add filtering/sorting iteratively
6. Test each feature before moving on

## References
- Research: `~/code/personal/steam-cli/research.md`
- Create CLI Skill: `~/clawd/skills/create-cli/SKILL.md`
- SteamAPI docs: https://github.com/xDimGG/node-steamapi
