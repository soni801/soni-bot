# Soni Bot

Soni Bot is a lightweight toolkit bot for small Discord communities. It was originally just meant for fun inside jokes,
but the functionality has since expanded to include things like moderation and utility.

Soni Bot can be added to servers upon request, given that I have at least some prior knowledge of the server. If you
want the functionality without inviting the bot itself, feel free to clone the repository and self-host it.

Soni Bot is built in JavaScript using Node.js. Discord functionality is provided by
[discord.js](https://discord.js.org/).

# Installation

This installation guide will assume you are running a Unix-like operating system. It is recommended to run Soni Bot as a
Docker container using the provided Docker file or docker-compose file. However, this will also briefly go over how to
run it as a standalone program.

First, clone this repository.

```shell
git clone https://github.com/soni801/soni-bot --depth 1
# or
git clone git@github.com:soni801/soni-bot --depth 1
```

Fill in the required configuration. For normal deployment, copy `.env.template` to `.env.production.local`, and fill all
variables. Note that Soni Bot needs a postgres database to launch properly. This can optionally be changed to a
different engine by editing `ormconfig.ts`. Make sure to populate `TOKEN` with a valid Discord API token, acquired from
the Discord developer dashboard.

If you are using Docker, you can now start the container. It should build and connect successfully.

If running without Docker, you need to start by installing the required packages and building the source:

```shell
pnpm install
pnpm run build
```

You can now start the bot using `node .`. It should launch and connect successfully.

Soni Bot is made with `pnpm` in mind as the recommended node package manager, but you can use whatever suits your
environment.

# Troubleshooting

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
