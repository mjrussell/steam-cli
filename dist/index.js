#!/usr/bin/env node
import { Command } from 'commander';
import { createConfigCommand } from './commands/config.js';
import { createLibraryCommand } from './commands/library.js';
const program = new Command();
program
    .name('steam')
    .description('CLI tool for browsing and discovering Steam games')
    .version('0.1.0');
// Register commands
program.addCommand(createConfigCommand());
program.addCommand(createLibraryCommand());
// Parse and execute
program.parse();
