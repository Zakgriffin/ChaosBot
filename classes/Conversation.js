const Database = require('../services/databaseHandler');
const {msgBits} = require('../functions/other');

class Conversation {
    constructor(source) {
        if(!Conversation.instances[source.guild]) Conversation.instances[source.guild] = {};
        Object.assign(this, source);
        delete this.content;

        if(source.user) Conversation.instances[this.guild][this.user] = this;
        else Conversation.instances[this.guild].all = this;

        if(Database.existsGroup(this.guild)) this.prefix = Database.getGroup(this.guild).prefix;
        else this.ignorePrefix = true;
    }

    onMessage(message) {
        // called for every 
        let content = message.content;
        if(!(content.startsWith(this.prefix) || this.ignorePrefix)) return; // no conversations for this user
        if(content.split()[0].toLowerCase().includes('exit')) {
            // user exited conversation
            this.send('Exited!');
            if(this.asked) this.asked.reject();
            return this.end();
        }
        // user responded
        if(!this.staticChannel) this.channel = message.channel;
        if(this.conditionalResolve) {
            // some condition in place
            this.conditionalResolve(content, this.asked.resolve);
        } else {
            // no condition, act with immediate resolve
            this.asked.resolve(content);
        }
    }

    ask(question, conditionalResolve) {

        // returns a promise that resolves to the content of next response
        // or, if conditional is provided, resvoles to when criteria is met
        let a = this;
        let promise = new Promise((resolve, reject) => {
            this.channel.send(question);
            this.asked = {resolve, reject};
            if(conditionalResolve) {
                a.conditionalResolve = conditionalResolve;
            }
        }).then(function() {
            a.asked = null;
        });
        console.log(promise)
        return promise;
    }

    send(message, extras) {
        this.channel.send(message, extras);
    }

    end() {
        delete Conversation.instances[this.guild][this.user];
        if(Object.keys(Conversation.instances[this.guild]).length === 0) {
            delete Conversation.instances[this.guild];
        }
    }
}
Conversation.instances = {};
//setInterval(() => console.log(Conversation.instances), 500);

Conversation.onMessage = function(message) {
    let {guild, channel, user} = msgBits(message);
    const insts = Conversation.instances[guild];
    if(!insts) return;
    let convo = insts[user] || insts.all;
    if(convo && (!convo.staticChannel || channel === convo.channel)) {
        convo.onMessage(message);
        return true;
    }
}

module.exports = Conversation;