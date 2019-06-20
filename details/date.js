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

exports.parse = (content) => {
    /*
    6/17/19 standard
    June 17 2019
    */
    let month, day, year;

    let date = new Date();
    let cur = {
        month: date.getMonth() + 1,
        day: date.getDate(),
        year: date.getFullYear(),
        weekday: date.getDay()
    }

    if(content.includes('today')) {
        cur.standardForm = standardForm;
        return cur;
    }
    if(content.includes('tomorrow')) {
        let tomorrow = getDateInFuture(cur, 1);
        tomorrow.standardForm = standardForm;
        return tomorrow;
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
        if(arr.length < 2) return {undefined};
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

    //console.log({month, day, year});
    return {
        day,
        month,
        year,

        standardForm
    };
}

var standardForm = function() {
    let d = this.day;
    let suffix = 'th';
    if(d % 10 == 1) suffix = 'st';
    if(d % 10 == 2) suffix = 'nd';
    if(d % 10 == 3) suffix = 'rd';
    if(d > 10 && d < 20) suffix = 'th';
    let mName = global.util.capitalize(months[this.month - 1].name);
    return `${mName} ${d}${suffix}, ${this.year}`;
}

function getDateFromWeekday(weekday, cur) {
    for(let [index, w] of weekdays.entries()) {
        if(weekday.includes(w.substring(0, 3))) {
            if(index < cur.weekday) index += 7;
            return getDateInFuture(cur, index - cur.weekday);
        }
    }
}

function getDateInFuture(date, daysFuture) {
    let {month, day, year} = date;
    day += daysFuture;

    let mDays = daysInMonth(month, year);
    if(daysFuture > 0) {
        // future
        while(day > mDays) {
            day -= mDays;
            month++;
            if(month > 12) {
                year++;
                month = 1;
            }
            mDays = daysInMonth(month, year);
        }
    } else {
        // past
        while(day < 1) {
            day += mDays;
            month--;
            if(month < 1) {
                year--;
                month = 12;
            }
            mDays = daysInMonth(month, year);
        }
    }
    return {month, day, year}
}

function daysInMonth(month, year) {
    if(month == 2 && isLeapYear(year)) return 29;
    return months[month - 1].days;
}

function isLeapYear(year) {
    return year % 100 == 0 ? year % 400 == 0 : year % 4 == 0;
}