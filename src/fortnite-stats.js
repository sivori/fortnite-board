#!/usr/bin/env node

const axios = require('axios');
const chalk = require('chalk');

const API_KEY = process.env.FORTNITE_API_KEY;
const API_URL = 'https://fortniteapi.io/v1/stats';

if (!API_KEY) {
  console.error(chalk.red('Error: FORTNITE_API_KEY environment variable is required'));
  console.error(chalk.yellow('Get an API key from https://fortniteapi.io/'));
  console.error(chalk.yellow('Usage: FORTNITE_API_KEY=your_api_key node fortnite-stats.js <username>'));
  process.exit(1);
}

const username = process.argv[2];
if (!username) {
  console.error(chalk.red('Error: Username is required'));
  console.error(chalk.yellow('Usage: FORTNITE_API_KEY=your_api_key node fortnite-stats.js <username>'));
  process.exit(1);
}

async function getPlayerStats(username) {
  try {
    const response = await axios.get(API_URL, {
      params: { account: username },
      headers: { 'Authorization': API_KEY }
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(chalk.red(`Error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`));
    } else {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    process.exit(1);
  }
}

function displayStats(stats) {
  if (!stats.account) {
    console.error(chalk.red(`Error: Player ${username} not found`));
    process.exit(1);
  }

  console.log(chalk.green(`\n=== ${stats.name} (${stats.account.level}) ===`));
  
  if (stats.global_stats) {
    const modes = ['solo', 'duo', 'trio', 'squad'];
    
    modes.forEach(mode => {
      if (stats.global_stats[mode]) {
        const modeStats = stats.global_stats[mode];
        console.log(chalk.cyan(`\n${mode.toUpperCase()}`));
        console.log(`Wins: ${chalk.yellow(modeStats.placetop1 || 0)}`);
        console.log(`Matches: ${modeStats.matchesplayed || 0}`);
        console.log(`Win Rate: ${((modeStats.placetop1 || 0) / (modeStats.matchesplayed || 1) * 100).toFixed(2)}%`);
        console.log(`Kills: ${modeStats.kills || 0}`);
        console.log(`K/D: ${((modeStats.kills || 0) / Math.max(1, (modeStats.matchesplayed || 1) - (modeStats.placetop1 || 0))).toFixed(2)}`);
      }
    });
  } else {
    console.log(chalk.yellow('No stats available for this player'));
  }
}

async function main() {
  console.log(chalk.blue(`Fetching stats for ${username}...`));
  const stats = await getPlayerStats(username);
  displayStats(stats);
}

main().catch(err => {
  console.error(chalk.red(`Unexpected error: ${err.message}`));
  process.exit(1);
});