const fs = require('fs');
const PImage = require('pureimage');
const {TimeD} = require('./details/time');
const {map} = require('./util');
const {Color, interpolateHSL} = require('./color');

let data = [];
for(let i = 0; i < 10; i++) {
    let bar = [];
    let j = 0;
    while(j < 23) {
        bar.push({
            time: new TimeD(j, 30 * Math.floor(Math.random() * 2)),
            val: Math.random()
        });
        j += Math.floor(Math.random() * 8) + 1;
    }
    bar.push({
        time: new TimeD(23, 0),
        val: 0.5
    });
    data.push({
        bar,
        label: `1/${i + 1}/19`
    });
}

function makeGraph(data, startTime, endTime) {
    let img1 = PImage.make(1000, 750),
    ctx = img1.getContext('2d');
    
    let lowCol = new Color(255, 0, 0), 
        highCol = new Color(0, 255, 0),
        sV = startTime.val(), eV = endTime.val(),
        {height, width} = ctx.bitmap,
        xPad = 100, yPad = 50,
        xPer = (width - xPad) / data.length,
        border = 5;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    for(let i = 0; i < data.length; i++) {
        let slice = data[i];
        let lastY = yPad;
        for(let t = 0; t < slice.bar.length; t++) {
            let on = slice.bar[t];
            if(on.time.val() > eV) break;
            let y = height;
            if(t != slice.bar.length - 1) {
                let n = slice.bar[t + 1].time.val();
                if(n < sV) continue;
                y = map(n, sV, eV, yPad, height);
            }
            let col = interpolateHSL(lowCol, highCol, on.val);
            col.hsl2rgb().rgb2hex();
            ctx.fillStyle = col.vals;
            ctx.fillRect(i * xPer + xPad, lastY, xPer - border, y - lastY - border);
            lastY = y;
        }
    }

    PImage.encodePNGToStream(img1, fs.createWriteStream('out.png')).then(() => {
        console.log("wrote out the png file to out.png");
    }).catch((e) => {
        console.log("there was an error writing");
    });
}

makeGraph(data, new TimeD(0, 0), new TimeD(24, 0));
/*
for(let i = 0; i < data[0].bar.length; i++) {
    console.log(`${data[0].bar[i].time.val()}: ${data[0].bar[i].val}`);
}
*/