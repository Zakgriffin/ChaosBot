const fs = require('fs');
const userDataPath = './saved_data/user_data.json';

var userData;

fs.readFile(userDataPath, (err, data) => {
    if(err) console.log(err);
    userData = JSON.parse(data);
});

exports.userDate = userData;

exports.saveUserData = function() {
    let data = JSON.stringify(userData, null, 2);
    fs.writeFile(userDataPath, data, (err) => {
        if(err) console.log(err);
    });
}


exports.init = function() {
    
}
exports.finishSetup = function() {

}