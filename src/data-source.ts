import "reflect-metadata";
import { DataSource } from "typeorm";
import Reminder from "./entity/Reminder";
import dotenv from "dotenv";
import ReactionRole from "./entity/ReactionRole";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DB,
    synchronize: true,
    logging: false,
    entities: [
        Reminder,
        ReactionRole
    ],
    migrations: [],
    subscribers: [],
});
