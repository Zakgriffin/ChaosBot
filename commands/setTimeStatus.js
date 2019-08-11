exports.start = (message) => {
    message.channel.send('How would you like to change your availabilty?');
}

exports.run = (message, details) => {
    const user = message.author.id;
    const channel = message.channel;
    const date = details.date.slashForm();

    let userData = g.userData[user];
    if(!userData.dates) g.userData[user].dates = {};
    let oldStatus = userData.dates[date];

    if(!oldStatus) oldStatus = '';
    let newStatus = insertTimeStatus(oldStatus, details.status.val, details.startTime, details.endTime);

    g.userData[user].dates[date] = newStatus;
    util.saveUserData();
    
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
    startTime: 'time',
    endTime: 'time',
    date: 'date',
    status: 'status'
}


function insertTimeStatus(str, status, startTime, endTime) {
    if(str[0] != '0') str = '0U' + str;
    let sVal = startTime.val();
    let eVal = endTime.val();
    let arr = str.split(' ');
    let flag = false;

    for(let i = arr.length - 1; i >= 0; i--) {
        let cur = arr[i].toTime();
        let b = cur.val();
        let s = cur.status;
        if(!flag && b <= eVal) {
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