const DiscordCommand = require('../DiscordCommand.js');

class DiscordCommandCheck extends DiscordCommand {

  constructor(subsystem) {
    super("check", "Check the ideal price of an item", subsystem);
  }

  onRun(message, args) {
	args.shift();
	let config = this.subsystem.manager.getSubsystem("Config").config;
    if(args.length < 2) {
		message.channel.send("Usage is `" + config.discord_command_character + "check [name] [upper-bound] <lower-bound (optional)>`");
		return;
	}
	var name = args[0].toLowerCase();
	var upperbound = args[1];
	if(args.length < 3) {
		var amount = 1;
		var lowerbound = 1;
	} else {
		var lowerbound = args[2];
	}
	
	let baseprice = 0
	
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
			
			let results = await query('SELECT * FROM `costs` WHERE `name` = ?', [name]);
			if(results.length < 1) {
				message.channel.send("No item called \"" + name + "\"exists");
				return;
			}
			baseprice = results[0].value;
			let idealprice = 0;
			let fee = 0;
			let v0 = baseprice
			let tax = 0.025
			for(var vr = lowerbound; vr <= upperbound; vr++) {
				let p0 = Math.abs(Math.log10(v0/vr));
				if(v0 < vr) {
					p0 = p0**1.08
				}
				let pr = Math.abs(Math.log10(vr/v0));
				if(v0 >= vr) {
					pr = pr**1.08
				}
				let thisfee = v0*tax*(4**p0)+vr*tax*(4**pr)
				if(vr - thisfee > idealprice) {
					idealprice = vr;
					fee = thisfee;
				}
				
			}	
			message.channel.send("Ideal price: " + idealprice + ", fee: " + fee);
			
		} catch (e) {
			message.reply("An e-roar has occured: "+e);
		} finally {
			connection.release();
		}
	});

  }

}

module.exports = DiscordCommandCheck;
