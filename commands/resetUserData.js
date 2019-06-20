const fs = require('fs');
exports.start = (global, message) => {
    message.channel.send('type !done to reset user data');
}

exports.run = (global, details) => {
    client.emit("guildCreate", details.message.guild);
    details.message.channel.send('Reset User Data!');
}