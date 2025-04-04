#!/usr/bin/env node

const axios = require('axios');
const chalk = require('chalk');

const API_KEY = process.env.FORTNITE_API_KEY;

if (!API_KEY) {
  console.error(chalk.red('Error: FORTNITE_API_KEY environment variable is required'));
  process.exit(1);
}

async function testEndpoint(url, params = {}) {
  try {
    console.log(chalk.blue(`Testing endpoint: ${url}`));
    console.log(chalk.blue(`Params: ${JSON.stringify(params)}`));
    
    const response = await axios.get(url, {
      params: params,
      headers: { 'Authorization': API_KEY }
    });
    
    console.log(chalk.green(`Status: ${response.status}`));
    console.log(chalk.green(`Response: ${JSON.stringify(response.data, null, 2)}`));
    return true;
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    if (error.response) {
      console.error(chalk.red(`Status: ${error.response.status}`));
      console.error(chalk.red(`Response: ${JSON.stringify(error.response.data, null, 2)}`));
    }
    return false;
  }
}

async function main() {
  console.log(chalk.blue('Testing Fortnite API endpoints...'));
  
  // Test fortnite-api.com endpoints
  const endpoints = [
    { url: 'https://fortnite-api.com/v1/stats/br', params: { name: 'Ninja', platform: 'epic' } },
    { url: 'https://fortnite-api.com/v1/stats/br/search', params: { name: 'Ninja', platform: 'epic' } },
    { url: 'https://fortnite-api.com/v1/stats/br/account', params: { name: 'Ninja', platform: 'epic' } }
  ];
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint.url, endpoint.params);
    console.log(chalk.yellow('-----------------------------------'));
  }
}

main().catch(err => {
  console.error(chalk.red(`Unexpected error: ${err.message}`));
  process.exit(1);
}); 