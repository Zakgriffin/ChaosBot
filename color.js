/*
Much of this code was stolen from () but has been modified to fit my needs
*/
const {map} = require('./util');

class Color {
    constructor(a, b, c, type) {
        this.type = type ? type : 'rgb';
        this.vals = [a, b, c];
    }

    property(p) {
        let t = this.type;
        if((t == 'rgb' && p == 'red') || (t == 'hsl' && p == 'hue')) return this.vals[0];
        if((t == 'rgb' && p == 'green') || (t == 'hsl' && p == 'saturation')) return this.vals[1];
        if((t == 'rgb' && p == 'blue') || (t == 'hsl' && p == 'lightness')) return this.vals[2];

        throw `no such property ${p}, type is ${this.type}`;
    }

    clone() {
        let newCol = new Color();
        newCol.val = this.vals;
        newCol.type = this.type;
        return newCol;
    }

    rgb2hsl() {
        if(this.type != 'rgb') throw `could not convert, type is ${this.type}`;
        this.type = 'hsl';

        let r = this.vals[0] / 255;
        let g = this.vals[1] / 255;
        let b = this.vals[2] / 255;

        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if(max == min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = (l > 0.5 ? d / (2 - max - min) : d / (max + min));
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        this.vals = [h, s, l];
        return this;
    }

    hsl2rgb() {
        if(this.type != 'hsl') throw `could not convert, type is ${this.type}`;
        this.type = 'rgb';

        let l = this.vals[2];

        if(this.vals[1] == 0) {
            l = Math.round(l * 255);
            this.vals =[l, l, l];
            return this;
        } else {
            function hue2rgb(p, q, t) {
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1 / 6) return p + (q - p) * 6 * t;
                if(t < 1 / 2) return q;
                if(t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            let s = this.vals[1];
            let q = (l < 0.5 ? l * (1 + s) : l + s - l * s);
            let p = 2 * l - q;
            let r = hue2rgb(p, q, this.vals[0] + 1 / 3);
            let g = hue2rgb(p, q, this.vals[0]);
            let b = hue2rgb(p, q, this.vals[0] - 1 / 3);

            this.vals = [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }
        return this;
    }

    rgb2hex() {
        if(this.type != 'rgb') throw `could not convert, type is ${this.type}`;
        this.type = 'hex';
        this.vals = "#" + ((1 << 24) + (this.vals[0] << 16) + (this.vals[1] << 8) + this.vals[2]).toString(16).slice(1);
        return this;
    }
}
exports.Color = Color;

// static
exports.interpolateHSL = function(color1, color2, factor) {
    if(color1.type == 'rgb') color1.rgb2hsl();
    if(color2.type == 'rgb') color2.rgb2hsl();
    if(arguments.length < 3) factor = 0.5;
    let blend = new Color(0, 0, 0, 'hsl');
    for(let i = 0; i < 3; i++) {
        blend.vals[i] = map(factor, 0, 1, color1.vals[i], color2.vals[i]);
    }
    return blend;
}