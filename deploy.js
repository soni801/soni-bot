const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { clientId, token } = require("./config.json");

const commands = [
    new SlashCommandBuilder().setName("first").setDescription("first command"),
    new SlashCommandBuilder().setName("second").setDescription("second command")
].map(command => command.toJSON());

const rest = new REST({ version: "9" }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
    .then(() => console.log("Successfully registered application commands."));