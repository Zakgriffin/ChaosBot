// imports
const fs = require("fs");
const Discord = require("discord.js");
const {forFilesInFolder} = require('./util');
const config = require('./config.json');

const client = new Discord.Client();
exports.client = client;
exports.Discord = Discord;

// commands
let commands = {};
let j = forFilesInFolder('./commands', (commandName, command) => {
    commands[commandName] = command;
}, () => {
    exports.commands = commands;
});

// events
forFilesInFolder('./events', (eventName, event) => {
    client.on(eventName, event);
});

// get user data
fs.readFile('./saved_data/user_data.json', (err, data) => {
    if(err) throw err;
    exports.userData = JSON.parse(data);
});

client.login(config.token);