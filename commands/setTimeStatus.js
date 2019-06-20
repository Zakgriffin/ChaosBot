const fs = require('fs');

exports.start = (global, message) => {
    message.channel.send('Entered setTimeStatus command');
}

exports.run = (global, details) => {
    const message = details.message;
    const user = message.author.id;
    const channel = message.channel;
    const date = dateForm(details.date);

    let userData = global.userData[user];
    let oldStatus = userData[date];

    if(!oldStatus) oldStatus = '0U';
    let newStatus = insertTimeStatus(oldStatus, details.status.val, details.startTime, details.endTime);
    
    global.userData[user][date] = newStatus;
    global.saveUserData();
}

exports.neededDetails = {
    startTime: 'time',
    endTime: 'time',
    date: 'date',
    status: 'status'
}
exports.optionalDetails = {
    
}

function insertTimeStatus(str, status, startTime, endTime) {
    let sVal = val(startTime);
    let eVal = val(endTime);
    let arr = str.split(' ');
    let flag = false;

    for(let i = arr.length - 1; i >= 0; i--) {
        let b = val(bitToTime(arr[i]));
        let s = bitToTime(arr[i]).status;
        if(!flag && b < eVal) {
            if(b < sVal) {
                // edge case no overlap
                arr.splice(i, 0, arr[i]);
                i++;
            }
            if(status == s) arr.splice(i, 1);
            else arr[i] = toBit(endTime, bitToTime(arr[i]).status); // pull down
            flag = true;
            continue;
        }
        if(flag && b < sVal) {
            if(status != s) arr.splice(i + 1, 0, toBit(startTime, status));
            break;
        }
        if(flag) arr.splice(i, 1);
    }
    return arr.join(' ');
}

function toBit(time, status) {
    if(time.mins == 0) return `${time.hour}${status}`;
    return `${time.hour}:${time.mins}${status}`;
}
  
function bitToTime(bit) {
    let status = bit.charAt(bit.length - 1);
    let arr = bit.split(':');
    let hour, mins = 0;
    if(arr.length == 2) mins = parseInt(arr[1]);
    hour = parseInt(arr[0]);
    return {hour, mins, status};
}
  
function val(time) {
    return time.hour * 100 + time.mins;
}

function dateForm(date) {
    return `${date.month}/${date.day}/${date.year}`;
}