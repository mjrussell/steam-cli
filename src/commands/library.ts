import { Command } from 'commander';
import chalk from 'chalk';
import { getUserLibrary, enrichAndFilter } from '../lib/steam';
import type { EnrichOptions, FilterOptions } from '../lib/steam';
import { displayGamesTable, displayGamesList } from '../lib/display';
import type { GameInfo, DeckCompatCategory } from '../types/index';
import { REVIEW_CATEGORIES, type ReviewCategory } from '../types/index';

// Map review category names to score ranges
const REVIEW_SCORE_MAP: Record<ReviewCategory, number> = {
  'overwhelmingly-negative': 1,
  'very-negative': 2,
  'negative': 3,
  'mostly-negative': 4,
  'mixed': 5,
  'mostly-positive': 6,
  'positive': 7,
  'very-positive': 8,
  'overwhelmingly-positive': 9
};

const DECK_COMPAT_MAP: Record<string, DeckCompatCategory[]> = {
  'verified': [3],
  'playable': [2],
  'unsupported': [1],
  'unknown': [0],
  'ok': [2, 3],           // playable or better
  'any': [1, 2, 3],       // any known status
};

function parseReviewFilter(value: string): number[] {
  const lower = value.toLowerCase().replace(/\s+/g, '-');
  
  if (lower in REVIEW_SCORE_MAP) {
    return [REVIEW_SCORE_MAP[lower as ReviewCategory]];
  }
  
  if (lower === 'positive+' || lower === 'positive-or-better') {
    return [7, 8, 9];
  }
  
  if (lower === 'positive-any' || lower === 'any-positive') {
    return [6, 7, 8, 9];
  }
  
  if (lower === 'negative-any' || lower === 'any-negative') {
    return [1, 2, 3, 4];
  }
  
  const num = parseInt(value);
  if (!isNaN(num) && num >= 1 && num <= 9) {
    return [num];
  }
  
  throw new Error(`Invalid review filter: ${value}. Use category name (e.g., "very-positive", "mixed") or score 1-9.`);
}

function parseDeckCompatFilter(value: string): DeckCompatCategory[] {
  const lower = value.toLowerCase();
  
  if (lower in DECK_COMPAT_MAP) {
    return DECK_COMPAT_MAP[lower];
  }
  
  const num = parseInt(value);
  if (!isNaN(num) && num >= 0 && num <= 3) {
    return [num as DeckCompatCategory];
  }
  
  throw new Error(`Invalid deck compat filter: ${value}. Use: verified, playable, unsupported, unknown, ok (playable+verified)`);
}

