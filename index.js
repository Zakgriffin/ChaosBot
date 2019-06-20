// Util
const { promisify } = require('util');

// Discord
const Discord = require("discord.js");
const Enmap = require("enmap");
const fs = require("fs");

const client = new Discord.Client();
const config = require("./config.json");

global.Discord = Discord;
global.client = client;
global.config = config;
global.contextData = {};
fs.readFile('./saved_data/user_data.json', (err, data) => {
  if(err) throw err;
  global.userData = JSON.parse(data);
});
global.util = require('./util.js');
global.saveUserData = function() {
  let data = JSON.stringify(userData, null, 2);
  fs.writeFile('./saved_data/user_data.json', data, (err) => {
      if(err) throw err;
  });
}

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, global));
  });
});

global.commands = new Enmap();
fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0].toLowerCase();
    //console.log(`Attempting to load command ${commandName}`);
    global.commands.set(commandName, props);
  });
});

global.details = new Enmap();
fs.readdir("./details/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./details/${file}`);
    let detailName = file.split(".")[0].toLowerCase();
    global.details.set(detailName, props);
  });
});

client.login(config.token);