const { Client, Intents, MessageActionRow, MessageSelectMenu } = require("discord.js");
const { token } = require("./config.json");
// TODO: Get help menu from commands
const helpMenuContent = require("./help-menu.json");

// Create a Client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const version = "v4.0";

function randomNumber(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function time() { return `\x1b[2m[${new Date().toLocaleString()}]\x1b[0m`; }

function helpMessage(category = helpMenuContent.default)
{
    return {
        color: 0x3ba3a1,
        author: {
            name: "Soni Bot Help",
            icon_url: "https://cdn.discordapp.com/avatars/755787461040537672/8d9976baa914802cab2e4c9ecd5a9b29.webp"
        },
        fields: [
            {
                name: "Version",
                value: version,
                inline: true
            },
            {
                name: "Changelog",
                value: "See `changelog`",
                inline: true
            },
            {
                name: "\u200b",
                value: "\u200b"
            },
            category
        ],
        timestamp: new Date(),
        footer: {
            text: "Made with ❤️ by Soni"
        }
    };
}

function react(message, emoteName, emoteID, serverID)
{
    if (message.guild.id === serverID)
    {
        if (message.content.toLowerCase().startsWith(emoteName) ||
            message.content.toLowerCase().includes(" " + emoteName) ||
            message.content.toLowerCase().includes(":" + emoteName))
        {
            try
            {
                message.react(message.guild.emojis.cache.get(emoteID)).then(() => console.log(`${time()} Reacted with emote ${emoteName} in #${message.channel.name}, ${message.guild.name}`));
            }
            catch (err)
            {
                console.log(`${time()} Failed to react with emote ${emoteName} in #${message.channel.name}, ${message.guild.name} with error ${err}`);
            }
        }
    }
}

function respond(interaction, fields = [], edit = false)
{
    if (edit)
    {
        interaction.editReply({
            content: null,
            embeds: [
                {
                    color: 0x3ba3a1,
                    author: {
                        name: interaction.commandName,
                        icon_url: "https://cdn.discordapp.com/avatars/755787461040537672/8d9976baa914802cab2e4c9ecd5a9b29.webp"
                    },
                    fields: fields
                }
            ]
        });
    }
    else
    {
        interaction.reply({
            embeds: [
                {
                    color: 0x3ba3a1,
                    author: {
                        name: interaction.commandName,
                        icon_url: "https://cdn.discordapp.com/avatars/755787461040537672/8d9976baa914802cab2e4c9ecd5a9b29.webp"
                    },
                    fields: fields
                }
            ]
        });
    }

    console.log(`${time()} Executed command '${interaction.commandName}' in #${interaction.channel.name}, ${interaction.guild.name}`);
}

client.once("ready", () =>
{
    client.user.setActivity("/help", { type: "LISTENING" });
    console.log(`${time()} Ready!`);
});

client.on("messageCreate", message =>
{
    // Reactions
    react(message, "ew", "808988372948615178", "599483748337319955");
    react(message, "dbrug", "808989500058894376", "599483748337319955");
});

client.on("interactionCreate", interaction =>
{
    if (interaction.isSelectMenu())
    {
        switch (interaction.customId)
        {
            case "helpSelect":
                switch (interaction.values[0])
                {
                    case "soniBot": interaction.update({ embeds: [helpMessage(helpMenuContent.soniBot)] }); break;
                    case "useful": interaction.update({ embeds: [helpMessage(helpMenuContent.useful)] }); break;
                    case "moderation": interaction.update({ embeds: [helpMessage(helpMenuContent.moderation)] }); break;
                    case "fun": interaction.update({ embeds: [helpMessage(helpMenuContent.fun)] }); break;
                }
                console.log(`${time()} Responded to ${interaction.customId} change from ${interaction.user.username} in #${interaction.channel.name}, ${interaction.guild}`);
        }
    }
    else if (interaction.isCommand())
    {
        switch (interaction.commandName)
        {
            case "about":
                respond(interaction, [
                    {
                        name: "What am I?",
                        value: `I am a lightweight toolkit bot developed by ${client.users.cache.get("443058373022318593")}. I was originally just meant for fun inside jokes, but my functionality has since expanded to include things like moderation and utility.`
                    }
                ]);
                break;
            case "changelog":
                respond(interaction, [
                    {
                        name: `Changelog for ${version}:`,
                        value: `\u2022 The entire bot was rewritten again lol
                        \u2022 Now uses slash commands instead of prefix
                        \u2022 Improved code base and removed useless code
                        \u2022 Removed specific commands and added new, broader commands`
                    }
                ]);
                break;
            case "svensdum":
                interaction.reply("https://media.discordapp.net/attachments/757754446787641427/763366193834360832/sven.png");
                break;
            case "responses":
                respond(interaction, [
                    {
                        name: "Want the best selection of responses to send to your friends?",
                        value: "Check out [our response site](https://responses.yessness.com)"
                    }
                ]);
                break;
            case "family":
                interaction.reply("https://cdn.discordapp.com/attachments/773992993634910230/927521003209367622/family_tree.drawio3.png");
                break;
            case "uptime":
                respond(interaction, [
                    {
                        name: "Soni Bot uptime",
                        value: `${Math.round(client.uptime / 1000 / 60)} minutes`
                    }
                ]);
                break;
            case "ping":
                interaction.reply(":ping_pong: Testing ping");

                interaction.fetchReply().then(message =>
                {
                    respond(interaction, [
                        {
                            name: ":ping_pong: Pong!",
                            value: `Soni Bot latency: ${message.createdTimestamp - interaction.createdTimestamp}ms
                            API latency: ${Math.round(client.ws.ping)}ms`
                        }
                    ], true);
                });
                break;
            case "help":
                // TODO: Put this in the respond() function
                interaction.reply({
                    embeds: [
                        helpMessage()
                    ],
                    components: [
                        new MessageActionRow()
                            .addComponents(
                                new MessageSelectMenu()
                                    .setCustomId("helpSelect")
                                    .setPlaceholder("Select a category")
                                    .addOptions([
                                        {
                                            label: "Soni Bot",
                                            description: "Commands for information about the bot",
                                            value: "soniBot"
                                        },
                                        {
                                            label: "Useful",
                                            description: "Useful commands",
                                            value: "useful"
                                        },
                                        {
                                            label: "Moderation",
                                            description: "Commands for server moderation",
                                            value: "moderation"
                                        },
                                        {
                                            label: "Fun",
                                            description: "Fun, not so useful commands",
                                            value: "fun"
                                        }
                                    ])
                            )
                    ]
                });
                break;
            case "8ball":
                respond(interaction, [
                    {
                        name: "8 Ball",
                        value: (() =>
                        {
                            switch (randomNumber(0, 11))
                            {
                                case 0: return "why do you ask me";
                                case 1: return "find out yourself";
                                case 2: return "that may be the case";
                                case 3: return "i dont think it matters";
                                case 4: return "im not sure actually";
                                case 5: return "ask soni";
                                case 6: return "i cant be bothered to answer";
                                case 7: return "idk";
                                case 8: return "why do you feel the need to rely on 8 ball? take your own decisions.";
                                case 9: return "you can be the judge of that";
                                case 10: return "why would i know";
                                case 11: return "do you expect me to know?";
                            }
                        })()
                    }
                ]);
                break;
            case "dice":
                respond(interaction, [
                    {
                        name: "Die result",
                        value: randomNumber(1, 6).toString()
                    }
                ]);
                break;
            case "joke":
                respond(interaction, [
                    {
                        name: "Joke",
                        value: (() =>
                        {
                            switch (randomNumber(0, 20))
                            {
                                case 0: return "two guys stole a calendar. they got six months each.";
                                case 1: return "Autocorrect can go straight to he'll.";
                                case 2: return "two peanuts were walking down the street. one was a salted.";
                                case 3: return "i asked a friend to the gym, but they never showed up. i guess the two of us aren't gonna work out.";
                                case 4: return "today my son asked 'can i have a book mark?' and i burst into tears. 11 years old and he still doesn't know my name is brian.";
                                case 5: return "my wife is really mad at the fact that i have no sense of direction. so i packed up my stuff and right.";
                                case 6: return "how do you make holy water? you boil the hell out of it.";
                                case 7: return "im reading a book about anti-gravity. its impossible to put down!";
                                case 8: return "what do you call someone with no body and no nose? nobody knows.";
                                case 9: return "a slice of apple pie is $2.50 in Jamaica and $3.00 in the Bahamas. these are the pie rates of the caribbean.";
                                case 10: return "justice is a dish best served cold, if it were served warm it would be justwater.";
                                case 11: return "if you see a robbery at an Apple Store does that make you an iWitness?";
                                case 12: return "why did the invisible man turn down the job offer? he couldn't see himself doing it.";
                                case 13: return "what has two butts and kills people? an assassin";
                                case 14: return "why couldn't the bike stand up by itself? it was two tired.";
                                case 15: return "when a woman is giving birth, she is literally kidding.";
                                case 16: return "why was six sad? because seven eight nine.";
                                case 17: return "what did the buffalo say to his son when he dropped him off at school? bison.";
                                case 18: return "why did the crab never share? because he's shellfish.";
                                case 19: return "as a lumberjack, i know that i've cut exactly 2,417 trees. i know because every time i cut one, i keep a log.";
                                case 20: return "what do prisoners use to call each other? cell phones.";
                            }
                        })()
                    }
                ]);
                break;
            case "remind":
                respond(interaction, [
                    {
                        name: "Reminder",
                        value: "no. (this feature is not yet functional)"
                    }
                ]);
                // TODO: Actually implement this
                /*const timeout = Number(args[0]);

                if (isNaN(timeout))
                {
                    respond(interaction, [
                        {
                            name: "Wrong syntax",
                            value: "The specified time is not a number"
                        }
                    ]);
                }
                else
                {
                    let timeoutUnit = args[1];
                    let timeoutMilliseconds;
                    switch (timeoutUnit)
                    {
                        case "second": case "seconds": timeoutMilliseconds = timeout * 1000; break;
                        case "minute": case "minutes": timeoutMilliseconds = timeout * 1000 * 60; break;
                        case "hour": case "hours": timeoutMilliseconds = timeout * 1000 * 60 * 60; break;
                        default: respond("Wrong syntax", "Unrecognised time unit" + syntax); return;
                    }

                    let reminder = args[2];
                    if (args.length > 3) for (let l = 3; l < args.length; l++) reminder += " " + args[l];

                    setTimeout(function ()
                    {
                        respond("Reminder", `Remember ${reminder}`, message.author.toString(), false);
                        console.log(`${time()} Reminded ${message.author.username} of '${reminder}' after ${timeout} ${timeoutUnit}`);
                    }, timeoutMilliseconds);
                    respond("Reminder", `Ok, I will remind you of ${reminder} after ${timeout} ${timeoutUnit}`);
                }*/
        }
    }
});

client.login(token).then(() => console.log(`${time()} Successfully logged in`));
