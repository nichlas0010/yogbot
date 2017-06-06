const DiscordCommand = require('../DiscordCommand.js');

class DiscordCommandSubscribe extends DiscordCommand {

    constructor(subsystem) {
        super("subscribe", "subscribe to the roundstart announcements", undefined, subsystem);
    }

    onRun(message, permissions, args) {
        var config = this.subsystem.manager.getSubsystem("Config").config;
        if (permissions.includes('unsubscribe')) {
            var response = "You are already subscribed"
        }
        else {
            message.author.addRole(config.discord_subscriber_role);
            var response = "You are now a subscriber"
        }

        message.reply(response);
    }

}

module.exports = DiscordCommandSubscribe;