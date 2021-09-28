const { Client, Intents, MessageActionRow, MessageSelectMenu } = require("discord.js");
const { token } = require("./config.json");
const helpMenuContent = require("./help-menu.json");

// Create a Client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const version = "v3.3";
const prefix = "+";

const helpMenuHeader = [
    {
        name: "Version",
        value: version,
        inline: true
    },
    {
        name: "Prefix",
        value: prefix,
        inline: true
    },
    {
        name: "\u200b",
        value: "\u200b"
    }
]

let message;

function randomNumber(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function doubleDigit(number) { return number.toString().length < 2 ? `0${number}` : number; }
function time() { const date = new Date(); return `[${doubleDigit(date.getHours())}:${doubleDigit(date.getMinutes())}]`; }

function react(emoteName, emoteID, serverID)
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

function send(content)
{
    message.channel.send(content);
    console.log(`${time()} Responded to '${message.content.substr(1)}' in #${message.channel.name}, ${message.guild.name}`);
}

function respond(title, description, content, log = true)
{
    message.channel.send(
        {
            content: content,
            embeds: [
                {
                    color: 0x3ba3a1,
                    author: {
                        name: "Soni Bot",
                        icon_url: "https://cdn.discordapp.com/avatars/755787461040537672/8d9976baa914802cab2e4c9ecd5a9b29.webp"
                    },
                    fields: [
                        {
                            name: title,
                            value: description
                        }
                    ]
                }
            ]
        }
    ).then(() => { if (log) console.log(`${time()} Executed command '${message.content}' in #${message.channel.name}, ${message.guild.name}`); });
}

client.once("ready", () => console.log(`${time()} Ready!`));
client.on("messageCreate", function(m)
{
    // Ignore message if author is a bot
    if (m.author.bot) return;

    // Store message globally
    message = m;

    // Reactions
    react("ew", "769328775979728926", "329019997894475777");
    react("ew", "808988372948615178", "599483748337319955");
    react("dbrug", "808989500058894376", "599483748337319955");

    if (message.author.id === "170927851577671680") message.react("😐").then(() => console.log(`${time()} Reacted with neutral_face on message from boremac`)); // React with neutral_face if message author is boremac

    if (!message.content.startsWith(prefix)) return;            // Ignore message if it does not start with prefix
    const commandBody = message.content.slice(prefix.length);   // Remove prefix from string
    const args = commandBody.split(' ');                        // Split args from command
    const command = args.shift().toLowerCase();                 // Store command in variable

    switch (command)
    {
        case "changelog": respond(`${version} changelog:`, "\u2022 Significant backend improvements\n\u2022 Added ability to use singular form time units in `remind` command\n\u2022 Added `ping` command\n\u2022 Added `uptime` command"); break;
        case "sven": respond("Facts about Sven", "\u2022 He is Fatal's idiot sandwich\n\u2022 Is everyone's favourite feeder\n\u2022 Special boi\n\u2022 Thief"); break;
        case "fatal": respond("Fatal", "Nobody knows who or what Fatal really is."); break;
        case "soni": respond("Soni", "Is daddy uwu"); break;
        case "riki": respond("Riki", "Is mommy uwu"); break;
        case "abenz": respond("Some facts about benny", "\u2022 He be bri'ish\n\u2022 He is a stinky nerd who loves an idiot sandwich\n\u2022 Father of the chuckens\n\u2022 Lucio feeder smH\n\u2022 Gets called Benjamin when in trouble"); break;
        case "shadow": respond("Shadow", `he's just a cringe bri'ish ""person"" with too much money`) ; break;
        case "svensdum": send("https://media.discordapp.net/attachments/757754446787641427/763366193834360832/sven.png"); break;
        case "intelligence": send("https://media.discordapp.net/attachments/655767387756298250/773322072448958495/image0.png?width=763&height=619"); break;
        case "understandable": send("https://en.meming.world/images/en/thumb/a/af/Understandable%2C_Have_a_Great_Day.jpg/300px-Understandable%2C_Have_a_Great_Day.jpg"); break;
        case "shut": send("https://i.redd.it/6hfg80l3zw631.png"); break;
        case "family": send("https://media.discordapp.net/attachments/824926463908249640/881986397261692938/family_tree_6.png"); break;
        case "uptime": respond("Uptime", `${Math.round(client.uptime / 1000 / 60)} minutes`); break;
        case "ping":
            message.channel.send("Loading data").then(async (msg) =>
            {
                msg.delete();
                respond("Pong", `Latency is ${msg.createdTimestamp - message.createdTimestamp}ms\nAPI latency is ${Math.round(client.ws.ping)}ms`);
            });
            break;
        case "help":
            message.channel.send(
                {
                    embeds: [
                        {
                            color: 0x3ba3a1,
                            author: {
                                name: "Soni Bot Help",
                                icon_url: "https://cdn.discordapp.com/avatars/755787461040537672/8d9976baa914802cab2e4c9ecd5a9b29.webp"
                            },
                            fields: [
                                helpMenuHeader,
                                helpMenuContent.soniBot
                            ],
                            timestamp: new Date(),
                            footer: {
                                text: "Made with ❤️ by Soni"
                            }
                        }
                    ],
                    components: [
                        new MessageActionRow()
                            .addComponents(
                                new MessageSelectMenu()
                                    .setCustomId("helpSelect")
                                    .setPlaceholder("Select a help category")
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
                }
            ).then(() => console.log(`${time()} Executed command '${message.content}' in #${message.channel.name}, ${message.guild.name}`));
            break;
        case "8ball":
            if (args.length > 0)
            {
                const i = randomNumber(0, 11);
                switch (i)
                {
                    case 0: respond("8 Ball", "why do you ask me"); break;
                    case 1: respond("8 Ball", "find out yourself"); break;
                    case 2: respond("8 Ball", "that may be the case"); break;
                    case 3: respond("8 Ball", "i dont think it matters"); break;
                    case 4: respond("8 Ball", "im not sure actually"); break;
                    case 5: respond("8 Ball", "ask sven"); break;
                    case 6: respond("8 Ball", "i cant be bothered to answer"); break;
                    case 7: respond("8 Ball", "idk"); break;
                    case 8: respond("8 Ball", "ask riki bot"); break;
                    case 9: respond("8 Ball", "hmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm"); break;
                    case 10: respond("8 Ball", "why would i know"); break;
                    case 11: respond("8 Ball", "do you expect me to know?"); break;
                }
            }
            else respond("Wrong syntax", "You didn't even type in a question smH");
            break;
        case "dice":
            const i = randomNumber(0, 5);
            switch (i)
            {
                case 0: respond("Die result", "1"); break;
                case 1: respond("Die result", "2"); break;
                case 2: respond("Die result", "3"); break;
                case 3: respond("Die result", "4"); break;
                case 4: respond("Die result", "5"); break;
                case 5: respond("Die result", "6"); break;
            }
            break;
        case "joke":
            const j = randomNumber(0, 20);
            switch (j)
            {
                case 0: respond("Joke", "two guys stole a calendar. they got six months each."); break;
                case 1: respond("Joke", "Autocorrect can go straight to he'll."); break;
                case 2: respond("Joke", "two peanuts were walking down the street. one was a salted."); break;
                case 3: respond("Joke", "i asked a friend to the gym, but they never showed up. i guess the two of us aren't gonna work out."); break;
                case 4: respond("Joke", "today my son asked 'can i have a book mark?' and i burst into tears. 11 years old and he still doesn't know my name is brian."); break;
                case 5: respond("Joke", "my wife is really mad at the fact that i have no sense of direction. so i packed up my stuff and right."); break;
                case 6: respond("Joke", "how do you make holy water? you boil the hell out of it."); break;
                case 7: respond("Joke", "im reading a book about anti-gravity. its impossible to put down!"); break;
                case 8: respond("Joke", "what do you call someone with no body and no nose? nobody knows."); break;
                case 9: respond("Joke", "a slice of apple pie is $2.50 in Jamaica and $3.00 in the Bahamas. these are the pie rates of the caribbean."); break;
                case 10: respond("Joke", "justice is a dish best served cold, if it were served warm it would be justwater."); break;
                case 11: respond("Joke", "if you see a robbery at an Apple Store does that make you an iWitness?"); break;
                case 12: respond("Joke", "why did the invisible man turn down the job offer? he couldn't see himself doing it."); break;
                case 13: respond("Joke", "what has two butts and kills people? an assassin"); break;
                case 14: respond("Joke", "why couldn't the bike stand up by itself? it was two tired."); break;
                case 15: respond("Joke", "when a woman is giving birth, she is literally kidding."); break;
                case 16: respond("Joke", "why was six sad? because seven eight nine."); break;
                case 17: respond("Joke", "what did the buffalo say to his son when he dropped him off at school? bison."); break;
                case 18: respond("Joke", "why did the crab never share? because he's shellfish."); break;
                case 19: respond("Joke", "as a lumberjack, i know that i've cut exactly 2,417 trees. i know because every time i cut one, i keep a log."); break;
                case 20: respond("Joke", "what do prisoners use to call each other? cell phones."); break;
            }
            break;
        case "remind":
            if (args.length > 2)
            {
                const timeout = Number(args[0]);
                if (isNaN(timeout)) respond("Wrong syntax", "The specified time is not a number\nUse `remind [delay (s)] <second(s)|minute(s)|hour(s)> [reminder]`");
                else
                {
                    let timeoutUnit = args[1];
                    let timeoutMilliseconds;
                    switch (timeoutUnit)
                    {
                        case "second": case "seconds": timeoutMilliseconds = timeout * 1000; break;
                        case "minute": case "minutes": timeoutMilliseconds = timeout * 1000 * 60; break;
                        case "hour": case "hours": timeoutMilliseconds = timeout * 1000 * 60 * 60; break;
                        default: respond("Wrong syntax", "Unrecognised time unit\nUse `remind [delay (s)] <second(s)|minute(s)|hour(s)> [reminder]`"); return;
                    }

                    let reminder = args[2];
                    if (args.length > 3) for (let l = 3; l < args.length; l++) reminder += " " + args[l];

                    setTimeout(function ()
                    {
                        respond("Reminder", `Remember ${reminder}`, message.author.toString(), false);
                        console.log(`${time()} Reminded ${message.author.username} of '${reminder}' after ${timeout} ${timeoutUnit}`);
                    }, timeoutMilliseconds);
                    respond("Reminder", `Ok, I will remind you of ${reminder} after ${timeout} ${timeoutUnit}`);
                }
            }
            else respond("Wrong syntax", "Not enough arguments\nUse `remind [delay (s)] <second(s)|minute(s)|hour(s)> [reminder]`");
            break;
    }
});

client.login(token).then(() => console.log(`${time()} Successfully logged in`));