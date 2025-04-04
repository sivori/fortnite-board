#!/usr/bin/env node

const axios = require('axios');
const chalk = require('chalk');

const API_KEY = process.env.FORTNITE_API_KEY;
// Use the correct v2 endpoint
const API_URL = 'https://fortnite-api.com/v2/stats/br/v2';

// Parse command line arguments
const args = process.argv.slice(2);
const identifier = args[0];
const accountType = args[1] || 'epic'; // Default to epic platform if not specified
const isAccountId = identifier.length > 20; // Account IDs are typically longer than usernames

if (!API_KEY) {
  console.error(chalk.red('Error: FORTNITE_API_KEY environment variable is required'));
  console.error(chalk.yellow('Get an API key from https://fortnite-api.com/'));
  console.error(chalk.yellow('Usage: FORTNITE_API_KEY=your_api_key node fortnite-stats.js <username|accountId> [accountType]'));
  process.exit(1);
}

if (!identifier) {
  console.error(chalk.red('Error: Username or Account ID is required'));
  console.error(chalk.yellow('Usage: FORTNITE_API_KEY=your_api_key node fortnite-stats.js <username|accountId> [accountType]'));
  console.error(chalk.yellow('Supported account types: epic, psn, xbl'));
  process.exit(1);
}

// Validate account type
const validAccountTypes = ['epic', 'psn', 'xbl'];
if (!validAccountTypes.includes(accountType)) {
  console.error(chalk.red(`Error: Invalid account type '${accountType}'`));
  console.error(chalk.yellow('Supported account types: epic, psn, xbl'));
  process.exit(1);
}

async function getPlayerStats(identifier, accountType, isAccountId) {
  try {
    console.log(chalk.blue(`Fetching stats for ${identifier} (${accountType})...`));
    
    // Construct the URL based on whether we're using an account ID or name
    const url = isAccountId ? `${API_URL}/${identifier}` : API_URL;
    const params = isAccountId ? {
      timeWindow: 'season',
      image: 'all'
    } : {
      name: identifier,
      accountType: accountType,
      timeWindow: 'season',
      image: 'all'
    };

    // Try season stats first
    let response = await axios.get(url, {
      params,
      headers: { 'Authorization': API_KEY }
    });
    
    // If no season stats, try lifetime stats
    if (!response.data?.data?.stats?.all || 
        (response.data?.data?.stats?.all?.matches === 0 && 
         response.data?.data?.stats?.all?.kills === 0)) {
      console.log(chalk.yellow('No season stats found, trying lifetime stats...'));
      
      params.timeWindow = 'lifetime';
      response = await axios.get(url, {
        params,
        headers: { 'Authorization': API_KEY }
      });
    }
    
    console.log(chalk.green('Stats response received'));
    
    if (response.status !== 200) {
      console.error(chalk.red(`Error: ${response.data.error || 'Could not fetch stats'}`));
      console.error(chalk.yellow(`API Response: ${JSON.stringify(response.data)}`));
      process.exit(1);
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(chalk.red(`Error: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`));
      console.error(chalk.yellow(`API Response: ${JSON.stringify(error.response.data)}`));
    } else {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    process.exit(1);
  }
}

function displayStats(stats, identifier) {
  if (!stats.data) {
    console.error(chalk.red(`Error: No stats found for player ${identifier}`));
    process.exit(1);
  }

  const account = stats.data.account || {};
  console.log(chalk.green(`\n=== ${account.name || identifier} ===`));
  if (account.level) {
    console.log(chalk.blue(`Account Level: ${account.level}`));
  }
  
  const battlePass = stats.data.battlePass;
  if (battlePass && battlePass.level) {
    console.log(chalk.blue(`Battle Pass Level: ${battlePass.level}`));
  }

  const overall = stats.data.stats?.all;
  if (overall) {
    console.log(chalk.cyan('\nOVERALL STATS'));
    console.log(`Wins: ${chalk.yellow(overall.wins || 0)}`);
    console.log(`Win Rate: ${((overall.winRate || 0) * 100).toFixed(2)}%`);
    console.log(`Matches: ${overall.matches || 0}`);
    console.log(`Kills: ${overall.kills || 0}`);
    console.log(`K/D: ${overall.kd?.toFixed(2) || '0.00'}`);
    console.log(`Time Played: ${Math.round((overall.minutesPlayed || 0) / 60)} hours`);
  } else {
    console.log(chalk.yellow('\nNo overall stats available'));
  }

  const modes = ['solo', 'duo', 'trio', 'squad'];
  let hasAnyModeStats = false;
  
  modes.forEach(mode => {
    const modeStats = stats.data.stats?.[mode];
    if (modeStats && Object.keys(modeStats).some(key => modeStats[key] > 0)) {
      hasAnyModeStats = true;
      console.log(chalk.cyan(`\n${mode.toUpperCase()}`));
      console.log(`Wins: ${chalk.yellow(modeStats.wins || 0)}`);
      console.log(`Win Rate: ${((modeStats.winRate || 0) * 100).toFixed(2)}%`);
      console.log(`Matches: ${modeStats.matches || 0}`);
      console.log(`Kills: ${modeStats.kills || 0}`);
      console.log(`K/D: ${modeStats.kd?.toFixed(2) || '0.00'}`);
    }
  });

  if (!hasAnyModeStats) {
    console.log(chalk.yellow('\nNo mode-specific stats available'));
  }
}

async function main() {
  console.log(chalk.blue(`Fetching stats for ${identifier} using account type ${accountType}...`));
  const stats = await getPlayerStats(identifier, accountType, isAccountId);
  displayStats(stats, identifier);
}

main().catch(err => {
  console.error(chalk.red(`Unexpected error: ${err.message}`));
  process.exit(1);
});