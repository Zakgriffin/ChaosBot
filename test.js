const fs = require('fs');
const PImage = require('pureimage');
const {TimeD} = require('./details/time');
const {map} = require('./util');
const {Color, interpolateHSL} = require('./color');
const seedrandom = require('seedrandom');
var myrng = new seedrandom('f');

let data = [];
for(let i = 0; i < 7; i++) {
    let bar = [];
    let j = 0;
    while(j < 24) {
        bar.push({
            time: new TimeD(j, 30 * Math.floor(myrng() * 2)),
            val: myrng()
        });
        j += Math.floor(myrng() * 8) + 1;
    }
    data.push({
        bar,
        label: `1/${i + 1}/19`
    });
}

makeGraph(
    data,
    new TimeD(0, 00),
    new TimeD(24, 00)
);