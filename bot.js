require('dotenv').config();

const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// Initialize client with required intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

client.once('ready', async () => {
    console.log(`Bot is online as ${client.user.tag}`);

    const commandsData = [];
    const currentFolder = __dirname;
    
    // Read all command files in the current directory
    const commandFiles = fs.readdirSync(currentFolder).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        // Skip core framework files
        if (file === 'bot.js' || file === 'index.js') continue;

        const filePath = path.join(currentFolder, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commandsData.push(command.data);
        }
    }

    // Register slash commands globally with Discord API
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commandsData },
        );
    } catch (error) {
        console.error('Error registering application commands:', error);
    }
});

// Handle command execution
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing command /${interaction.commandName}:`, error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

client.login(TOKEN);

