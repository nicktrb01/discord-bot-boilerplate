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

// ==========================================
//            TRANSLATION SYSTEM
// ==========================================
client.t = function(key, replacements = {}) {
    let config = { language: 'en' };
    
    // Read the current language from config.json if it exists
    const configPath = path.join(__dirname, 'config.json');
    if (fs.existsSync(configPath)) {
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (e) {
            console.error("Error reading config.json, using default language (en)");
        }
    }

    const lang = config.language || 'en';
    const localesPath = path.join(__dirname, 'locales', `${lang}.json`);
    
    // Fallback to English if the locale file doesn't exist
    let translations = {};
    if (fs.existsSync(localesPath)) {
        try {
            translations = JSON.parse(fs.readFileSync(localesPath, 'utf8'));
        } catch (e) {
            console.error(`Error parsing language file ${lang}.json, falling back to English`);
            // Attempt to load English fallback safely
            const fallbackPath = path.join(__dirname, 'locales', 'en.json');
            if (fs.existsSync(fallbackPath)) {
                translations = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
            }
        }
    } else {
        const fallbackPath = path.join(__dirname, 'locales', 'en.json');
        if (fs.existsSync(fallbackPath)) {
            translations = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        }
    }

    let text = translations[key] || key;

    // Replace templates like {user} or {reason} with actual values
    for (const [placeholder, value] of Object.entries(replacements)) {
        text = text.replace(new RegExp(`{${placeholder}}`, 'g'), value);
    }
    return text;
};

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
        
        // Dynamic module execution loader (if modules like welcome.js or logs.js export a name/execute function but have no slash command data)
        if ('name' in command && 'execute' in command && !('data' in command)) {
            try {
                await command.execute(client);
                console.log(`Loaded background module: ${command.name}`);
            } catch (err) {
                console.error(`Error loading background module ${command.name}:`, err);
            }
        }
    }

    // Register slash commands globally with Discord API
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commandsData },
        );
        console.log('Successfully registered all slash commands application-wide.');
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
        
        // Dynamic multilingual error response
        const errorMessage = interaction.client.t('UNEXPECTED_ERROR');
        
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
});

client.login(TOKEN);
