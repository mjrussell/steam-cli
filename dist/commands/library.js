import { Command } from 'commander';
import chalk from 'chalk';
import { getUserLibrary } from '../lib/steam.js';
import { displayGamesTable, displayGamesList } from '../lib/display.js';
export function createLibraryCommand() {
    const library = new Command('library')
        .description('Browse your Steam library')
        .option('-l, --limit <number>', 'Limit number of results', parseInt)
        .option('--unplayed', 'Show only unplayed games')
        .option('--min-hours <hours>', 'Minimum playtime in hours', parseFloat)
        .option('--max-hours <hours>', 'Maximum playtime in hours', parseFloat)
        .option('--sort <field>', 'Sort by: name, playtime', 'name')
        .option('--plain', 'Plain list output (no table)')
        .action(async (options) => {
        try {
            console.log(chalk.blue('Fetching your Steam library...'));
            let games = await getUserLibrary();
            // Apply filters
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
            // Apply sorting
            games = sortGames(games, options.sort);
            // Apply limit
            if (options.limit) {
                games = games.slice(0, options.limit);
            }
            // Display results
            console.log(chalk.bold(`\nFound ${games.length} games:\n`));
            if (options.plain) {
                displayGamesList(games);
            }
            else {
                displayGamesTable(games);
            }
        }
        catch (error) {
            console.error(chalk.red('Error fetching library:'), error);
            process.exit(1);
        }
    });
    return library;
}
function sortGames(games, sortBy) {
    const sorted = [...games];
    switch (sortBy.toLowerCase()) {
        case 'playtime':
            return sorted.sort((a, b) => b.playtime - a.playtime);
        case 'name':
        default:
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
}
