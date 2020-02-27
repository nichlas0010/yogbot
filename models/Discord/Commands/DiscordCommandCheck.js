const DiscordCommand = require('../DiscordCommand.js');

class DiscordCommandApples extends DiscordCommand {

  constructor(subsystem) {
    super("check", "Check the ideal price of an item", subsystem);
  }

  onRun(message, args) {
    if(args.length < 2) {
		message.channel.send("Usage is `" + config.discord_command_character + "check [name] [upper-bound] <lower-bound (optional)> <amount(optional)> `");
		return;
	}
	var name = args[0];
	var upperbound = args[1];
	if(args.length < 3) {
		var amount = 1;
		var lowerbound = 0;
	} else {
		if(args.length < 4) {
			var amount = 1;
		} else {
			var amoutn = args[3];
		}
		var lowerbound = args[2];
	}
	
	let baseprice = 0
	
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
			
			let results = await query('SELECT value WHERE name = ?', [name]);
			if(results.length < 1) {
				message.channel.send("No item called \"" + name + "\"exists");
				return;
			}
			baseprice = results[0]
			
			
		} catch (e) {
			message.reply("An e-roar has occured: "+e);
		} finally {
			connection.release();
		}
	});
	let idealprice = 0;
	let fee = 0;
	let v0 = baseprice * amount
	let tax = 0.025
	for(var vr = lowerbound; vr <= upperbound; vr++) {
		let p0 = Math.log10(v0/vr);
		if(v0 < vr) {
			p0 = Math.pow(p0, 1.08);
		}
		let pr = Math.log10(vr/v0);
		if(v0 >= vr) {
			pr = Math.pow(pr, 1.08);
		}
		let thisfee = v0*tax*Math.pow(4, pr)+vr*tax*Math.pow(4, pr)*amount
		if(vr - thisfee > idealprice) {
			idealprice = vr;
			fee = thisfee;
		}
		
	}	
    message.channel.send("Ideal price: " + idealprice + ", fee: " + fee);
  }

}

module.exports = DiscordCommandApples;
