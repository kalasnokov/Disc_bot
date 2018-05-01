const Discord = require("discord.js");
const client = new Discord.Client();


var config = require("./src/config.json");
var BI = require("./src/BOT_INFO.json");

var C = require("./src/commands.js");
var F = require("./src/functions.js");

const S = config.prefix;

client.on("ready", (param) => {
    console.log("\n" + config.name + " is starting...\n");

    F.functions.setupDatabase();
    C.util.funcs.fetchRanks();
    C.util.funcs.fetchUsers();

    console.log("masterRank number: " + config.masterRank);

    console.log("\nStartup complete.\n");
});

client.on("message", (message) => {
    if (message.content.indexOf(S) !== 0) {
        return;
    }
    if (message.author.bot) {
        return;
    }
    const commandObject = parse(message);
    if (commandObject) {
        C.com.commands[commandObject.com](message, commandObject.args, client);
    } else {
        message.channel.send("Unknown command.");
    }
});

function parse(message) {
    var com = message.content.slice(S.length).trim().split(/ +/g)[0];
    const args = message.content.slice(S.length).trim().split(/ +/g);

    if (typeof C.com.commands[com] === 'function') {
        return { com, args };
    } else {
        return null;
    }
}

client.login(BI.token);