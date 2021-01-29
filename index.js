const Discord = require("discord.js");
const config = require("../../Discord Bots/soni bot/config.json");

const client = new Discord.Client();
const prefix = "+";

function randomNumber(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

client.on("message", function(message)
{
    // Initialise Date
    const date = new Date();

    // React if message has 'ew'
    if ((message.content.length === 2 && message.content.toLowerCase().includes("ew")) || message.content.toLowerCase().includes(" ew"))
    {
        try
        {
            message.react(message.guild.emojis.cache.get('769328775979728926'));
            console.log("[" + date.getHours() + ":" + date.getMinutes() + "] Reacted with ew in #" + message.channel.name + ", " + message.guild.name);
        }
        catch (err)
        {
            console.log("[" + date.getHours() + ":" + date.getMinutes() + "] Failed to react with ew in #" + message.channel.name + ", " + message.guild.name);
        }
    }

    if (message.author.bot) return;                             // Ignore if message author is a bot
    if (!message.content.startsWith(prefix)) return;            // Ignore if message does not start with prefix
    if (message.author.id === "275989054082777088") return;     // Ignore if message author is Araveila

    const commandBody = message.content.slice(prefix.length);   // Remove prefix from string
    const args = commandBody.split(' ');                // Split args from command
    const command = args.shift().toLowerCase();                 // Store command in const command

    let reply = null;                                           // Initialise reply to null

    switch (command)
    {
        case "version"        : reply = "soni bot v2.9"; break;
        case "help"           : reply = "**prefix is `+`**\ncommands are:```version, help, changelog, sven, ara, sara, fatal, soni, abenz, shadow, svensdum, intelligence, understandable, shut, 8ball, dice, joke, remind```"; break;
        case "changelog"      : reply = "v2.9 changelog:\n-added `understandable` command"; break;
        case "sven"           : reply = "here are some facts about sven:\n-he is the second best bot in this server after me\n-he is fatal's idiot sandwich\n-is everyone's favourite feeder\n-someone calls him special\n-thief"; break;
        case "ara"            : reply = "is ugly"; break;
        case "sara"           : reply = "is mommy uwu"; break;
        case "fatal"          : reply = "nobody knows who or what fatal really is."; break;
        case "soni"           : reply = "is my creator uwu"; break;
        case "abenz"          : reply = "here are some facts about benny (nobody knows if they are true):\n-he be bri'ish\n-he is a stinky nerd who loves an idiot sandwich\n-father of the chuckens\n-lucio feeder smH\n-gets called Benjamin when in trouble"; break;
        case "shadow"         : reply = "will never hit 100k subs"; break;
        case "svensdum"       : reply = "https://media.discordapp.net/attachments/757754446787641427/763366193834360832/sven.png"; break;
        case "intelligence"   : reply = "https://media.discordapp.net/attachments/655767387756298250/773322072448958495/image0.png?width=763&height=619"; break;
        case "understandable" : reply = "https://en.meming.world/images/en/thumb/a/af/Understandable%2C_Have_a_Great_Day.jpg/300px-Understandable%2C_Have_a_Great_Day.jpg"; break;
        case "shut"           : reply = "https://i.redd.it/6hfg80l3zw631.png"; break;
        case "8ball":
            if (args.length > 0)
            {
                const i = randomNumber(0, 9);
                switch (i)
                {
                    case 0: reply = "why do you ask me"; break;
                    case 1: reply = "find out yourself"; break;
                    case 2: reply = "that may be the case"; break;
                    case 3: reply = "i dont think it matters"; break;
                    case 4: reply = "im not sure actually"; break;
                    case 5: reply = "ask sven"; break;
                    case 6: reply = "i cant be bothered to answer"; break;
                    case 7: reply = "idk"; break;
                    case 8: reply = "i dont know if thats true tbh"; break;
                    case 9: reply = "hmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm"; break;
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
                    message.reply("remember " + query);
                }, parseInt(args[0]) * 1000);
                reply = "ok i will remind u after " + parseInt(args[0]) + " seconds";
            }
            else reply = "thats not how it works (use `" + prefix + "remind [delay in seconds] [thing to remind]`";
            break;
    }

    if (reply != null)
    {
        message.channel.send(reply);
        console.log("[" + date.getHours() + ":" + date.getMinutes() + "] Responded to command '" + command + "' with arguments [" + args + "] in #" + message.channel.name + ", " + message.guild.name);
        reply = null;
    }
});

client.login(config.BOT_TOKEN);