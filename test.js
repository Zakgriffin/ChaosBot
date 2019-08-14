const {filesToObject} = require('./functions/fileSystem');
//const details = filesToObject('./commands/details');

let b = {
    // start time, end time, date, status, timeRange
    data: {
        start: {
            type: 'time',
            //keywords: ['starting']
        },
        end: {
            type: 'time',
            //keywords: ['ending']
        },
        date: {
            type: 'date',
            //keywords: ['on']
        },
        range: {
            type: 'timeRange',
            /*
            options: {
    
            },
            */
            references: ['start','end']
        },
        starting: {alias: 'start'},
        ending: {alias: 'end'},
        on: {alias: 'date'}
    },
    formats: {
        main: {
            needed: ['', '', ''],
            optional: ['', '']
        }
    }
}

let a = {
    Start: {type: 'time', keywords: ['Starting']},
    End: {type: 'time', keywords: ['ending']},
    Date: {type: 'date', keywords: ['on']},
    Range: {
        type: 'timeRange',
        references: ['start','end']
    },
    formats: {
        needed: ['', '', ''],
        optional: []
    }
}

console.log('- ' + ['a', 'b', 'c'].join('\n- '));
//console.log(camelToSpace('HeyHowAreYou'));
const {DateD} = require('./commands/details/date');
let h = new DateD();
console.log(h instanceof Object);