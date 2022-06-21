import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import dotenv from 'dotenv';
import { commands } from "./commands.json";

dotenv.config();

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN!);
rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: commands }).then(() => console.log("Successfully deployed commands."));
