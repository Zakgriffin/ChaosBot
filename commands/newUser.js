const fs = require('fs');

exports.start = (global, message) => {
    message.channel.send('You must be new! Please fill in the necessary info');
}

exports.run = (global, details) => {
    let user = details.message.author.id;
    let {firstName, lastName, email, phoneNum} = details;
    let result = {
        firstName: firstName.val,
        lastName: lastName.val
    }
    if(email) result.email = email.val;
    if(phoneNum) result.phoneNum = phoneNum.val;

    global.userData[user] = result;
    details.message.channel.send(`Ok, ${firstName.val}, you're ready to go!`);
    console.log(global.userData[user]);

    global.saveUserData();
}

exports.neededDetails = {
    firstName: 'text',
    lastName: 'text'
}
exports.optionalDetails = {
    email: 'text',
    phoneNum: 'text'
}