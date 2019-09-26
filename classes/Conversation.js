const Database = require('../services/databaseHandler');
const {msgBits} = require('../functions/other');

class Conversation {
    constructor(source) {
        // creating new conversations
        Object.assign(this, source); // source holds message bits, and other info
        delete this.content;

        if(!Conversation.instances[this.guild]) Conversation.instances[this.guild] = {};
        if(source.user || !source.allUsers) Conversation.instances[this.guild][this.user] = this;
        else Conversation.instances[this.guild].all = this;

        // assign a prefix
        if(Database.existsGroup(this.guild)) this.prefix = Database.getGroup(this.guild).prefix;
        else this.ignorePrefix = true;
    }

    onMessage(message) {
        // handle response from user
        if(!this.asked) return; // no pending question

        let content = message.content;
        if(!(content.startsWith(this.prefix) || this.ignorePrefix)) return; // no conversations for this user
        if(content.split()[0].toLowerCase().includes('exit')) {
            // user exited conversation
            this.send('Exited!');
            if(this.asked) this.asked.reject();
            return this.end();
        }
        // user responded
        if(!this.staticChannel) this.channel = message.channel; // re-assign channel if user moved

        let promise = this.asked;
        this.asked = null;
        promise.resolve(content); // resolve promise to message content
    }

    ask(question) {
        // returns a promise that resolves to the content of next response
        const a = this;
        a.send(question);
        let promise = new Promise((resolve, reject) => {
            a.asked = {resolve, reject}; // save promise functions in convo object as "asked"
        });
        return promise;
    }

    askConditional(question, condition) {
        const a = this;
        a.send(question);
        let promise = new Promise((resolve, reject) => {
            function askSub() {
                new Promise((resolveSub, rejectSub) => {
                    a.asked = {resolve: resolveSub, reject: rejectSub}; // save sub promise functions in convo object as "asked"
                }).then(content => {
                    // user responded and sub promise resolved
                    let result = condition(content);
                    if(result.parsed) {
                        // condition for content met, resolve
                        resolve(result.parsed);
                    } else {
                        // condition not met, recurse: create new promise
                        a.send(result.onIssue);
                        askSub();
                    }
                });
            }
            askSub();
        });
        return promise;
    }

    send(message, extras) {
        // extras for images, attachments, etc
        this.channel.send(message, extras);
    }

    end() {
        // end conversation and remove it from instances
        if(this.allUsers) delete Conversation.instances[this.guild].all;
        else delete Conversation.instances[this.guild][this.user];
        
        if(Object.keys(Conversation.instances[this.guild]).length === 0) {
            // no remaining conversations in guild, remove empty object
            delete Conversation.instances[this.guild];
        }
    }
}
Conversation.instances = {}; // holds all active conversations

setInterval(() => console.log(Conversation.instances), 500);

Conversation.onMessage = function(message) {
    // called whenever discord client recieves a message
    let {guild, channel, user} = msgBits(message);
    const guildInstances = Conversation.instances[guild];
    if(!guildInstances) return; // no active conversations for this guild

    let convo = guildInstances[user] || guildInstances.all;
    if(convo && (channel === convo.channel || !convo.staticChannel)) {
        // conversation exists, trigger it and return true
        convo.onMessage(message);
        return true;
    }
    // conversation does not exist, return falsely
}

module.exports = Conversation;