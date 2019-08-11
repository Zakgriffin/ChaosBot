exports.msgBits = function(message) {
    return {
        guild: message.guild.id,
        channel: message.channel,
        user: message.author.id,
        content: message.content
    };
}