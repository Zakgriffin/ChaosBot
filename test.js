require('./functions/primitive');
const A = require('./functions/image');
const {TimeD} = require('./commands/details/time');
const seedrandom = require('seedrandom');	
var myrng = new seedrandom('a');

let format = [
    {
        bar: [
            {
                time: 'TimeD',
                val: '0 - 1'
            }
        ],
        label: 'string'
    },
    {

    }
];

/*
let strings = [
    '0U 1N 4Y 7U',
    '0U 2Y 5N 8U',
    '0U 2N 5Y 7U',
    '0U 2Y 3N 6Y 7U',
    '0U 1N 8U',
]
*/
//let thing = A.stringsToBar(strings);
//console.log(combined)
/*
let data = [];
for(let a of thing) {
    data.push({bar: a, label: 'Test'});
}
*/
//data.push({bar: combined, label: 'Combined'});

//A.makeGraphImage('thisThing.png', data, 0, 24);

let stuff = [];
let data = [];
for(let i = 0; i < 7; i++) {	
    let bar = [];	
    let j = 0;
    bar.push({
        time: new TimeD(0, 0),	
        val: parseInt(myrng() * 3) / 2
    })
    while(true) {
        j += Math.floor(myrng() * 8) + 1;
        if(j > 23) break
        bar.push({	
            time: new TimeD(j, 30 * Math.floor(myrng() * 2)),	
            val: parseInt(myrng() * 3) / 2
        });	
    }
    stuff.push(bar);
    data.push({	
        bar,	
        label: `Person ${i}`	
    });
}
let combined = A.getCombinedBar(stuff);
data.push({bar: combined, label: 'Blend'});
A.makeGraphImage(	
    'thisThing.png', data, 15, 20.5
); 