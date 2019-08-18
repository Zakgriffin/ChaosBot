const fs = require('fs');

const dataPath = './saved_data';
const userPath = dataPath + '/users';
const groupPath = dataPath + '/groups'

var groups = {};
var users = {};
exports.saveGroup = function(guild, obj) {save(guild, obj, groups);}
exports.getGroup = function(guild) {return get(guild, groups);}
exports.unloadGroup = function(guild) {unload(guild, groups);}
exports.existsGroup = function(guild) {return exists(guild, groups);}

exports.saveUser = function(user, obj) {save(user, obj, users);}
exports.getUser = function(user) {return get(user, users);}
exports.unloadUser = function(user) {unload(user, users);}
exports.existsUser = function(user) {return exists(user, users);}

function save(key, obj, list) {
    let toSave = obj || list[key];
    fs.writeFileSync(`${list === users ? userPath : groupPath}/${key}.json`, JSON.stringify(toSave, null, 4));
    if(!obj) delete list[key];
}
function get(key, list) {
    if(list[key]) return list[key];
    list[key] = JSON.parse(fs.readFileSync(`${list === users ? userPath : groupPath}/${key}.json`));
    return list[key];
}
function unload(key, list) {
    if(list[key]) delete list[key];
}
function exists(key, list) {
    return list[key] || fs.existsSync(`${list === users ? userPath : groupPath}/${key}.json`);
}