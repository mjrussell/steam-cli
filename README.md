# Steam CLI

A powerful command-line tool for browsing, filtering, and discovering games in your Steam library. Find hidden gems, track playtime, and manage your collection from the terminal.

## Features

✅ **Browse your entire Steam library**  
✅ **Filter by playtime** (min/max hours, unplayed)  
✅ **Sort** by name, playtime, or Steam Deck playtime  
✅ **Steam Deck support** - filter and track Deck-specific playtime  
✅ **Multiple output formats** (table or plain list)  
✅ **Domain-restricted API keys** (localhost support built-in)

## Installation

### Prerequisites

- Node.js 18+ 
- Steam Web API key ([Get one here](https://steamcommunity.com/dev/apikey))

### Install

```bash
git clone https://github.com/yourusername/steam-cli.git
cd steam-cli
pnpm install
pnpm build

# Link globally (optional)
ln -s $(pwd)/dist/index.js ~/.local/bin/steam
```

## Quick Start

1. **Get your Steam Web API key** from https://steamcommunity.com/dev/apikey
   - Domain field: Use `localhost` or leave blank

2. **Configure the CLI:**
   ```bash
   steam config set-key YOUR_API_KEY
   steam config set-user YOUR_STEAM_ID  # Or username if you have vanity URL
   ```

3. **Start browsing:**
   ```bash
   steam library --limit 10
   ```

## Usage

### Basic Commands

```bash
# List all games
steam library

# Show top 10 most-played games
steam library --sort playtime --limit 10

# Find unplayed games (hidden gems!)
steam library --unplayed --limit 20

# Games with 10-50 hours of playtime
steam library --min-hours 10 --max-hours 50
```

### Steam Deck Commands

```bash
# Show only games played on Steam Deck
steam library --deck --limit 10

# Sort by most-played on Deck
steam library --deck --sort deck

# Show Deck playtime column
steam library --deck --deck-hours --limit 5
```

### Output Formats

```bash
# Table format (default)
steam library --limit 5

# Plain list (great for scripting)
steam library --plain --limit 5
```

### Configuration

```bash
# Show current config
steam config show

# Set API key
steam config set-key YOUR_KEY

# Set Steam user
steam config set-user YOUR_ID
```

## Command Reference

### `steam library [options]`

**Options:**
- `-l, --limit <number>` - Limit number of results
- `--unplayed` - Show only unplayed games (0 hours)
- `--min-hours <hours>` - Minimum playtime in hours
- `--max-hours <hours>` - Maximum playtime in hours
- `--deck` - Show only games played on Steam Deck
- `--deck-hours` - Display Steam Deck playtime column
- `--sort <field>` - Sort by: `name`, `playtime`, or `deck`
- `--plain` - Plain list output (no table)

### `steam config <command>`

**Commands:**
- `set-key <key>` - Set your Steam Web API key
- `set-user <id>` - Set your Steam ID or username
- `show` - Display current configuration

## Configuration

Config is stored in `~/.steam-cli/config.json`:

```json
{
  "apiKey": "YOUR_API_KEY",
  "steamId": "76561198033507565",
  "username": "YourUsername"
}
```

**Note:** API key can also be set via `STEAM_API_KEY` environment variable.

## Development

```bash
# Install dependencies
pnpm install

# Build TypeScript
pnpm build

# Watch mode
pnpm dev
```

### Project Structure

```
steam-cli/
├── src/
│   ├── commands/       # CLI command implementations
│   │   ├── library.ts  # Library browsing command
│   │   └── config.ts   # Configuration management
│   ├── lib/
│   │   ├── steam.ts    # Steam API client wrapper
│   │   ├── config.ts   # Config file operations
│   │   └── display.ts  # Output formatting
│   ├── types/          # TypeScript type definitions
│   └── index.ts        # CLI entry point
├── dist/               # Compiled JavaScript
└── package.json
```

## Troubleshooting

### Empty game list

**Problem:** `steam library` returns 0 games

**Solutions:**
1. **Check privacy settings:** Your Steam profile's "Game details" must be set to Public
   - Visit: https://steamcommunity.com/my/edit/settings
   - Privacy Settings → Game details → Public

2. **Check Steam ID:** Make sure you're using the correct Steam ID
   - Your profile URL might be: `steamcommunity.com/profiles/76561198033507565/`
   - Use the numeric ID if you don't have a vanity URL

3. **API key domain restriction:** If your key is restricted to `localhost`, the CLI handles this automatically

### API key errors

If you see "Steam API key not found":
- Set via config: `steam config set-key YOUR_KEY`
- Or use env var: `export STEAM_API_KEY=YOUR_KEY`

## Roadmap

- 🚧 Genre/tag filtering
- 🚧 Rating filters (Metacritic, Steam reviews)
- 🚧 Detailed game info command
- 🚧 Random game picker ("What should I play?")
- 🚧 Store browsing
- 🚧 Friends comparison

## Contributing

Contributions welcome! Please open an issue or PR.

## License

MIT

## Credits

Built with:
- [steamapi](https://www.npmjs.com/package/steamapi) - Steam API wrapper
- [commander](https://www.npmjs.com/package/commander) - CLI framework
- [cli-table3](https://www.npmjs.com/package/cli-table3) - Table formatting
- [chalk](https://www.npmjs.com/package/chalk) - Terminal colors
