exports.TimeD = class {
    constructor(hour, mins) {
        this.hour = hour;
        this.mins = mins;
    }

    clone() {return new TextD(this.hour, this.mins);}
    isComplete() {return !isNaN(this.hour) && !isNaN(this.mins)}
    standardForm() {
        let mins = this.mins.toString();
        let hour = this.hour % 12;
        let m = this.hour == hour ? 'am' : 'pm';
        if(hour == 0) hour = 12;
        if(mins.length == 1) mins = '0' + mins;
        return `${hour}:${mins}${m}`;
    }
}

exports.parse = (content) => {
    let m;
    if(content.includes('am')) {
        m = 'am';
    } else if(content.includes('pm')) {
        m = 'pm';
    }
    content.replace('am', '');
    content.replace('pm', '');
    content.trim();
    let mins;
    let hour;
    if(content.includes(':')) {
        let arr = content.split(':');
        if(!arr[0]) throw `I need an hour`;
        if(!arr[1]) throw `I need minutes`;
        hour = parseInt(arr[0]);
        mins = parseInt(arr[1]);
    } else {
        hour = parseInt(content);
        mins = 0;
    }
    if(isNaN(hour) || isNaN(mins)) return; // generic could not understand error

    if(hour > 12 || hour == 0) {
        // make sure valid military time
        if(m) throw `you can't use both military time and ${m}`;
    } else if(!m) {
        throw `I need either "am" or "pm"`;
    } else if(m == 'pm' && hour != 12) {
        hour += 12;
    } else if(m == 'am' && hour == 12) {
        hour -= 12;
    }
    if(hour >= 24) throw `the hour must be under 24`;
    if(mins >= 60) throw `minutes must be under 60`;
    if(mins < 0 || hour < 0) throw `the hour and minutes must be positive`;

    return new TimeD(hour, mins);
}