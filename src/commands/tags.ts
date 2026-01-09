import { Command } from 'commander';
import chalk from 'chalk';

interface SteamTag {
  tagid: number;
  name: string;
}

export function createTagsCommand(): Command {
  return new Command('tags')
    .description('List all Steam tags')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        if (!options.json) {
          console.error(chalk.blue('Fetching Steam tags...'));
        }
        
        const response = await fetch(
          'https://store.steampowered.com/tagdata/populartags/english'
        );
        const tags: SteamTag[] = await response.json();
        
        if (options.json) {
          // Return just names, sorted alphabetically
          const tagNames = tags.map(t => t.name).sort((a, b) => a.localeCompare(b));
          console.log(JSON.stringify(tagNames, null, 2));
        } else {
          const sorted = tags.map(t => t.name).sort((a, b) => a.localeCompare(b));
          console.log(chalk.bold(`\n${sorted.length} tags available:\n`));
          // Display in columns
          const cols = 3;
          const colWidth = 30;
          for (let i = 0; i < sorted.length; i += cols) {
            const row = sorted.slice(i, i + cols)
              .map(t => t.padEnd(colWidth))
              .join('');
            console.log(row);
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
