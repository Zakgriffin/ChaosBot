const fs = require('fs');
const g = require('./index');

exports.forFilesInFolder = (folderPath, action) => {
    return new Promise((resolve, reject) => {
        fs.readdir(folderPath, (err, files) => {
            if(err) reject(err);
            for(let file of files) {
                if(!file.endsWith(".js")) return;
                let name = file.split(".")[0];
                let props = require(`${folderPath}/${file}`);
                action(name, props);
            };
            resolve();
        });
    });
}

exports.saveUserData = function() {
    let data = JSON.stringify(g.userData, null, 2);
    fs.writeFile('./saved_data/user_data.json', data, (err) => {
        if(err) throw err;
    });
}

String.prototype.capitalize = function() {
    return this[0].toUpperCase() + this.slice(1);
}

exports.map = function(value, start1, stop1, start2, stop2) {
    if(start1 == stop2) return start1;
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}