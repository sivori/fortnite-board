# Fortnite Stats Board

A simple CLI tool to fetch and display Fortnite player statistics.

## Installation

```bash
npm install
```

## Usage

1. Get a Fortnite API key from [fortniteapi.io](https://fortniteapi.io/)
2. Run the script:

```bash
# Using npm
FORTNITE_API_KEY=your_api_key npm start <username>

# Or directly
FORTNITE_API_KEY=your_api_key node src/fortnite-stats.js <username>
```

## Features

- Displays player level
- Shows stats for solo, duo, trio, and squad modes
- Calculates win rate and K/D ratio