const DiscordCommand = require('../DiscordCommand.js');

class DiscordCommandAdd extends DiscordCommand {

  constructor(subsystem) {
    super("add", "Add an item to the database", subsystem);
  }

  onRun(message, args) {
	let config = this.subsystem.manager.getSubsystem("Config").config;
	if(args.length < 2) {
		message.channel.send("Usage is `" + config.discord_command_character + "add [name] [base price]`");
		return;
	}
	let dbSubsystem = this.subsystem.manager.getSubsystem("Database");
	
	dbSubsystem.pool.getConnection(async (err, connection) => {
		if (err) {
			message.reply("Error contacting database, try again later.");
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
			query('UPDATE values SET value = ? WHERE name = ?', [args[1], args[0]]);
			query('INSERT INTO values (name, value) VALUES (?, ?) WHERE NOT EXISTS (SELECT * FROM values WHERE name = ?)', [args[0], args[1], args[0]]);
		} catch (e) {
			message.reply("An e-roar has occured: "+e);
		} finally {
			connection.release();
		}
	});

    message.channel.send(response);
  }

}

module.exports = DiscordCommandAdd;
