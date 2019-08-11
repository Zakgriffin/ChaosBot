const fs = require('fs');

exports.forFilesInFolder = (folderPath, action, ext = ['js', 'json']) => {
    fs.readdir(folderPath, (err, files) => {
        if(err) console.log(err);
        files.forEach(file => {
            let fullName = file.split(".");
            let name = fullName[0];
            if(!ext.includes(fullName[1])) return;
            let props = require(`${folderPath}/${file}`);
            action(name, props);
        });
    });
}
exports.filesToObject = function(path, layer) {
    if(layer === true) layer = Infinity;
    let obj = {};
    let files = fs.readdirSync(path);
    for(let file of files) {
        let split = file.split('.');
        let newPath = `${path}/${file}`;
        if(['js', 'json'].includes(split[1])) {
            // add to object
            obj[split[0]] = require.main.require(newPath);
        } else if(layer > 1 && fs.lstatSync(newPath).isDirectory()){
            // reursive call for sub-folders
            Object.assign(obj, exports.filesToObject(newPath, layer - 1));
        }
    }
    return obj;
}