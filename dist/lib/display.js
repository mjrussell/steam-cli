import Table from 'cli-table3';
import chalk from 'chalk';
export function formatPlaytime(minutes) {
    if (minutes === 0)
        return chalk.gray('Never played');
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) {
        return `${mins}m`;
    }
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
export function displayGamesTable(games, showDeck = false) {
    const head = [
        chalk.cyan('Name'),
        chalk.cyan('Playtime')
    ];
    const colWidths = [50, 20];
    if (showDeck) {
        head.push(chalk.cyan('Deck Time'));
        colWidths.push(20);
    }
    head.push(chalk.cyan('App ID'));
    colWidths.push(15);
    const table = new Table({ head, colWidths });
    for (const game of games) {
        const row = [
            game.name || '(Unknown)',
            formatPlaytime(game.playtime || 0)
        ];
        if (showDeck) {
            row.push(formatPlaytime(game.playtimeDeck || 0));
        }
        row.push(game.appId?.toString() || 'N/A');
        table.push(row);
    }
    console.log(table.toString());
}
export function displayGamesList(games, showDeck = false) {
    for (const game of games) {
        const playtime = formatPlaytime(game.playtime || 0);
        const name = game.name || '(Unknown)';
        const appId = game.appId?.toString() || 'N/A';
        let output = `${chalk.bold(name)} - ${playtime}`;
        if (showDeck && game.playtimeDeck) {
            const deckTime = formatPlaytime(game.playtimeDeck);
            output += ` ${chalk.green('[Deck: ' + deckTime + ']')}`;
        }
        output += ` (${chalk.gray(appId)})`;
        console.log(output);
    }
}
