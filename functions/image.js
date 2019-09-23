const fs = require('fs');
const PImage = require('pureimage');
const {map} = require('./primitive');
const Color = require('../classes/Color');
const {TimeD} = require('../commands/details/time');
const stats = {
    Y: 1,
    U: 0.5,
    N: 0
}

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

exports.getCombinedBar = function(userBars) {
    // given an array of user bars, return combined bar
    // userBars: array of bar notations for each user
    let res = JSON.parse(JSON.stringify(userBars[0]));
    for(let userBar of userBars) {
        if(userBar == userBars[0])continue;
        let resIndex = -1;
        let userIndex = -1;
        let resTime, userTime;
        while(res[resIndex + 1] || userBar[userIndex + 1]) {
            let r2 = res[resIndex + 1] ? val(res[resIndex + 1].time) : Infinity;
            let u2 = userBar[userIndex + 1] ? val(userBar[userIndex + 1].time) : Infinity;
            if(r2 <= u2) {
                resIndex++;
                resTime = r2;
            }
            if(r2 >= u2) {
                userIndex++;
                userTime = u2;
            }
            if(resTime < userTime) {
                let a = res[resIndex].val;
                //console.log(a)
                resIndex++;
                res.splice(resIndex, 0, {
                    time: userBar[userIndex].time,
                    val: userBar[userIndex].val + a - userBar[userIndex - 1].val
                });
            } else {
                res[resIndex].val += userBar[userIndex].val;
            }
        }
    }
    let totalUsers = userBars.length;
    for(let elem of res) {
        elem.val /= totalUsers;
    }
    return res;
}

exports.stringsToBar = function(userStrings) {
    // given array of strings, return a bar
    let res = [];
    for(let fullString of userStrings) {
        let userBar = [];
        let arr = fullString.split(' ');
        for(let str of arr) {
            userBar.push(stringToSection(str));
        }
        res.push(userBar);
    }
    return res;
}

function stringToSection(str) {
    // given a string, return a section
    let obj = stringToObj(str);
    let res = {
        time: obj,
        val: stats[obj.status]
    };
    return res;
}

function objToStr(time, status) {
    if(time.mins === 0) return `${time.hour}${status}`;
    return `${time.hour}:${time.mins}${status}`;
}

function stringToObj(string) {
    let status = string.charAt(string.length - 1);
    let arr = string.split(':');
    let hour, mins = 0;
    if(arr.length == 2) mins = parseInt(arr[1]);
    hour = parseInt(arr[0]);
    return new TimeD(hour, mins, status);
}

function val(time) {
    if(typeof time == 'string')
        return val(stringToObj(time));
    return time.hour + (time.mins / 60);
}


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
    sV = typeof startTime == 'number' ? startTime : val(startTime);
    eV = typeof endTime == 'number' ? endTime : val(endTime);
    //ctx.fillStyle = 'black';
    //ctx.fillRect(0, 0, width, h);
    var fnt = PImage.registerFont('fonts/SourceSansPro-Regular.ttf', 'Source Sans Pro');
    await new Promise(resolve => fnt.load(resolve));

    ctx.font = '25px';
    for(let i = 0; i < data.length; i++) {
        let slice = data[i];
        if(val(slice.bar[0].time) !== 0) slice.bar.unshift({time: new TimeD(0, 0), val: 0.5});
        let lastY = yPad;
        for(let t = 0; t < slice.bar.length; t++) {
            let on = slice.bar[t];
            if(val(on.time) >= eV) break;
            let y = h;
            if(t != slice.bar.length - 1) {
                let n = val(slice.bar[t + 1].time);
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