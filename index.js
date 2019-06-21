// Util
const { promisify } = require('util');

// Discord
const Discord = require("discord.js");
const Enmap = require("enmap");
const fs = require("fs");


//TESTING

const PImage = require('pureimage');

var rgb2hsl = function(color) {
  var r = color[0]/255;
  var g = color[1]/255;
  var b = color[2]/255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = (l > 0.5 ? d / (2 - max - min) : d / (max + min));
    switch(max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h, s, l];
};

var hsl2rgb = function(color) {
  var l = color[2];

  if (color[1] == 0) {
    l = Math.round(l*255);
    return [l, l, l];
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var s = color[1];
    var q = (l < 0.5 ? l * (1 + s) : l + s - l * s);
    var p = 2 * l - q;
    var r = hue2rgb(p, q, color[0] + 1/3);
    var g = hue2rgb(p, q, color[0]);
    var b = hue2rgb(p, q, color[0] - 1/3);
    return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
  }
};

var _interpolateHSL = function(color1, color2, factor) {
  if (arguments.length < 3) { factor = 0.5; }
  var hsl1 = rgb2hsl(color1);
  var hsl2 = rgb2hsl(color2);
  for (var i=0;i<3;i++) {
    hsl1[i] += factor*(hsl2[i]-hsl1[i]);
  }
  return hsl2rgb(hsl1);
};

var r2h = function(rgb) {
  return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
};

function darken(color, amt) {
  color = rgb2hsl(color)
  color[2] -= amt;
  return hsl2rgb(color);
}

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

  var fnt = PImage.registerFont('fonts/SourceSansPro-Regular.ttf','Source Sans Pro');
  fnt.load(() => {
      // 1.52666667
      ctx.font = "25px Arial";
      for(let r = 0; r < yCount; r++) {
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${r}`, xPad / 2 - (r.toString().length * 8), r * yOff + yPad + yOff / 2 - 3);
        for(let c = 0; c < xCount; c++) {
          if(c == 0) {
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`${c}`, c * xOff + xPad/* + xOff / 2 - 3*/, yPad / 2);
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
      }).catch((e)=>{
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
for(let i = 0; i < 24; i++) {
  let a = [];
  for(let j = 0; j < 30; j++) {
    a.push(Math.random());
  }
  arr2.push(a)
}
let cFrom = [255, 0, 0]
let cTo = [0, 255, 0]

makeGraph(arr2, ['a', 'b', 'c', 'd'], ['1', '2', '3', '4'], 50, 50, cFrom, cTo);

//TESTING


const client = new Discord.Client();
const config = require("./config.json");

global.Discord = Discord;
global.client = client;
global.config = config;
global.contextData = {};
fs.readFile('./saved_data/user_data.json', (err, data) => {
  if(err) throw err;
  global.userData = JSON.parse(data);
});
global.util = require('./util.js');
global.saveUserData = function() {
  let data = JSON.stringify(userData, null, 2);
  fs.writeFile('./saved_data/user_data.json', data, (err) => {
      if(err) throw err;
  });
}

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, global));
  });
});

global.commands = new Enmap();
fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0].toLowerCase();
    //console.log(`Attempting to load command ${commandName}`);
    global.commands.set(commandName, props);
  });
});

global.details = new Enmap();
fs.readdir("./details/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./details/${file}`);
    let detailName = file.split(".")[0].toLowerCase();
    global.details.set(detailName, props);
  });
});

client.login(config.token);