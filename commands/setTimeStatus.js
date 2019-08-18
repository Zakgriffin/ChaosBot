const Database = require('../services/databaseHandler');

exports.start = convo => {
    convo.send('How would you like to change your availabilty?');
}

exports.run = convo => {
    const details = convo.givenDetails;
    const user = convo.user;
    const date = details.date.slashForm();
    const {status, startTime, endTime}

    let userObj = Database.getUser(user);
    if(!userObj.dates) userObj.dates = {};
    let oldStatus = userObj.dates[date] || '0U';

    let newStatus = insertTimeStatus(oldStatus, status.val, startTime, endTime);

    Database.saveUser(user, userObj);
    
    let bar = newStatus.split(' ');
    for(let i = 0; i < bar.length; i++) {
        let time = bar[i].toTime();
        bar[i] = {time, val: time.status.statToVal()};
    }
    let data = [{bar, label: date}];
    makeGraphImage(`${user}_tempImg.png`, data, 0, 24).then(() => {
        channel.send("Your status has been updated!", {files: [`${user}_tempImg.png`]});
    });
}

exports.neededDetails = {
    start: 'time',
    end: 'time',
    date: '',
    status: '',
    formats: {
        needed: ['start', 'end', 'date', 'status']
    }
}


function insertTimeStatus(str, status, startTime, endTime) {
    let arr = str.split(' ');
    
    let s = 0, e = arr.length - 1;
    for(;s < arr.length - 1; s++) {
       if(val(arr[s]) >= val(startTime)) break;
    }
    for(;e > 0; e--) {
       if(val(arr[e]) <= val(endTime)) break;
    }
    
    let flag, optStatus;
    if(s === 0 || stringToObj(arr[s - 1]).status != status) flag = true;
    if(stringToObj(arr[e]).status != status) optStatus = stringToObj(arr[e]).status;
    
    if(s <= e) arr.splice(s, e - s + 1);
    
    if(flag) arr.splice(s, 0, objToStr(startTime, status));
    if(optStatus)arr.splice(s + 1, 0, objToStr(endTime, optStatus));
    
    return arr.join(' ');
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
    return {hour, mins, status};
}

function val(time) {
    if(typeof time == 'string')
        return val(stringToObj(time));
    return time.hour * 100 + time.mins;
}
