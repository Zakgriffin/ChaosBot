const g = require('../index');
const util = require('../util');

exports.start = (message) => {
    message.channel.send('Entered setTimeStatus command');
}

exports.run = (message, details) => {
    const user = message.author.id;
    const channel = message.channel;
    const date = details.date.slashForm();

    let userData = g.userData[user];
    let oldStatus = userData[date];

    if(!oldStatus) oldStatus = '0U';
    let newStatus = insertTimeStatus(oldStatus, details.status.val, details.startTime, details.endTime);
    
    g.userData[user][date] = newStatus;
    util.saveUserData();
}

exports.neededDetails = {
    startTime: 'time',
    endTime: 'time',
    date: 'date',
    status: 'status'
}


function insertTimeStatus(str, status, startTime, endTime) {
    let sVal = startTime.val();
    let eVal = endTime.val();
    let arr = str.split(' ');
    let flag = false;

    for(let i = arr.length - 1; i >= 0; i--) {
        let cur = arr[i].toTime();
        let b = cur.val();
        let s = cur.status;
        if(!flag && b < eVal) {
            if(b < sVal) {
                // edge case no overlap
                arr.splice(i, 0, arr[i]);
                i++;
            }
            if(status == s) arr.splice(i, 1);
            else arr[i] = endTime.toString(s); // pull down
            flag = true;
            continue;
        }
        if(flag && b < sVal) {
            if(status != s) arr.splice(i + 1, 0, startTime.toString(status));
            break;
        }
        if(flag) arr.splice(i, 1);
    }
    return arr.join(' ');
}