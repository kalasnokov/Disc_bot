const sql = require("sqlite");
sql.open("./DB.sqlite");

function CP(message, args, client) {//1 = ok, -1 = fail
	let guild = client.guilds.get(config.guildId);
	let ret = guild.fetchMember(message.author).then(member => {
		for (let i = 0; i < config.ranks.length; i++) {
			//console.log(i);
			if(config.rankNums[i] == -1 && member.roles.some(r=>[config.ranks[i]].includes(r.name))){
				console.log("Administrator restricted function accessed by " + message.author.username);
				let term = "";
				for (let i = 0; i < args.length; i++) {
					term += args[i];
					if (i != args.length - 1) {
						term += " ";
					}
				}
				console.log("Function call: " + term);
				return 1;
			}
		}
		return -1;
	});
	return ret;
}

const config = require("./config.json");
const F = require("./functions.js");

function base() {
}

base.commands = {
	info: function (message) {
		message.channel.send(config.info);
	},

	usage: async function (message) {
		message.channel.send(config.usage1);
		//message.channel.send(config.usage2);
	},

	setPass: async function (message, args, client) {
		let ret = await CP(message, args, client);
		
		if(ret != 1){
			message.channel.send("You do not have access to this function.");
			return;
		}

		var term = F.functions.extractString(message, args);
		if (term != "-1") {
			config.pass = term;
			message.channel.send("password set to: " + term);
		} else {
			console.log("Error: missing parameters.")
		}
	},

	getPass: async function (message, args, client) {
		let ret = await CP(message, args, client);
		if(ret != 1){
			message.channel.send("You do not have access to this function.");
			return;
		}
			message.channel.send("Current password: " + config.pass);
	},

	operationInfo: async function (message, args, client) {
		let ret = await CP(message, args, client);
		if(ret != 1){
			message.channel.send("You do not have access to this function.");
			return;
		}
		message.channel.send(config.OP);
	},

	help: async function (message, args, client) {
		let ret = await CP(message, args, client);
		
		if(ret != 1){
			message.channel.send("You do not have access to this function.");
			return;
		}
		message.channel.send("Prefix: " + config.prefix + "\nCommands:\n");
		message.channel.send(Object.keys(base.commands));
	},

	addRank: async function (message, args, client) {
		let ret = await CP(message, args, client);
		
		if(ret != 1){
			message.channel.send("You do not have access to this function.");
			return;
		}
		let rank_name = "";
		for (let i = 1; i < args.length - 1; i++) {
			rank_name += args[i];
			if (i != args.length - 2) {
				rank_name += " ";
			}
		}
		let rank_value = args[args.length - 1];

		sql.get(`SELECT * FROM ranks WHERE rankId = "${rank_name}"`).then(row => {
			if (!row) {
				sql.run("INSERT INTO ranks (rankId, rankNum) VALUES (?, ?)", [rank_name, rank_value]);
				message.channel.send("Added rank with id \"" + rank_name + "\" and value " + rank_value + " to database.\n");
			} else {
				message.channel.send("This rank already exist.");
			}
		}).catch(() => {
			console.error;
			message.channel.send("Database error during addRank()!");
			console.log("Database error during addRank()");
		});
	},

	removeRank: async function (message, args, client) {
		let ret = await CP(message, args, client);
		
		if(ret != 1){
			message.channel.send("You do not have access to this function.");
			return;
		}
		let rank_name = "";
		for (let i = 1; i < args.length; i++) {
			rank_name += args[i];
			if (i != args.length - 1) {
				rank_name += " ";
			}
		}
		sql.run(`DELETE FROM ranks WHERE rankId = "${rank_name}"`);
		message.channel.send("Deleted rank with id \"" + rank_name + "\" from database.\n").catch(() => {
			console.error;
			message.channel.send("Database error during removeRank()!");
			console.log("Database error during removeRank()!");
		});
	},

	checkRank: async function (message, args, client) {
		let ret = await CP(message, args, client);
		
		if(ret != 1){
			message.channel.send("You do not have access to this function.");
			return;
		}
		let rank_name = "";
		for (let i = 1; i < args.length; i++) {
			rank_name += args[i];
			if (i != args.length - 1) {
				rank_name += " ";
			}
		}
		message.channel.send("Attemtping to find rank with id \"" + rank_name + "\".\n");
		sql.get(`SELECT * FROM ranks WHERE rankId = "${rank_name}"`).then(row => {
			if (!row) {
				message.channel.send("Rank not found.");
			} else {
				message.channel.send("Id: " + row.rankId + "\nValue: " + row.rankNum);
			}
		}).catch(() => {
			console.error;
			message.channel.send("Database error during checkRank()!");
			console.log("Database error during checkRank()!");
		});
	},
	
	register: function (message, args, client) {
		let guild = client.guilds.get(config.guildId);

		let f = 0;
		guild.fetchMember(message.author).then(member => {
			for (let i = 0; i < config.ranks.length; i++) {
				if (member.roles.some(r=>[config.ranks[i]].includes(r.name))) {
					f = 1;
				}
			}
			if (f == 0) {
				message.channel.send("Error: You currently have no rank.");
				console.log("Error: user \"" + message.author.username + "\" is missing a rank.");
				return;
			}
		});

		sql.get(`SELECT * FROM users WHERE userId = "${message.author.id}"`).then(row => {
			if (!row) {
				guild.fetchMember(message.author).then(member => {
					for (let i = 0; i < config.ranks.length; i++) {
						if (member.roles.some(r=>[config.ranks[i]].includes(r.name))) {
							console.log("New database entry: user \"" + message.author.username + "\" with rank \"" + config.ranks[i] + "\".\n");
							sql.run("INSERT INTO users (userId, rankups, lastPass) VALUES (?, ?, ?)", [message.author.id, config.rankNums[i], "password"]);
							message.channel.send("Registration complete, you can now use " + config.prefix + "rankup.");
							return;
						}
					}
				});
			} else {
				message.channel.send("You are already registered.");
				console.log("Error: user \"" + message.author.username + "\" tried to register twice.");
			}
		});
	},

rankup: function (message, args, client) {

		let guild = client.guilds.get(config.guildId);

		let f = 0;
		guild.fetchMember(message.author).then(member => {
			for (let i = 0; i < config.ranks.length; i++) {
				if (member.roles.some(r=>[config.ranks[i]].includes(r.name))) {
					f = 1;
				}
			}
			if (f == 0) {
				message.channel.send("Error: You currently have no rank.");
				console.log("Error: user \"" + message.author.username + "\" is missing a rank.");
				return;
			} else {
				let pass = F.functions.extractString(message, args);
				if (pass == config.pass) {
					sql.get(`SELECT * FROM users WHERE userId = "${message.author.id}"`).then(row => {
						if (!row) {
							message.channel.send("You need to use " + config.prefix + "register before you can use this function.");
							return;
						} else if (row.lastPass == pass) {
							message.channel.send("This password has already been used.");
							return;
						}
						let rankups = row.rankups + 1;
						sql.run(`UPDATE users SET rankups = "${rankups}" WHERE userId = "${message.author.id}"`);

						//RANK UP
						guild.fetchMember(message.author).then(member => {
							let rank = "";
							for (let ci = 0; ci < config.ranks.length; ci++) {
								for (let ri = 0; ri < row.rankups + 1; ri++) {
									if (config.rankNums[ci] == ri) {
										rank = config.ranks[ci];
										//console.log(ci + " " + ri + " " + rank);
									}
								}
							}
							for (let i = 0; i < config.ranks.length; i++) {
								let role = guild.roles.find("name", config.ranks[i]);
								if (role != guild.roles.find("name", rank) && config.rankNums[i] <= 0) {
									member.removeRole(role).catch(console.error);
								}
							}
							let role = guild.roles.find("name", rank);
							member.addRole(role).catch(console.error);
							sql.run(`UPDATE users SET lastPass = "${pass}" WHERE userId = "${message.author.id}"`);
							console.log("Selected rank: " + rank);
							console.log("Operation complete.");
							message.channel.send("Rankup operation successful.\nYour rank: \"" + rank + "\".\nRankups: " + (row.rankups + 1));
						});
					});
				} else if (pass == "-1") {
					//previous error already displayed
				} else {
					message.channel.send(config.wrongPasswordMessage);
				}
			}
		});
	},

	fetchRanks: async function (message, args, client) {
		if(message == null){
			var i = 0;
			sql.each("SELECT * FROM ranks", function (err, rankRow) {
				//console.log(rankRow.rankId);
				config.ranks[i] = rankRow.rankId;
				config.rankNums[i] = rankRow.rankNum;
				i++;
			});
			return config;
		}
	},

	resetRank: async function (message, args, client) {
		let ret = await CP(message, args, client);
		if(ret != 1){
			message.channel.send("You do not have access to this function.");
			return;
		}

		sql.get(`SELECT * FROM users WHERE userId = "${message.author.id}"`).then(row => {
			if (!row) {
				message.channel.send("You are not registered, use " + config.prefix + "register.");
			} else {
				sql.run(`UPDATE users SET rankups = 0 WHERE userId = "${message.author.id}"`);
				message.channel.send("Rank reset.");
			}
		}).catch(() => {
			console.error;
			message.channel.send("Database error during resetRank()!");
			console.log("Database error during resetRank()!");
		});
	}
};

module.exports = base;