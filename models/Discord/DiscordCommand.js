class DiscordCommand {

  constructor(name, description, subsystem) {
    this.name = name;
    this.description = description;
    this.subsystem = subsystem;
  }

  onRun(user, args) {};
}

module.exports = DiscordCommand;
