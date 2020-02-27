const DiscordCommand = require('../DiscordCommand.js');

class DiscordCommandHelp extends DiscordCommand {

  constructor(subsystem) {
    super("help", "Displays a list of commands.", subsystem);
  }

  onRun(message, permissions, args) {
    var response = "Available Commands: \n";
    var config = this.subsystem.manager.getSubsystem("Config").config;

    for (var command of this.subsystem.commands) {
      response += "    `" + config.discord_command_character + command.name + "` - " + command.description + "\n";
    }

  message.channel.send(response);
  }

}

module.exports = DiscordCommandHelp;
