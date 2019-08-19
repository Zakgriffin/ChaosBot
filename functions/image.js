const fs = require('fs');
const PImage = require('pureimage');
const {map} = require('./primitive');
const Color = require('../classes/Color');
const {TimeD} = require('../commands/details/time');

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
]

exports.makeGraphImage = async function(path, data, startTime, endTime) {
    let xPad = 85, yPad = 50;
    let goal = 1000;
    let vis = (goal - xPad) / 4;
    let size;
    if(data.length < 4) size = vis * data.length + xPad;
    else size = goal;
    let img = PImage.make(size, 750),
    ctx = img.getContext('2d');

    let lowCol = new Color(255, 0, 0), 
        highCol = new Color(0, 255, 0),
        sV, eV,
        {height, width} = ctx.bitmap,
        h = height - 15;
        xPer = (width - xPad) / data.length,
        borderX = 2,
        borderY = 0;
    sV = typeof startTime == 'number' ? startTime : startTime.val();
    eV = typeof endTime == 'number' ? endTime : endTime.val();
    //ctx.fillStyle = 'black';
    //ctx.fillRect(0, 0, width, h);
    var fnt = PImage.registerFont('fonts/SourceSansPro-Regular.ttf', 'Source Sans Pro');
    await new Promise(resolve => fnt.load(resolve));

    ctx.font = '25px';
    for(let i = 0; i < data.length; i++) {
        let slice = data[i];
        if(slice.bar[0].time.val() !== 0) slice.bar.unshift({time: new TimeD(0, 0), val: 0.5});
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
            let col = Color.interpolateHSL(lowCol, highCol, on.val);
            col.hsl2rgb().rgb2hex();
            ctx.fillStyle = col.vals;
            ctx.fillRect(i * xPer + xPad + borderX, lastY + borderY,
                xPer - 2 * borderX, y - lastY - 2 * borderY);
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

    let min = Math.ceil(sV);
    let max = Math.floor(eV);
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

    await PImage.encodePNGToStream(img, fs.createWriteStream(path));
}