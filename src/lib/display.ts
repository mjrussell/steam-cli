import Table from 'cli-table3';
import chalk from 'chalk';
import type { GameInfo } from '../types/index';

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
    9: chalk.greenBright,    // Overwhelmingly Positive
    8: chalk.green,          // Very Positive
    7: chalk.green,          // Positive
    6: chalk.yellow,         // Mostly Positive
    5: chalk.yellow,         // Mixed
    4: chalk.red,            // Mostly Negative
    3: chalk.red,            // Negative
    2: chalk.redBright,      // Very Negative
    1: chalk.redBright       // Overwhelmingly Negative
  };
  
  const colorFn = colors[score] || chalk.gray;
  return colorFn(desc);
}

export function displayGamesTable(
  games: GameInfo[], 
  showDeck: boolean = false,
  showReviews: boolean = false
): void {
  const head = [chalk.cyan('Name'), chalk.cyan('Playtime')];
  const colWidths = [40, 15];
  
  if (showDeck) {
    head.push(chalk.cyan('Deck Time'));
    colWidths.push(15);
  }
  
  if (showReviews) {
    head.push(chalk.cyan('Reviews'));
    colWidths.push(25);
  }
  
  head.push(chalk.cyan('App ID'));
  colWidths.push(12);
  
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
    
    row.push(game.appId?.toString() || 'N/A');
    table.push(row);
  }

  console.log(table.toString());
}

export function displayGamesList(
  games: GameInfo[], 
  showDeck: boolean = false,
  showReviews: boolean = false
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
    
    output += ` (${chalk.gray(appId)})`;
    console.log(output);
  }
}
