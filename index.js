const fs = require("fs");
const Discord = require("discord.js");
const {forFilesInFolder} = require('./util');
const config = require('./config.json');
const client = new Discord.Client();

// commands
let commands = {};
let getCommands = forFilesInFolder('./commands', (commandName, command) => {
    commands[commandName.toLowerCase()] = command;
}).then(_ => {
    exports.commands = commands;
});

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

Promise.all([getCommands, getEvents, getUserData]).then(_ => {
    client.login(config.token);
    
});

exports.client = client;
exports.Discord = Discord;
exports.config = config;