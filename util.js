const fs = require('fs');
const g = require('./index');

exports.forFilesInFolder = (folderPath, action, callback) => {
    fs.readdir(folderPath, (err, files) => {
        if(err) throw err;
        for(let file of files) {
            if(!file.endsWith(".js")) return;
            let name = file.split(".")[0];
            let props = require(`${folderPath}/${file}`);
            action(name, props);
        };
        if(callback) callback();
    });
}

global.saveUserData = function() {
    let data = JSON.stringify(userData, null, 2);
    fs.writeFile('./saved_data/user_data.json', data, (err) => {
        if(err) throw err;
    });
}

exports.capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}