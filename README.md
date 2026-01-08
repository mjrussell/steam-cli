# Steam CLI

CLI tool for browsing and discovering games in your Steam library.

## Setup

1. Get a Steam Web API key from: https://steamcommunity.com/dev/apikey
2. Configure your API key and username:

```bash
steam config set-key <your-api-key>
steam config set-user LordFaramir
```

## Usage

### Browse your library

```bash
steam library                    # List all games
steam library --limit 10         # Show top 10
steam library --unplayed         # Only unplayed games
steam library --sort playtime    # Sort by most played
steam library --min-hours 10     # Games with 10+ hours
steam library --plain            # Plain list (no table)
```

### Check configuration

```bash
steam config show               # Show current settings
```

## Development

```bash
pnpm install                    # Install dependencies
pnpm build                      # Build TypeScript
pnpm dev                        # Watch mode
```

The `steam` command is symlinked to `~/.local/bin/steam`.

## Features

- ✅ Browse your game library
- ✅ Filter by playtime
- ✅ Sort by name or playtime
- ✅ Show unplayed games
- 🚧 Filter by genre/tags (coming soon)
- 🚧 Filter by ratings (coming soon)
- 🚧 Game details view (coming soon)
- 🚧 Store browsing (coming soon)

## Architecture

- `src/commands/` - CLI commands
- `src/lib/config.ts` - Configuration management
- `src/lib/steam.ts` - Steam API wrapper
- `src/lib/display.ts` - Output formatting
- `src/types/` - TypeScript types
