import { Command } from 'commander';
import { createConfigCommand } from './commands/config';
import { createLibraryCommand } from './commands/library';
import { createWhoamiCommand } from './commands/whoami';
import { createTagsCommand } from './commands/tags';
import { createGenresCommand } from './commands/genres';

const program = new Command();

program
  .name('steam')
  .description('CLI tool for browsing and discovering Steam games')
  .version('0.3.0');

// Register commands
program.addCommand(createConfigCommand());
program.addCommand(createLibraryCommand());
program.addCommand(createWhoamiCommand());
program.addCommand(createTagsCommand());
program.addCommand(createGenresCommand());

// Parse and execute
program.parse();
