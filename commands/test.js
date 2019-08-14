exports.onCall = convo => {
    // 
    message.channel.send('Entered test command');
}

exports.run = (message, details) => {
    message.channel.send('WORKS');
}

exports.detailTemplate = {
    needed: {
        date: {},
        timeRange: {
            startTime: 'Starting',
            endTime: 'Ending'
        }
    },
    optional: {
        string: {
            name: 'title',
            keywords: ['called', 'named']
        }
    }
}