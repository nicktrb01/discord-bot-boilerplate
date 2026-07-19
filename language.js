const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('language')
        .setDescription('Change the bot language for this server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('set')
                .setDescription('Select the language')
                .setRequired(true)
                .addChoices(
                    { name: 'English', value: 'en' },
                    { name: 'Deutsch', value: 'de' }
                )),

    async execute(interaction) {
        const selectedLang = interaction.options.getString('set');
        const configPath = path.join(__dirname, '..', 'config.json');

        let config = {};
        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }

        config.language = selectedLang;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
      
        return interaction.reply({ 
            content: interaction.client.t('LANGUAGE_CHANGED'), 
            ephemeral: true 
        });
    },
};
