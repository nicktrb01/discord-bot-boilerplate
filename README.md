 # Discord.js Bot Boilerplate

A clean, minimalist, and lightweight Discord bot foundation using Discord.js v14. This boilerplate is designed to handle command loading automatically, so you can focus entirely on writing your commands.

---

## Folder Structure

This template uses a flat, simple structure. All your command files should be placed in the main directory alongside bot.js.

discord-bot-boilerplate/
├── bot.js          # The main bot file (starts the bot & loads commands)
├── ping.js         # An example slash command file
├── .env.example    # Template for your secret tokens
├── .gitignore      # Prevents uploading your private .env file
└── README.md       # This instruction file

---

## Getting Started (Step-by-Step)

If you are new to bot development, follow these simple steps to get your bot online.

### Step 1: Clone the Template
Click the green "Use this template" button at the top of this page to create a copy of this repository in your own GitHub account. Then, download or clone the files to your computer.

### Step 2: Install Node.js & Dependencies
Your bot requires Node.js to run.
1. Download and install Node.js (Recommended Version: 18 or higher).
2. Open your terminal/console inside your project folder.
3. Run the following command to install the required Discord library:
   npm install

### Step 3: Setup your Credentials
To connect the code to your specific Discord bot, you need to create a .env configuration file:
1. Find the file named .env.example in your folder.
2. Rename it to exactly .env (remove the .example part).
3. Open the .env file and replace the placeholder text with your actual bot credentials from the Discord Developer Portal:
   * TOKEN: Your unique bot token (Keep this secret! Never share it!).
   * CLIENT_ID: The Application ID of your bot.

### Step 4: Run the Bot
To start your bot, type this command in your terminal:
node bot.js

You should see a message in your console: Bot is online as [Your Bot Name].

---

## How to Add New Commands

The main file (bot.js) is programmed to automatically find and register any JavaScript file in this folder. You never need to modify bot.js when adding new features.

To create a new command, follow these steps:

1. Create a new file in the same directory (for example: hello.js).
2. Paste the following template code into your new file:

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Greets the user'),
    async execute(interaction) {
        await interaction.reply('Hello! 👋');
    },
};

3. Save the file.
4. Restart your bot in the console (press CTRL + C to stop it, then run node bot.js again).
5. Your new /hello command is now automatically registered and ready to use on Discord!
