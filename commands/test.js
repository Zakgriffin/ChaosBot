exports.start = (message) => {
    message.channel.send('Entered test command');
}

exports.run = (message, details) => {
    message.channel.send('WORKS');
}

exports.neededDetails = {
    startTime: 'time'
}
exports.optionalDetails = {
    endTime: 'time'
}