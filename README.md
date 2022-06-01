# Soni Bot

Soni Bot is a lightweight toolkit bot for small Discord communities. It was originally just meant for fun inside jokes,
but the functionality has since expanded to include things like moderation and utility.

Soni Bot can be added to servers upon request, given that I have at least some prior knowledge of the server. If you
want the functionality without inviting the bot itself, feel free to clone the repository and self-host it.

Soni Bot is built in JavaScript using Node.js. Discord functionality is provided by
[discord.js](https://discord.js.org/).

# Installation

The installation guide will presume you are running a Unix-like operating system.

It is recommended to run Soni Bot inside a Docker container, preferably with Docker Compose. However, if you can not or
do not wish to run it through docker, you can run it manually.

### Docker Compose

1. Clone the repository

   ```shell
   $ git clone https://github.com/soni801/soni-bot.git
   $ cd soni-bot
   ```

2. Edit `docker-compose.yml` to include credentials

   ```shell
   $ vim docker-compose.yml # use any text editor (e.g. nano)
   ```

   Replace `<bot_token>` and `<bot_client_id>` with their respective values, acquired from the Discord
   developer dashboard.

3. Start the Docker container with Docker Compose

   ```shell
   $ docker-compose up -d # use -d to launch detached (optional)
   ```

4. If launched detached, optionally check the logs to make sure that it works

   ```shell
   $ docker-compose logs -f
   ```

### Without Docker

1. Make sure you have nodejs and npm installed.

   ```shell
   $ node -v # should be >=v18.0
   $ npm -v # should be >=v8.0
   ```

   Install/update if needed, using your method of choice. Node 18 is not required, but recommended.

2. Clone the repository

   ```shell
   $ git clone https://github.com/soni801/soni-bot.git
   $ cd soni-bot
   ```

3. Install the required packages

   ```shell
   $ npm install
   ```

4. Create the config file

   Soni Bot uses environment variables for its configuration. The easiest way to define these are using a `.env` file:

   ```shell
   $ vim .env # use any text editor (e.g. nano)
   ```

   The config file must contain the following:

   ```
   TOKEN=<bot_token>
   CLIENT_ID=<bot_client_id>
   ```

   Make sure to replace `<bot_token>` and `<bot_client_id>` with their respective values, acquired from the Discord
   developer dashboard.

5. Deploy the bot commands

   ```shell
   $ node deploy
   ```

6. Run the bot

   ```shell
   $ node .
   ```

   _Note: This will not start the process detached. If you need the bot to run detached, check out some other guides on
   how to do this in your shell. It will not be covered here._

# Troubleshooting

If the bot does not work, make sure to read the error message thoroughly. It will most likely explain the issue. Common
problems include:

- Not providing a valid client ID or bot token
- Giving the bot insufficient permissions
  - The bot needs permissions to everything it does, as it does not have foolproof error catches for permission issues.
  It is recommended to give the bot access to everything it can do, including future features. (permission scope
  `1643026836566`)

The bot logs all the actions it does; it is recommended to check the logs semi-frequently. The logs will also show any
potential issues, as most crashes are silent. If run through Docker, the container will by default restart on error.
This is not the case for manual installation, so it is recommended to check the logs more often with a manual
installation. You can also use process managers like [PM2](https://pm2.keymetrics.io/) to automate restarts without
Docker.
