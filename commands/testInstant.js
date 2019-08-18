exports.onCall = convo => {
    message.channel.send('Entered testInstant command');
}

exports.run = async convo => {
    convo.send('WORKS');
}

exports.instant = true;