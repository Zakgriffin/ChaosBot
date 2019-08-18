const fs = require('fs');

const dataPath = './saved_data';
const userPath = dataPath + '/users';
const groupPath = dataPath + '/groups'

var groups = {};
var users = {};
exports.saveGroup = function(guild, obj) {
    let toSave = obj || groups[guild];
    fs.writeFileSync(`${groupPath}/${guild}.json`, JSON.stringify(toSave, null, 4));
    if(!obj) delete groups[guild];
}
exports.getGroup = function(guild) {
    if(groups[guild]) return groups[guild];
    groups[guild] = JSON.parse(fs.readFileSync(`${groupPath}/${guild}.json`));
    return groups[guild];
}
exports.unloadGroup = function(guild) {
    if(groups[guild]) delete groups[guild];
}
exports.existsGroup = function(guild) {
    return groups[guild];
}


exports.saveUser = function(user, obj) {
    let toSave = obj || users[user];
    fs.writeFileSync(`${userPath}/${user}.json`, JSON.stringify(toSave));
    if(!obj) delete users[user];
}
exports.getUser = function(user) {
    if(users[user]) return users[user];
    users[user] = JSON.parse(fs.readFileSync(`${groupPath}/${user}.json`));
    return users[user];
}
exports.unloadUser = function(user) {
    if(users[user]) delete users[user];
}
exports.existsUser = function(user) {
    return users[user];
}