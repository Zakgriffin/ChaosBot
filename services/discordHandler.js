const {Client} = require('discord.js');
const {token} = require('../secrets.json');
const {filesToObject} = require('../functions/fileSystem');
const {msgBits} = require('../functions/other');
const App = require('../app');
const Conversation = require('../classes/Conversation');

const client = new Client();
const commands = filesToObject('./commands');

client.on('message', message => {
    if(message.author.bot) return;
    if(Conversation.onMessage(message)) return;
    let {guild, user, content} = msgBits(message);

    let prefix = App.groups[guild].prefix;
    if(!content.startsWith(prefix)) return;

    let cmd = content.split(' ')[0].substring(prefix.length);
    if(!commands[cmd]) return;

    // valid start command
    let pass = content.split(cmd)[1];
    App.trigger('newCommand', pass, new Conversation(message));
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