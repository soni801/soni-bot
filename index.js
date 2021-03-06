const Discord = require("discord.js");
const config = require("../../Discord Bots/soni bot/config.json"); // TODO: New path

const client = new Discord.Client();
const prefix = "+";

function randomNumber(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function react(name, id, message, date)
{
    if (message.content.toLowerCase() === name ||
        message.content.toLowerCase().includes(" " + name) ||
        message.content.toLowerCase().includes(":" + name))
    {
        try
        {
            message.react(message.guild.emojis.cache.get(id)).then(() => console.log("[" + date.getHours() + ":" + date.getMinutes() + "] Reacted with emote " + name + " in #" + message.channel.name + ", " + message.guild.name));
        }
        catch (err)
        {
            console.log("[" + date.getHours() + ":" + date.getMinutes() + "] Failed to react with emote " + name + " in #" + message.channel.name + ", " + message.guild.name + " with error " + err);
        }
    }
}

client.on("message", function(message)
{
    // Initialise Date
    const date = new Date(); // TODO: Fix time formatting

    // Reactions
    react("ew", "769328775979728926", message, date);
    react("ew", "808988372948615178", message, date);
    react("dbrug", "808989500058894376", message, date);

    if (message.author.bot) return;                             // Ignore if message author is a bot
    if (!message.content.startsWith(prefix)) return;            // Ignore if message does not start with prefix

    const commandBody = message.content.slice(prefix.length);   // Remove prefix from string
    const args = commandBody.split(' ');                // Split args from command
    const command = args.shift().toLowerCase();                 // Store command in const command

    let reply = null;                                           // Initialise reply to null

    switch (command)
    {
        case "version"        : reply = "soni bot v2.12"; break;
        case "changelog"      : reply = "**v2.12 changelog:**\n-removed `sara` command\n-removed `jiggly` command\n-modified some replies\n-added `riki` command"; break;
        case "sven"           : reply = "here are some facts about sven:\n-he is fatal's idiot sandwich\n-is everyone's favourite feeder\n-special boi\n-thief"; break;
        case "fatal"          : reply = "nobody knows who or what fatal really is."; break;
        case "soni"           : reply = "is daddy uwu"; break;
        case "riki"           : reply = "is mommy uwu"; break;
        case "crush"          : reply = "i have a crush on riki bot :flushed:"; break;
        case "abenz"          : reply = "here are some facts about benny (nobody knows if they are true):\n-he be bri'ish\n-he is a stinky nerd who loves an idiot sandwich\n-father of the chuckens\n-lucio feeder smH\n-gets called Benjamin when in trouble"; break;
        case "svensdum"       : reply = "https://media.discordapp.net/attachments/757754446787641427/763366193834360832/sven.png"; break;
        case "intelligence"   : reply = "https://media.discordapp.net/attachments/655767387756298250/773322072448958495/image0.png?width=763&height=619"; break;
        case "understandable" : reply = "https://en.meming.world/images/en/thumb/a/af/Understandable%2C_Have_a_Great_Day.jpg/300px-Understandable%2C_Have_a_Great_Day.jpg"; break;
        case "shut"           : reply = "https://i.redd.it/6hfg80l3zw631.png"; break;
        case "help":
            reply = "**prefix is `" + prefix + "`**\n" +
                "commands are:\n" +
                "```json\n" +
                "\"version\": displays my current version\n" +
                "\"changelog\": displays the changes in the latest version\n" +
                "\"sven\": displays facts about sven\n" +
                "\"fatal\": idk\n" +
                "\"soni\": displays fact about daddy uwu\n" +
                "\"riki\": displays fact about mommy uwu\n" +
                "\"crush\": :flushed:\n" +
                "\"abenz\": displays facts about benny\n" +
                "\"svensdum\": svensdum\n" +
                "\"intelligence\": we are hitting intelligence levels that shouldn't even be possible\n" +
                "\"understandable\": understandable have a great day\n " +
                "\"shut\": shut\n" +
                "\"help\": displays this message\n" +
                "\"8ball\": need help with decisions?\n" +
                "\"dice\": roll a die\n" +
                "\"joke\": haha funny\n" +
                "\"remind\": get a reminder\n" +
                "```";
            break;
        case "8ball":
            if (args.length > 0)
            {
                const i = randomNumber(0, 11);
                switch (i)
                {
                    case 0:  reply = "why do you ask me"; break;
                    case 1:  reply = "find out yourself"; break;
                    case 2:  reply = "that may be the case"; break;
                    case 3:  reply = "i dont think it matters"; break;
                    case 4:  reply = "im not sure actually"; break;
                    case 5:  reply = "ask sven"; break;
                    case 6:  reply = "i cant be bothered to answer"; break;
                    case 7:  reply = "idk"; break;
                    case 8:  reply = "ask riki bot"; break;
                    case 9:  reply = "hmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm"; break;
                    case 10: reply = "why would i know"; break;
                    case 11: reply = "do you expect me to know?"; break;
                }
            }
            else reply = "you didnt even type in a question smH";
            break;
        case "dice":
            const i = randomNumber(0, 5);
            switch (i)
            {
                case 0: reply = "1"; break;
                case 1: reply = "2"; break;
                case 2: reply = "3"; break;
                case 3: reply = "4"; break;
                case 4: reply = "5"; break;
                case 5: reply = "6"; break;
            }
            break;
        case "joke":
            const j = randomNumber(0, 20);
            switch (j)
            {
                case 0  : reply = "two guys stole a calendar. they got six months each."; break;
                case 1  : reply = "Autocorrect can go straight to he'll."; break;
                case 2  : reply = "two peanuts were walking down the street. one was a salted."; break;
                case 3  : reply = "i asked a friend to the gym, but they never showed up. i guess the two of us aren't gonna work out."; break;
                case 4  : reply = "today my son asked 'can i have a book mark?' and i burst into tears. 11 years old and he still doesn't know my name is brian."; break;
                case 5  : reply = "my wife is really mad at the fact that i have no sense of direction. so i packed up my stuff and right."; break;
                case 6  : reply = "how do you make holy water? you boil the hell out of it."; break;
                case 7  : reply = "im reading a book about anti-gravity. its impossible to put down!"; break;
                case 8  : reply = "what do you call someone with no body and no nose? nobody knows."; break;
                case 9  : reply = "a slice of apple pie is $2.50 in Jamaica and $3.00 in the Bahamas. these are the pie rates of the caribbean."; break;
                case 10 : reply = "justice is a dish best served cold, if it were served warm it would be justwater."; break;
                case 11 : reply = "if you see a robbery at an Apple Store does that make you an iWitness?"; break;
                case 12 : reply = "why did the invisible man turn down the job offer? he couldn't see himself doing it."; break;
                case 13 : reply = "what has two butts and kills people? an assassin"; break;
                case 14 : reply = "why couldn't the bike stand up by itself? it was two tired."; break;
                case 15 : reply = "when a woman is giving birth, she is literally kidding."; break;
                case 16 : reply = "why was six sad? because seven eight nine."; break;
                case 17 : reply = "what did the buffalo say to his son when he dropped him off at school? bison."; break;
                case 18 : reply = "why did the crab never share? because he's shellfish."; break;
                case 19 : reply = "as a lumberjack, i know that i've cut exactly 2,417 trees. i know because every time i cut one, i keep a log."; break;
                case 20 : reply = "what do prisoners use to call each other? cell phones."; break;
            }
            break;
        case "remind":
            if (args.length > 1)
            {
                let query = args[1];
                if (args.length > 2)
                {
                    for (let l = 2; l < args.length; l++)
                    {
                        query += " " + args[l];
                    }
                }

                setTimeout(function ()
                {
                    message.reply("remember " + query).then(() => console.log("[" + date.getHours() + ":" + date.getMinutes() + "] Reminded " + message.author.username + " of " + query));
                }, parseInt(args[0]) * 1000);
                reply = "ok i will remind u after " + parseInt(args[0]) + " seconds";
            }
            else reply = "that's not how it works (use `" + prefix + "remind [delay in seconds] [thing to remind]`";
            break;
    }

    if (reply != null) message.channel.send(reply).then(() => console.log("[" + date.getHours() + ":" + date.getMinutes() + "] Responded to command '" + command + "' with arguments [" + args + "] in #" + message.guild.channels.cache.get(message.channel.id).name + ", " + message.guild.name));
});

client.login(config.BOT_TOKEN).then(() => console.log("Successfully logged in!"));