const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { clientId, token } = require("./config.json");

const commands = require("./commands.json");

const rest = new REST({ version: "9" }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands }).then(() => console.log("Successfully deployed commands."));