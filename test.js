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
    start: {type: 'time', keywords: ['Starting']},
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

require('./functions/primitive');
//console.log(templateParse(a));

let t = [' fefe', 'dff '];

t = t.map(det => det.trim());

console.log(t);