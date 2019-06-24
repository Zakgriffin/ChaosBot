const fs = require('fs');
const PImage = require('pureimage');
const {TimeD} = require('./details/time');
const {map} = require('./util');
const {Color, interpolateHSL} = require('./color');

let data = [];
for(let i = 0; i < 10; i++) {
    let bar = [];
    let j = 0;
    while(j < 24) {
        bar.push({
            time: new TimeD(j, 30 * Math.floor(Math.random() * 2)),
            val: Math.random()
        });
        j += Math.floor(Math.random() * 8) + 1;
    }
    data.push({
        bar,
        label: `1/${i + 1}/19`
    });
}

function makeGraph(data, startTime, endTime) {
    let img1 = PImage.make(1000, 750),
    ctx = img1.getContext('2d');
    
    let lowCol = new Color(200, 0, 0), 
        highCol = new Color(0, 200, 0),
        sV = startTime.val(), eV = endTime.val(),
        {height, width} = ctx.bitmap,
        h = height - 15;
        xPad = 85, yPad = 50,
        xPer = (width - xPad) / data.length,
        border = 3;
    //ctx.fillStyle = 'black';
    //ctx.fillRect(0, 0, width, h);
    var fnt = PImage.registerFont('fonts/SourceSansPro-Regular.ttf', 'Source Sans Pro');
    fnt.load(() => {
        ctx.font = '25px Arial';
        for(let i = 0; i < data.length; i++) {
            let slice = data[i];
            let lastY = yPad;
            for(let t = 0; t < slice.bar.length; t++) {
                let on = slice.bar[t];
                if(on.time.val() >= eV) break;
                let y = h;
                if(t != slice.bar.length - 1) {
                    let n = slice.bar[t + 1].time.val();
                    if(n < sV) continue;
                    y = map(n, sV, eV, yPad, h);
                    if(y > h) y = h;
                }
                let col = interpolateHSL(lowCol, highCol, on.val);
                col.hsl2rgb().rgb2hex();
                ctx.fillStyle = col.vals;
                ctx.fillRect(i * xPer + xPad + border, lastY + border,
                    xPer - 2 * border, y - lastY - 2 * border);
                lastY = y;
            }
            ctx.fillStyle = '#ffffff';
            let x = i * xPer + xPad + (xPer / 2);
            let xOffset = -35, yOffset = 35;
            //if(text.length == 5) xOffset -= 12;
            ctx.fillText(slice.label, x + xOffset, yOffset);

        }
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';

        let min = Math.ceil(startTime.val());
        let max = Math.floor(endTime.val());
        for(let i = min; i <= max; i++) {
            let y = map(i, sV, eV, yPad, h);
            let text = i.toHour();
            let xOffset = 12, yOffset = 7;
            if(text.length == 5) xOffset -= 12;
            ctx.fillText(text + ' -', xOffset, y + yOffset);

            ctx.beginPath();
            ctx.moveTo(xPad, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        PImage.encodePNGToStream(img1, fs.createWriteStream('out.png')).then(() => {
            console.log("wrote out the png file to out.png");
        }).catch((e) => {
            console.log("there was an error writing");
        });
    });
}

makeGraph(data, new TimeD(10, 0), new TimeD(15, 0));