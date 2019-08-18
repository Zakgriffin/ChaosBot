const {Client} = require('discord.js');
const {token} = require('../secrets.json');
const {filesToObject} = require('../functions/fileSystem');
const {msgBits} = require('../functions/other');
const App = require('../app');
const Database = require('./databaseHandler');
const Conversation = require('../classes/Conversation');

const client = new Client();
const commands = filesToObject('./commands');

let debug = true; // <-- very safe
client.on('message', message => {
    if(debug && message.content.startsWith('redo')) {
        client.emit('guildCreate', message.guild);
        return;
    }

    if(message.author.bot) return;
    if(Conversation.onMessage(message)) return;
    let {guild, content} = msgBits(message);

    let prefix = Database.getGroup(guild).prefix;
    Database.unloadGroup(guild);
    if(!content.startsWith(prefix)) return;

    let cmd = content.split(' ')[0].substring(prefix.length);
    if(!commands[cmd]) return;

    // valid start command
    App.trigger('newCommand', commands[cmd], content, new Conversation(message));
})

exports.finishSetup = function() {
    for(let key in App.events) {
        let event = App.events[key];
        if(event.eventSource === 'discord') {
            client.on(key, function(...args) {
                args.unshift(key);
                App.trigger.apply(null, args);
            });
        }
    }

    client.login(token);
}

exports.client = client;