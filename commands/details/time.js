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
    /*
    val() {
        return this.hour + this.mins / 60;
    }
    */
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


/*
console.log(updateTimeSlot(
'0U 10Y',
'Y',
{hour: 1, mins: 0},
{hour: 4, mins: 0}
));
*/  

/*
let start = '2Y 7U';

let tests = [
['N', 1, 4, '1N 4Y 7U'],
['N', 5, 8, '2Y 5N 8U'],
['N', 4, 7, '2Y 4N 7U'],
['N', 2, 5, '2N 5Y 7U'],
['N', 3, 6, '2Y 3N 6Y 7U'],
['N', 1, 8, '1N 8U'],
['N', 2, 7, '2N 7U'],

['Y', 1, 4, '1Y 7U'],
['Y', 5, 8, '2Y 8U'],
['Y', 4, 7, '2Y 7U'],
['Y', 2, 5, '2Y 7U'],
['Y', 3, 6, '2Y 7U'],
['Y', 1, 8, '1Y 8U'],
['Y', 2, 7, '2Y 7U']
];

for(let i = 0; i < tests.length; i++) {
let k = tests[i];
let t = updateTimeSlot(
    start,
    k[0],
    {hour: k[1], mins: 0},
    {hour: k[2], mins: 0}
);
if(t != tests[i][3]) {
    console.log(
    `${t} | ${k[3]} | ${k[1]} - ${k[2]} | ${k[0]}`
    );
}
}
*/
function updateTimeSlot(str, status, startTime, endTime) {
let arr = str.split(' ');

let s = 0, e = arr.length - 1;
for(;s < arr.length - 1; s++) {
    if(val(arr[s]) >= val(startTime)) break;
}
for(;e > 0; e--) {
    if(val(arr[e]) <= val(endTime)) break;
}

let flag, optStatus;
if(s === 0 || toObj(arr[s - 1]).status != status) flag = true;
if(toObj(arr[e]).status != status) optStatus = toObj(arr[e]).status;

if(s <= e) arr.splice(s, e - s + 1);

if(flag) arr.splice(s, 0, toStr(startTime, status));
if(optStatus)arr.splice(s + 1, 0, toStr(endTime, optStatus));

return arr.join(' ');
}

function toStr(time, status) {
if(time.mins === 0) return `${time.hour}${status}`;
return `${time.hour}:${time.mins}${status}`;
}

function toObj(string) {
let status = string.charAt(string.length - 1);
let arr = string.split(':');
let hour, mins = 0;
if(arr.length == 2) mins = parseInt(arr[1]);
hour = parseInt(arr[0]);
return {hour, mins, status};
}

function val(time) {
if(typeof time == 'string')
    return val(toObj(time));
return time.hour * 100 + time.mins;
}