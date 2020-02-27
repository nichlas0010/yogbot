const Subsystem = require('../Subsystem.js');
const Discord = require('discord.js');
const fs = require('fs');
const winston = require('winston');

class SubsystemDiscord extends Subsystem {
  constructor(manager) {
    super("Discord", manager);
    this.client = new Discord.Client();

    this.commands = [];
  }

  setup(callback) {
    super.setup();
    this.createLogger();

    var config = this.manager.getSubsystem("Config").config;
    this.client.login(config.discord_token).then(atoken => {
      this.loadCommands();
	this.client.user.setActivity("I AM GOD");
      callback();
    }).catch((err) => {
      callback(err);
    });

    this.client.on('message', message => {
      this.processMessage(message);
    });
  }

  loadCommands() {
    fs.readdir("./models/Discord/Commands/", (err, files) => {
      files.forEach(file => {
        var commandPath = file.split(".")[0];

        const CommandClass = require('../Discord/Commands/' + commandPath + '.js');
        this.commands.push(new CommandClass(this));

      });
    });
  }

  processMessage(message) {
    if (message.author.bot) {
      return;
    }

    if (message.guild == undefined) {
      return;
    }

    //Make sure we have the command character and atleast one character more.
    if (message.content.length < 2) {
      return;
    }

    var firstCharacter = message.content.substring(0, 1);
    var content = message.content.substring(1);
    var config = this.manager.getSubsystem("Config").config;

    if (firstCharacter === config.discord_command_character) {
      var split = content.split(" ");

      var command = this.getCommand(split[0]);

      if (!command) {
        message.reply("We couldnt find that command, try using `" + config.discord_command_character + "help` to see a list of commands.");
        return;
      }

    command.onRun(message, split);
    }
  }

  createLogger() {
    var format = winston.format.printf(info => {
      return `${info.timestamp} [${info.level}]: ${info.message}`;
    });

    this.logger = winston.createLogger({
      transports: [
        new winston.transports.File({
          filename: "logs/discord.log",
          format: winston.format.combine(winston.format.timestamp(), format)
        })
      ]
    });
  }

  getCommand(commandName) {
    for (var command of this.commands) {
      if (command.name.toUpperCase() === commandName.toUpperCase()) {
        return command;
      }
    }

    return false;
  }

  getChannel(guild, channelID) {
    return guild.channels.get(channelID);
  }

  getLogChannel(guild) {
    for (var channel of guild.channels.array()) {
      if (channel.id === this.manager.getSubsystem("Config").config.discord_channel_discord_mod_log) {
        return channel;
      }
    }
  }

  getFeedbackChannel(guild) {
    for (var channel of guild.channels.array()) {
      if (channel.id === this.manager.getSubsystem("Config").config.discord_channel_discord_public_log) {
        return channel;
      }
    }
  }

  getPrimaryGuild() {
    for (var guild of this.client.guilds.array()) {
      if (guild.id === this.manager.getSubsystem("Config").config.discord_guild) {
        return guild;
      }
    }
  }
}

module.exports = SubsystemDiscord;
