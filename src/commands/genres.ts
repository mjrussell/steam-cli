import { Command } from 'commander';
import chalk from 'chalk';

interface SteamGenre {
  id: string;
  name: string;
}

interface GenreResponse {
  genres: SteamGenre[];
  status: number;
}

export function createGenresCommand(): Command {
  return new Command('genres')
    .description('List all Steam genres')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        if (!options.json) {
          console.error(chalk.blue('Fetching Steam genres...'));
        }
        
        const response = await fetch(
          'https://store.steampowered.com/api/getgenrelist'
        );
        const data: GenreResponse = await response.json();
        
        // Filter out non-game genres like "Software Training", "Utilities", etc.
        const gameGenres = data.genres.filter(g => 
          !['Accounting', 'Audio Production', 'Education', 'Photo Editing', 
            'Software Training', 'Utilities', 'Video Production', 'Web Publishing',
            'Mac OS X', 'Linux', 'Controller support', 'genre_demos'].includes(g.id)
        );
        
        if (options.json) {
          const genreNames = gameGenres.map(g => g.name).sort((a, b) => a.localeCompare(b));
          console.log(JSON.stringify(genreNames, null, 2));
        } else {
          const sorted = gameGenres.map(g => g.name).sort((a, b) => a.localeCompare(b));
          console.log(chalk.bold(`\n${sorted.length} genres available:\n`));
          for (const genre of sorted) {
            console.log(`  ${chalk.cyan(genre)}`);
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
}
