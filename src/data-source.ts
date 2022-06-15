import "reflect-metadata"
import { DataSource } from "typeorm"
import Reminder from "./entity/Reminder";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "10.100.0.125",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "postgres",
    synchronize: true,
    logging: false,
    entities: [ Reminder ],
    migrations: [],
    subscribers: [],
})
