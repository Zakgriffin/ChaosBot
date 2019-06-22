exports.start = (message) => {
    message.channel.send('type "!done" to reset user data');
}

exports.run = (message, details) => {
    client.emit("guildCreate", details.message.guild);
    details.message.channel.send('Reset User Data!');
}