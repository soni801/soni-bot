import { existsSync } from 'fs';
import type { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import './src/util/dotenv';

const entities = process.env.NODE_ENV !== 'development' ? ['dist/**/*.entity.js'] : ['src/**/*.entity.ts'];
const migrations = process.env.NODE_ENV !== 'development' ? ['dist/src/migration/*.js'] : ['src/migration/*.ts'];

/**
 * The typeorm config
 *
 * @type {DataSourceOptions}
 * @author theS1LV3R
 * @since 6.0.0
 * @see {@link DataSourceOptions}
 */
let ormConfig: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASS ?? 'postgres',
    database: process.env.DB_NAME ?? 'discord_bot',
    synchronize: false,
    logging: ['error'],
    namingStrategy: new SnakeNamingStrategy(),

    entities,
    migrations
};

// If ormconfig.local.ts exists, merge these defaults with the values from it
if (existsSync('./ormconfig.local.ts'))
{
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const localConfig = require('./ormconfig.local.ts');
    ormConfig = Object.assign(ormConfig, localConfig);
}

export default ormConfig;
