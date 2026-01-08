import Table from 'cli-table3';
import chalk from 'chalk';
import type { GameInfo } from '../types/index.js';

export function formatPlaytime(minutes: number): string {
  if (minutes === 0) return chalk.gray('Never played');
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function displayGamesTable(games: GameInfo[]): void {
  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.cyan('Playtime'),
      chalk.cyan('App ID')
    ],
    colWidths: [60, 20, 15]
  });

  for (const game of games) {
    table.push([
      game.name || '(Unknown)',
      formatPlaytime(game.playtime || 0),
      game.appId?.toString() || 'N/A'
    ]);
  }

  console.log(table.toString());
}

export function displayGamesList(games: GameInfo[]): void {
  for (const game of games) {
    const playtime = formatPlaytime(game.playtime || 0);
    const name = game.name || '(Unknown)';
    const appId = game.appId?.toString() || 'N/A';
    console.log(`${chalk.bold(name)} - ${playtime} (${chalk.gray(appId)})`);
  }
}