export function createLibraryCommand(): Command {
  const library = new Command('library')
    .description('Browse your Steam library')
    .option('-l, --limit <number>', 'Limit number of results', parseInt)
    .option('--unplayed', 'Show only unplayed games')
    .option('--min-hours <hours>', 'Minimum playtime in hours', parseFloat)
    .option('--max-hours <hours>', 'Maximum playtime in hours', parseFloat)
    .option('--deck', 'Show only games played on Steam Deck')
    .option('--deck-hours', 'Show Steam Deck playtime in output')
    .option('--deck-compat <status>', 'Filter by Deck compatibility: verified, playable, unsupported, unknown, ok')
    .option('--show-compat', 'Show Deck compatibility in output')
    .option('--sort <field>', 'Sort by: name, playtime, deck, reviews, compat', 'name')
    .option('--plain', 'Plain list output (no table)')
    .option('--json', 'Output as JSON')
    .option('--reviews <category>', 'Filter by review category (e.g., very-positive, mixed, positive+)')
    .option('--min-reviews <score>', 'Minimum review score (1-9)', parseInt)
    .option('--max-reviews <score>', 'Maximum review score (1-9)', parseInt)
    .option('--show-reviews', 'Show review scores in output')
    .option('--genre <genre>', 'Filter by genre (partial match)')
    .option('--tag <tag>', 'Filter by tag (partial match)')
    .option('--show-tags', 'Show tags in output')
    .action(async (options) => {
      try {
        const needsReviews = options.reviews || options.minReviews || options.maxReviews || 
                           options.showReviews || options.sort === 'reviews';
        const needsDeckCompat = options.deckCompat || options.showCompat || options.sort === 'compat';
        const needsGenresTags = options.genre || options.tag || options.showTags;
        const needsEnrichment = needsReviews || needsDeckCompat || needsGenresTags;
        
        if (!options.json) {
          console.error(chalk.blue('Fetching your Steam library...'));
        }
        
        let games = await getUserLibrary();
        
        // Apply local filters first (no API calls needed)
        if (options.unplayed) {
          games = games.filter(g => g.playtime === 0);
        }
        
        if (options.minHours !== undefined) {
          const minMinutes = options.minHours * 60;
          games = games.filter(g => g.playtime >= minMinutes);
        }
        
        if (options.maxHours !== undefined) {
          const maxMinutes = options.maxHours * 60;
          games = games.filter(g => g.playtime <= maxMinutes);
        }
        
        if (options.deck) {
          games = games.filter(g => (g.playtimeDeck || 0) > 0);
        }
        
        // If no enrichment needed, just sort and limit
        if (!needsEnrichment) {
          games = sortGames(games, options.sort);
          if (options.limit) {
            games = games.slice(0, options.limit);
          }
        } else {
          // Build enrich and filter options
          const enrich: EnrichOptions = {
            reviews: needsReviews,
            deckCompat: needsDeckCompat,
            genresTags: needsGenresTags
          };
          
          const filter: FilterOptions = {};
          
          if (options.reviews) {
            filter.reviewScores = parseReviewFilter(options.reviews);
          }
          if (options.minReviews !== undefined) {
            filter.minReviewScore = options.minReviews;
          }
          if (options.maxReviews !== undefined) {
            filter.maxReviewScore = options.maxReviews;
          }
          if (options.deckCompat) {
            filter.deckCompatValues = parseDeckCompatFilter(options.deckCompat);
          }
          if (options.genre) {
            filter.genres = [options.genre];
          }
          if (options.tag) {
            filter.tags = [options.tag];
          }
          
          const hasFilters = Object.keys(filter).length > 0;
          const fetching = [
            needsReviews ? 'reviews' : null,
            needsDeckCompat ? 'deck compat' : null,
            needsGenresTags ? 'tags' : null
          ].filter(Boolean).join(' + ');
          
          // Pre-sort if we have filters + limit (for early termination on sorted order)
          if (hasFilters && options.limit) {
            games = sortGames(games, options.sort);
          }
          
          if (!options.json) {
            const limitNote = options.limit && hasFilters ? ` (stopping at ${options.limit})` : '';
            console.error(chalk.blue(`Fetching ${fetching} for ${games.length} games${limitNote}...`));
          }
          
          // Stream fusion: enrich + filter + early termination in single pass
          games = await enrichAndFilter(
            games,
            enrich,
            filter,
            hasFilters ? options.limit : undefined,  // Only early terminate if filtering
            (checked, found, total) => {
              if (!options.json && process.stderr.isTTY) {
                const status = options.limit && hasFilters 
                  ? `Checked ${checked}/${total}, found ${found}/${options.limit}`
                  : `Progress: ${checked}/${total}`;
                process.stderr.write(`\r${chalk.gray(status)}`);
              }
            }
          );
          
          if (!options.json && process.stderr.isTTY) {
            process.stderr.write('\r' + ' '.repeat(50) + '\r');
          }
          
          // Sort if we didn't pre-sort (no filters case)
          if (!hasFilters || !options.limit) {
            games = sortGames(games, options.sort);
          }
          
          // Apply limit if no filters (enrichment without filtering)
          if (!hasFilters && options.limit) {
            games = games.slice(0, options.limit);
          }
        }
        
        // Output results
        if (options.json) {
          console.log(JSON.stringify(games, null, 2));
        } else {
          console.error(chalk.bold(`\nFound ${games.length} games:\n`));
          
          if (options.plain) {
            displayGamesList(games, options.deckHours, options.showReviews, options.showCompat, options.showTags);
          } else {
            displayGamesTable(games, options.deckHours, options.showReviews, options.showCompat, options.showTags);
          }
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

  return library;
}

function sortGames(games: GameInfo[], sortBy: string): GameInfo[] {
  const sorted = [...games];
  
  switch (sortBy.toLowerCase()) {
    case 'playtime':
      return sorted.sort((a, b) => b.playtime - a.playtime);
    case 'deck':
      return sorted.sort((a, b) => (b.playtimeDeck || 0) - (a.playtimeDeck || 0));
    case 'reviews':
      return sorted.sort((a, b) => (b.reviewScore || 0) - (a.reviewScore || 0));
    case 'compat':
      return sorted.sort((a, b) => (b.deckCompat ?? -1) - (a.deckCompat ?? -1));
    case 'name':
    default:
      return sorted.sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
      });
  }
}
