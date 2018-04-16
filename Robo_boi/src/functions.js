const sql = require("sqlite");
sql.open("./DB.sqlite");

const config = require("./config.json");

var async = require('asyncawait/async');
var await = require('asyncawait/await');

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs')); // adds Async() versions that return promises

function base() {
}

base.functions = {
	setupDatabase: function() {
		console.log("Database setup starting.\n");

		//USER DB
		var str = "";
		str += "CREATE TABLE IF NOT EXISTS ";
		str += "users"//table name
		str += " (";

		//table data
		str += "DBID INTEGER PRIMARY KEY AUTOINCREMENT, ";
		str += "userId TEXT, ";
		str += "rankups INTEGER, ";
		str += "lastPass TEXT";

		str += ")";
		console.log(str);
		sql.run(str);
		console.log("User database setup done.\n");

		//RANKS DB
		str = "";
		str += "CREATE TABLE IF NOT EXISTS ";
		str += "ranks"//table name
		str += " (";

		//table data
		str += "DBID INTEGER PRIMARY KEY AUTOINCREMENT, ";
		str += "rankId TEXT, ";
		str += "rankNum INTEGER";

		str += ")";
		console.log(str);
		sql.run(str);
		console.log("Ranks database setup done.\n");

		console.log("Database setup ending.\n");
	},

	extractString: function(message, args){
		var term = "";
		if (args.length == 1) {
			message.channel.send("Error: no arguments found in command string.\n");
			return "-1";
		}
		for (i = 1; i < args.length; i++) {
			term += args[i];
			if (i != args.length - 1) {
				term += " ";
			}
		}
		return term;
	},
}

module.exports = base;