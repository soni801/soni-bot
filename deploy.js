const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const dotenv = require('dotenv');
const { commands } = require("./commands.json");

dotenv.config();

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);
rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands }).then(() => console.log("Successfully deployed commands."));
