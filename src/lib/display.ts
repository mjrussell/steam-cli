import Table from 'cli-table3';
import chalk from 'chalk';
import type { GameInfo, DeckCompatCategory } from '../types/index';

export function formatPlaytime(minutes: number): string {
  if (minutes === 0) return chalk.gray('Never played');
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatReviewScore(score?: number, desc?: string): string {
  if (!score || !desc) return chalk.gray('No reviews');
  
  const colors: Record<number, typeof chalk.green> = {
    9: chalk.greenBright,
    8: chalk.green,
    7: chalk.green,
    6: chalk.yellow,
    5: chalk.yellow,
    4: chalk.red,
    3: chalk.red,
    2: chalk.redBright,
    1: chalk.redBright
  };
  
  const colorFn = colors[score] || chalk.gray;
  return colorFn(desc);
}

export function formatDeckCompat(compat?: DeckCompatCategory, desc?: string): string {
  if (compat === undefined || !desc) return chalk.gray('Unknown');
  
  const colors: Record<DeckCompatCategory, typeof chalk.green> = {
    3: chalk.greenBright,  // Verified
    2: chalk.green,        // Playable
    1: chalk.red,          // Unsupported
    0: chalk.gray          // Unknown
  };
  
  const icons: Record<DeckCompatCategory, string> = {
    3: '✓',
    2: '◐',
    1: '✗',
    0: '?'
  };
  
  const colorFn = colors[compat];
  return colorFn(`${icons[compat]} ${desc}`);
}

export function displayGamesTable(
  games: GameInfo[], 
  showDeck: boolean = false,
  showReviews: boolean = false,
  showCompat: boolean = false
): void {
  const head = [chalk.cyan('Name'), chalk.cyan('Playtime')];
  const colWidths = [35, 13];
  
  if (showDeck) {
    head.push(chalk.cyan('Deck Time'));
    colWidths.push(13);
  }
  
  if (showReviews) {
    head.push(chalk.cyan('Reviews'));
    colWidths.push(24);
  }
  
  if (showCompat) {
    head.push(chalk.cyan('Deck'));
    colWidths.push(14);
  }
  
  head.push(chalk.cyan('App ID'));
  colWidths.push(10);
  
  const table = new Table({ head, colWidths });

  for (const game of games) {
    const row: string[] = [
      game.name || '(Unknown)',
      formatPlaytime(game.playtime || 0)
    ];
    
    if (showDeck) {
      row.push(formatPlaytime(game.playtimeDeck || 0));
    }
    
    if (showReviews) {
      row.push(formatReviewScore(game.reviewScore, game.reviewScoreDesc));
    }
    
    if (showCompat) {
      row.push(formatDeckCompat(game.deckCompat, game.deckCompatDesc));
    }
    
    row.push(game.appId?.toString() || 'N/A');
    table.push(row);
  }

  console.log(table.toString());
}

export function displayGamesList(
  games: GameInfo[], 
  showDeck: boolean = false,
  showReviews: boolean = false,
  showCompat: boolean = false
): void {
  for (const game of games) {
    const playtime = formatPlaytime(game.playtime || 0);
    const name = game.name || '(Unknown)';
    const appId = game.appId?.toString() || 'N/A';
    
    let output = `${chalk.bold(name)} - ${playtime}`;
    
    if (showDeck && game.playtimeDeck) {
      const deckTime = formatPlaytime(game.playtimeDeck);
      output += ` ${chalk.green('[Deck: ' + deckTime + ']')}`;
    }
    
    if (showReviews) {
      const review = formatReviewScore(game.reviewScore, game.reviewScoreDesc);
      output += ` [${review}]`;
    }
    
    if (showCompat) {
      const compat = formatDeckCompat(game.deckCompat, game.deckCompatDesc);
      output += ` [${compat}]`;
    }
    
    output += ` (${chalk.gray(appId)})`;
    console.log(output);
  }
}
