exports.start = convo => {
    convo.send('Entered test command');
}

exports.run = async convo => {
    convo.send('WORKS');
}

exports.detailTemplate = {
    start: {type: 'time', keywords: ['starting']},
    end: {type: 'time', keywords: ['ending']},
    date: {type: 'date', keywords: ['on']},
    range: {
        type: 'timeRange',
        references: ['start','end']
    },
    formats: {
        needed: ['start', 'end'],
        optional: ['date']
    }
}
