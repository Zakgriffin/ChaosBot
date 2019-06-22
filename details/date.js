const util = require('../util');

class DateD {
    constructor(month, day, year) {
        this.month = month;
        this.day = day;
        this.year = year;
    }

    clone() {return new DateD(this.month, this.day, this.year);}
    isComplete() {return !isNaN(this.month) && !isNaN(this.day) && !isNaN(this.year);}
    standardForm() {return this.prettyForm();}

    slashFormat() {
        // 1/2/20
        return `${this.month}/${this.day}/${this.year}`;
    }
    prettyForm() {
        // January 2, 2020
        let d = this.day;
        let suffix = 'th';
        if(d % 10 == 1) suffix = 'st';
        if(d % 10 == 2) suffix = 'nd';
        if(d % 10 == 3) suffix = 'rd';
        if(d > 10 && d < 20) suffix = 'th';
        let mName = util.capitalize(months[this.month - 1].name);
        return `${mName} ${d}${suffix}, ${this.year}`;
    }

    daysInFuture(daysFuture) {
        // returns a new date "daysFuture" days in the future
        let n = this.clone();
        n.day += daysFuture;
    
        let mDays = this.daysInMonth();
        if(daysFuture > 0) {
            // future
            while(n.day > mDays) {
                n.day -= mDays;
                n.month++;
                if(n.month > 12) {
                    n.year++;
                    n.month = 1;
                }
                mDays = this.daysInMonth();
            }
        } else {
            // past
            while(n.day < 1) {
                n.day += mDays;
                n.month--;
                if(n.month < 1) {
                    n.year--;
                    n.month = 12;
                }
                mDays = this.daysInMonth();
            }
        }
        return n;
    }

    daysInMonth() {return daysInMonth(this.month);}
    isLeapYear() {return isLeapYear(this.year);}
}
exports.DateD = DateD;

exports.parse = (content) => {
    let month, day, year;

    let curDate = new Date();
    let cur = new DateD(
        curDate.getMonth() + 1,
        curDate.getDate(),
        curDate.getFullYear()
    );
    DateD.weekday = curDate.getDay();

    if(content.includes('today')) {
        return cur;
    }
    if(content.includes('tomorrow')) {
        return cur.daysInFuture(1);
    }

    let fromWeekday = getDateFromWeekday(content, cur);
    if(fromWeekday) {
        fromWeekday.standardForm = standardForm;
        return fromWeekday;
    }

    if(content.includes('/')) {
        let arr = content.split('/');
        month = parseInt(arr[0]);
        day = parseInt(arr[1]);
        if(arr.length == 3) {
            year = parseInt(arr[2]);
        }
    } else {
        let arr = content.split(' ');
        if(arr.length < 2) return undefined;
        for(let [index, m] of months.entries()) {
            if(arr[0].substring(0, 3) == m.name.substring(0, 3)) {
                month = index + 1;
                break;
            }
        }
        //if(!month) throw `could not understand month name`;

        day = parseInt(arr[1]);
        year = parseInt(arr[2]);
    }

    if(!month) month = cur.month;
    if(!year) year = cur.year;

    if(year < 100) year += (Math.trunc(cur.year / 100) * 100);
    if(month > 12) throw 'the month can only go up to 12';
    let m = months[month - 1];
    if(day > daysInMonth(month, year)) throw `${global.util.capitalize(m.name)} only has ${daysInMonth(month, year)} days in it`;
    
    /*
    if(year < cur.year) throw `you can't use a date from a previous year`;
    if(month < cur.month) throw `you can't use a date from a previous month`;
    if(day < cur.day) {
        if(month <= cur.month) throw `you can't use a date from a previous day`;
    }
    */

    return new DateD(month, day, year);
}

const months = [
    {name: 'january',   days: 31},
    {name: 'february',  days: 28}, //unless leap year :(
    {name: 'march',     days: 31},
    {name: 'april',     days: 30},
    {name: 'may',       days: 31},
    {name: 'june',      days: 30},
    {name: 'july',      days: 31},
    {name: 'august',    days: 31},
    {name: 'september', days: 30},
    {name: 'october',   days: 31},
    {name: 'november',  days: 30},
    {name: 'december',  days: 31}
]

const weekdays = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
]

function getDateFromWeekday(weekday, cur) {
    // returns the date of the the upcoming "weekday"
    for(let [index, w] of weekdays.entries()) {
        if(weekday.includes(w.substring(0, 3))) {
            if(index < cur.weekday) index += 7;
            return cur.daysInFuture(index - cur.weekday);
        }
    }
}

function daysInMonth(month, year) {
    // returns the number of days in "month". leap years known from "year"
    if(month == 2 && isLeapYear(year)) return 29;
    return months[month - 1].days;
}

function isLeapYear(year) {
    return year % 100 == 0 ? year % 400 == 0 : year % 4 == 0;
}