# Steam CLI

A command-line tool for browsing, filtering, and discovering games in your Steam library. Find hidden gems, track playtime, and manage your collection from the terminal.

## Installation

```bash
npm install -g steam-games-cli
```

### Prerequisites

- Node.js 18+ 
- Steam Web API key ([Get one here](https://steamcommunity.com/dev/apikey))

### From Source

```bash
git clone https://github.com/mjrussell/steam-cli.git
cd steam-cli
pnpm install && pnpm build
npm link
```

## Commands

| Command | Description |
|---------|-------------|
| `steam whoami` | Show current user profile and stats |
| `steam library` | Browse and filter your game library |
| `steam tags` | List all Steam tags (instant) |
| `steam genres` | List all Steam genres (instant) |
| `steam config` | Manage configuration |

## Quick Start

1. **Get your Steam Web API key** from https://steamcommunity.com/dev/apikey

2. **Configure the CLI:**
   ```bash
   steam config set-key YOUR_API_KEY
   steam config set-user YOUR_STEAM_ID
   ```

3. **Start browsing:**
   ```bash
   steam library --limit 10
   ```

## Usage

### Profile

```bash
# Show your Steam profile and library stats
steam whoami

# JSON output
steam whoami --json
```

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

### Review Filters

```bash
# Show only Very Positive games
steam library --reviews very-positive --limit 10

# Show Overwhelmingly Positive games with reviews column
steam library --reviews overwhelmingly-positive --show-reviews

# Filter by review score (1-9 scale)
steam library --min-reviews 7 --show-reviews --limit 10

# Sort by review score (best first)
steam library --sort reviews --show-reviews --limit 10

# Combine with playtime: well-reviewed games you haven't played much
steam library --max-hours 5 --min-reviews 8 --show-reviews
```

**Review Categories (score 1-9):**
- `overwhelmingly-positive` (9)
- `very-positive` (8)
- `positive` (7)
- `mostly-positive` (6)
- `mixed` (5)
- `mostly-negative` (4)
- `negative` (3)
- `very-negative` (2)
- `overwhelmingly-negative` (1)

### Steam Deck Commands

```bash
# Show only games played on Steam Deck
steam library --deck --limit 10

# Sort by most-played on Deck
steam library --deck --sort deck

# Show Deck playtime column
steam library --deck-hours --limit 5
```

### Output Formats

```bash
# Table format (default)
steam library --limit 5

# Plain list (great for scripting)
steam library --plain --limit 5

# JSON output
steam library --json --limit 5
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

| Option | Description |
|--------|-------------|
| `-l, --limit <n>` | Limit number of results |
| `--unplayed` | Show only unplayed games |
| `--min-hours <h>` | Minimum playtime in hours |
| `--max-hours <h>` | Maximum playtime in hours |
| `--deck` | Only games played on Steam Deck |
| `--deck-hours` | Show Deck playtime column |
| `--reviews <cat>` | Filter by review category |
| `--min-reviews <n>` | Minimum review score (1-9) |
| `--max-reviews <n>` | Maximum review score (1-9) |
| `--show-reviews` | Show review column |
| `--sort <field>` | Sort by: name, playtime, deck, reviews |
| `--plain` | Plain list output |
| `--json` | JSON output |

### `steam config <command>`

| Command | Description |
|---------|-------------|
| `set-key <key>` | Set Steam Web API key |
| `set-user <id>` | Set Steam ID or username |
| `show` | Display current config |

## Configuration

Config stored in `~/.steam-cli/config.json`:

```json
{
  "apiKey": "YOUR_API_KEY",
  "steamId": "76561198012345678",
  "username": "YourUsername"
}
```

API key can also be set via `STEAM_API_KEY` environment variable.

## Troubleshooting

### Empty game list

Your Steam profile's "Game details" must be set to Public:
- Visit: https://steamcommunity.com/my/edit/settings
- Privacy Settings → Game details → Public

### Review fetching is slow

Review data requires individual API calls per game. Use other filters first to reduce the number of games:

```bash
# Fast: filters first, then fetches reviews for 58 games
steam library --min-hours 10 --reviews very-positive

# Slow: fetches reviews for all 400+ games
steam library --reviews very-positive
```

## License

MIT
