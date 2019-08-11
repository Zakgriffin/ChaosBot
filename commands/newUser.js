exports.start = (message) => {
    message.channel.send('You must be new! Please fill in the necessary info');
}

exports.run = (message, details) => {
    let user = message.author.id;
    let channel = message.channel;

    let {firstName, lastName, email, phoneNum} = details;
    let result = {
        firstName: firstName.val.capitalize(),
        lastName: lastName.val.capitalize()
    }
    if(email) result.email = email.val;
    if(phoneNum) result.phoneNum = phoneNum.val;

    g.userData[user] = result;
    channel.send(`Ok, ${firstName.val}, you're ready to go!`);

    saveUserData();

}

// details
exports.neededDetails = {
    firstName: 'text',
    lastName: 'text'
}
exports.optionalDetails = {
    email: 'text',
    phoneNum: 'text'
}