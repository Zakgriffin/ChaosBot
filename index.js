const fs = require("fs");
const Discord = require("discord.js");
const {forFilesInFolder} = require('./util');
const client = new Discord.Client();
const {token} = require('./config.json');

// events
let getEvents = forFilesInFolder('./events', (eventName, event) => {
    client.on(eventName, event);
});

// user data
let getUserData = new Promise((resolve, reject) => {
    fs.readFile('./saved_data/user_data.json', (err, data) => {
        if(err) reject(err);
        exports.userData = JSON.parse(data);
        resolve();
    });
});

Promise.all([getEvents, getUserData]).then(_ => {
    client.login(token);
});

exports.client = client;
exports.Discord = Discord;