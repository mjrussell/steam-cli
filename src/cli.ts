import { Command } from 'commander';
import { createConfigCommand } from './commands/config';
import { createLibraryCommand } from './commands/library';
import { createWhoamiCommand } from './commands/whoami';

const program = new Command();

program
  .name('steam')
  .description('CLI tool for browsing and discovering Steam games')
  .version('0.3.0');

// Register commands
program.addCommand(createConfigCommand());
program.addCommand(createLibraryCommand());
program.addCommand(createWhoamiCommand());

// Parse and execute
program.parse();
