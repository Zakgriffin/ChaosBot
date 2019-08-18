const Database = require('../services/databaseHandler');

exports.start = convo => {
    convo.send('You must be new! Please fill in the necessary info');
}

exports.run = async convo => {
    const user = convo.user;
    const {firstName, lastName, email, phoneNum} = convo.givenDetails;
    let result = {
        firstName: firstName.val.toLowerCase().capitalize(),
        lastName: lastName.val.toLowerCase().capitalize()
    }
    if(email) result.email = email.val;
    if(phoneNum) result.phoneNum = phoneNum.val; // TODO better format

    convo.send(`Ok, ${firstName.val}, you're ready to go!`);

    Database.saveUser(user, result);
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

exports.detailTemplate = {
    firstName: 'text',
    lastName: 'text',
    email: 'text',
    phoneNum: 'text',
    formats: {
        needed: ['firstName', 'lastName'],
        optional: ['email', 'phoneNum']
    }
}
