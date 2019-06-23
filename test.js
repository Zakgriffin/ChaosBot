const PImage = require('pureimage');

let data;

for(let i = 0; i < 20; i++) {
    let bar = [];
    let slice = {
        bar,
        label: ''
    };
}



/*
function makeGraph(data, xLabels, yLabels, xPad, yPad, colorFrom, colorTo) {
    let img1 = PImage.make(1000, 750);
    let ctx = img1.getContext('2d');
    let xCount = data[0].length;
    let yCount = data.length;
    let xOff = (ctx.bitmap.width - xPad) / xCount;
    let yOff = (ctx.bitmap.height - yPad) / yCount;
    let border = 3;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.bitmap.width, ctx.bitmap.height);

    var fnt = PImage.registerFont('fonts/SourceSansPro-Regular.ttf', 'Source Sans Pro');
    fnt.load(() => {
        // 1.52666667
        ctx.font = "25px Arial";
        for (let r = 0; r < yCount; r++) {
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`${r}`, xPad / 2 - (r.toString().length * 8), r * yOff + yPad + yOff / 2 - 3);
            for (let c = 0; c < xCount; c++) {
                if (c == 0) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(`${c}`, c * xOff + xPad + xOff / 2 - 3, yPad / 2);
                }
                //`rgb(${data[r][c] * 100},0,0)`
                let col = _interpolateHSL(colorFrom, colorTo, data[r][c]);
                let hcol = r2h(col);
                ctx.fillStyle = r2h(darken(col, 0.1));
                ctx.fillRect(xOff * c + xPad, yOff * r + yPad, xOff, yOff);
                ctx.fillStyle = hcol;
                ctx.fillRect(xOff * c + xPad + border, yOff * r + yPad + border, xOff - border * 2, yOff - border * 2);
            }
        }

        PImage.encodePNGToStream(img1, fs.createWriteStream('out.png')).then(() => {
            console.log("wrote out the png file to out.png");
        }).catch((e) => {
            console.log("there was an error writing");
        });
    });
}
let arr = [
    [1, 0.5, 0, 0],
    [0, 1, 0.5, 0],
    [0, 0, 1, 0.5],
    [0.5, 0, 0, 1],
]
let arr2 = [];
for (let i = 0; i < 24; i++) {
    let a = [];
    for (let j = 0; j < 30; j++) {
        a.push(Math.random());
    }
    arr2.push(a)
}
let cFrom = [255, 0, 0]
let cTo = [0, 255, 0]

makeGraph(arr2, ['a', 'b', 'c', 'd'], ['1', '2', '3', '4'], 50, 50, cFrom, cTo);
*/