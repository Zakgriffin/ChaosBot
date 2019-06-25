class TimeD {
    constructor(hour, mins, status) {
        this.hour = hour;
        this.mins = mins;
        if(status) this.status = status;
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

    toString(status) {
        if(!status) status = this.status;
        if(this.mins == 0) return `${this.hour}${status}`;
        return `${this.hour}:${this.mins}${status}`;
    }

    dif(time2) {
        let h = this.hour, m = this.mins;
        if(this.mins < time2.mins) {
            h--;
            m += 60;
        }
        return new TimeD(h - time2.hour, m - time2.mins);
    }

    val() {
        return this.hour + this.mins / 60;
    }
}
exports.TimeD = TimeD;

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

String.prototype.toTime = function() {
    // converts time in string form like "3:45U"
    let status = this.charAt(this.length - 1);
    let arr = this.split(':');
    let hour, mins = 0;
    if(arr.length == 2) mins = parseInt(arr[1]);
    hour = parseInt(arr[0]);
    return new TimeD(hour, mins, status);
}

Number.prototype.toHour = function() {
    let hour = this % 12;
    let m = this == hour ? 'am' : 'pm';
    if(this % 24 == 0) m = 'am';
    if(hour == 0) hour = 12;
    return `${hour} ${m}`;
}

String.prototype.statToVal = function() {
    if(this == 'Y') return 1;
    if(this == 'N') return 0;
    if(this == 'U') return 0.5;
    throw 'status could not be converted to value';
}