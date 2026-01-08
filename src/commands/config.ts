import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, saveConfig } from '../lib/config.js';
import { setConfiguredUser } from '../lib/steam.js';

export function createConfigCommand(): Command {
  const config = new Command('config')
    .description('Configure Steam CLI settings');

  config
    .command('set-key <apiKey>')
    .description('Set your Steam Web API key')
    .action(async (apiKey: string) => {
      try {
        const conf = await loadConfig();
        conf.apiKey = apiKey;
        await saveConfig(conf);
        console.log(chalk.green('✓ API key saved successfully'));
      } catch (error) {
        console.error(chalk.red('Error saving API key:'), error);
        process.exit(1);
      }
    });

  config
    .command('set-user <username>')
    .description('Set your Steam username or ID')
    .action(async (username: string) => {
      try {
        await setConfiguredUser(username);
        console.log(chalk.green(`✓ User set to: ${username}`));
      } catch (error) {
        console.error(chalk.red('Error setting user:'), error);
        process.exit(1);
      }
    });

  config
    .command('show')
    .description('Show current configuration')
    .action(async () => {
      try {
        const conf = await loadConfig();
        console.log(chalk.bold('Current configuration:'));
        console.log(`  API Key: ${conf.apiKey ? chalk.green('Set') : chalk.red('Not set')}`);
        console.log(`  Username: ${conf.username || chalk.gray('Not set')}`);
        console.log(`  Steam ID: ${conf.steamId || chalk.gray('Not set')}`);
      } catch (error) {
        console.error(chalk.red('Error loading config:'), error);
        process.exit(1);
      }
    });

  return config;
}
