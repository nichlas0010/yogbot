const DiscordCommand = require('../DiscordCommand.js');

class DiscordCommandAdd extends DiscordCommand {

  constructor(subsystem) {
    super("add", "Add an item to the database", subsystem);
  }

  onRun(message, args) {
	let config = this.subsystem.manager.getSubsystem("Config").config;
	args.shift();
	if(args.length < 2) {
		message.channel.send("Usage is `" + config.discord_command_character + "add [name] [base price]`");
		return;
	}
	let dbSubsystem = this.subsystem.manager.getSubsystem("Database");
	
	dbSubsystem.pool.getConnection(async (err, connection) => {
		if (err) {
			message.reply("Error contacting database: " + err);
			return
		}
		try {
			function query(q, a = []) { // why did you pick an SQL library with no promise support reeeeeeeeee
				return new Promise((resolve, reject) => {
					connection.query(q, a, (error, results) => {
						if(error)
							reject(error);
						else
							resolve(results);
					});
				});
			}
			
			let results = await query('SELECT * FROM costs WHERE name = ?', [args[0].toLowerCase()]);
			if(results.length < 1) {
			  await query('INSERT INTO costs (name, value) VALUES (?, ?)', [args[0].toLowerCase(), args[1]]);
			  message.channel.send("Price of " + args[0] + " set to " + args[1]);
			} else {
			  await query('UPDATE costs SET value = ? WHERE name = ?', [args[1], args[0].toLowerCase()]);
			  message.channel.send("Price of " + args[0].toLowerCase() + " updated to " + args[1]);
			}
			
		} catch (e) {
			message.reply("An e-roar has occured: "+e);
		} finally {
			connection.release();
		}
	});

  }

}

module.exports = DiscordCommandAdd;
