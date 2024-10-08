# Soni Bot

Soni Bot is a lightweight toolkit bot for small Discord communities. It was originally just meant for fun inside jokes,
but the functionality has since expanded to include things like moderation and utility.

Soni Bot can be added to servers upon request, given that I have at least some prior knowledge of the server. If you
want the functionality without inviting the bot itself, feel free to clone the repository and self-host it.

Soni Bot is built with TypeScript using [Bun](https://bun.sh/).
Discord functionality is provided by [discord.js](https://discord.js.org/).

## Deploying

There are two primary ways in which you can deploy Soni Bot on your own:

### Using Docker (recommended)

To run Soni Bot through Docker Compose, use the provided [docker-compose.yml](docker-compose.yml) file.

If you want to use 'Plain Docker,' you can use the following template command to start the container:

```shell
docker run -d \
-e TOKEN=changeme \
-e DB_HOST=changeme \
-e DB_USER=changeme \
-e DB_PASS=changeme \
-e DB_NAME=changeme \
ghcr.io/soni801/soni-bot
```

If using plain Docker, also make sure you have a PostgreSQL database running separately.

### Manual installation

If you don't want to use Docker, you can run Soni Bot locally with Bun:

1. Clone the repository
   ```shell
   git clone --depth 1 https://github.com/soni801/soni-bot
   cd soni-bot
   ```
2. Copy `.env.template` to `.env.production.local`, and populate all the fields.
   Note that Soni Bot needs a PostgreSQL database running separately to work properly.
   This can optionally be changed to a different database engine by editing `ormconfig.ts`.
3. Install the dependencies and build Soni Bot
   ```shell
   bun install
   bun run build
   ```
4. Run Soni Bot!
   ```shell
   bun run start
   ```

## Updating

If you're using **Docker Compose**, it's enough to restart the container. It'll automatically fetch the latest image:

```shell
docker compose down
docker compose up -d
```

If you're using **plain Docker**, you need to re-pull the image and then restart the container:

```shell
docker pull ghcr.io/soni801/soni-bot:latest
docker stop soni-bot
```

To start the container, run the same command as the first time you launched it.

With a **manual installation**, you'll have to stop the bun process, pull the changes, rebuild and restart:
```shell
git pull
bun install # make sure that all packages are up to date
bun run build
bun run start
```

## Configuration

Soni Bot is configured using environment variables.
A more detailed explanation can be found in the [template](.env.template) .env file.

## Troubleshooting

If the bot does not work, make sure to read the error message thoroughly. It will most likely explain the issue. Common
problems include:

- Not providing a valid client ID or bot token
- Giving the bot insufficient permissions
    - The bot needs permissions to everything it does, as it does not have foolproof error catches for permission
      issues. It is recommended to give the bot access to everything it can do, including future features. (permission
      scope `1374658358336`)

The bot logs all the actions it does; it is recommended to check the logs semi-frequently. The logs will also show any
potential issues, as most crashes are silent. If run through Docker, the container will by default restart on error.
This is not the case for manual installation, so it is recommended to check the logs more often with a manual
installation. You can also use process managers like [PM2](https://pm2.keymetrics.io/) to automate restarts without
Docker.

Logs are printed to `stdout`,
and also saved in both text and JSON format to the `logs/` directory (generated at runtime).
