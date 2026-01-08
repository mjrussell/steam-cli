import { Command } from 'commander';
import chalk from 'chalk';
import { getSteamId, getApiKey } from '../lib/config';
import { getUserLibrary } from '../lib/steam';

interface PlayerSummary {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  realname?: string;
  timecreated?: number;
  lastlogoff?: number;
  personastate: number;
}

const PERSONA_STATES = [
  'Offline',
  'Online',
  'Busy',
  'Away',
  'Snooze',
  'Looking to trade',
  'Looking to play'
];

async function getPlayerSummary(steamId: string, apiKey: string): Promise<PlayerSummary | null> {
  const response = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`
  );
  const data = await response.json() as any;
  return data.response?.players?.[0] || null;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatPlaytime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  if (hours < 1000) {
    return `${hours} hours`;
  }
  return `${(hours / 1000).toFixed(1)}k hours`;
}

export function createWhoamiCommand(): Command {
  return new Command('whoami')
    .description('Show current Steam user info')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const steamId = await getSteamId();
        const apiKey = await getApiKey();
        
        if (!steamId) {
          console.error(chalk.red('No Steam user configured. Run: steam config set-user <id>'));
          process.exit(1);
        }
        
        if (!apiKey) {
          console.error(chalk.red('No API key configured. Run: steam config set-key <key>'));
          process.exit(1);
        }
        
        if (!options.json) {
          console.error(chalk.blue('Fetching profile...'));
        }
        
        const [player, games] = await Promise.all([
          getPlayerSummary(steamId, apiKey),
          getUserLibrary(steamId)
        ]);
        
        if (!player) {
          console.error(chalk.red('Could not fetch player info'));
          process.exit(1);
        }
        
        const totalPlaytime = games.reduce((sum, g) => sum + (g.playtime || 0), 0);
        const playedGames = games.filter(g => g.playtime > 0).length;
        
        if (options.json) {
          console.log(JSON.stringify({
            steamId: player.steamid,
            displayName: player.personaname,
            realName: player.realname,
            profileUrl: player.profileurl,
            status: PERSONA_STATES[player.personastate] || 'Unknown',
            memberSince: player.timecreated ? formatDate(player.timecreated) : null,
            lastOnline: player.lastlogoff ? formatDate(player.lastlogoff) : null,
            games: {
              total: games.length,
              played: playedGames,
              unplayed: games.length - playedGames
            },
            totalPlaytime: {
              minutes: totalPlaytime,
              hours: Math.floor(totalPlaytime / 60),
              formatted: formatPlaytime(totalPlaytime)
            }
          }, null, 2));
        } else {
          console.log();
          console.log(chalk.bold.cyan(player.personaname) + (player.realname ? chalk.gray(` (${player.realname})`) : ''));
          console.log(chalk.gray('─'.repeat(40)));
          console.log(`${chalk.white('Steam ID:')}      ${player.steamid}`);
          console.log(`${chalk.white('Status:')}        ${PERSONA_STATES[player.personastate] || 'Unknown'}`);
          console.log(`${chalk.white('Profile:')}       ${player.profileurl}`);
          if (player.timecreated) {
            console.log(`${chalk.white('Member since:')} ${formatDate(player.timecreated)}`);
          }
          console.log();
          console.log(chalk.bold('Library'));
          console.log(chalk.gray('─'.repeat(40)));
          console.log(`${chalk.white('Total games:')}   ${games.length}`);
          console.log(`${chalk.white('Played:')}        ${playedGames} (${Math.round(playedGames / games.length * 100)}%)`);
          console.log(`${chalk.white('Unplayed:')}      ${games.length - playedGames}`);
          console.log(`${chalk.white('Total time:')}    ${formatPlaytime(totalPlaytime)}`);
          console.log();
        }
        
      } catch (error) {
        if (options.json) {
          console.error(JSON.stringify({ error: String(error) }));
        } else {
          console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
        }
        process.exit(1);
      }
    });
}
