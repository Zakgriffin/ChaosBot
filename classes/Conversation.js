const Database = require('../services/databaseHandler');
const {msgBits} = require('../functions/other');

class Conversation {
    constructor(source) {
        //console.log(source.guild)
        if(!Conversation.instances[source.guild]) Conversation.instances[source.guild] = {};
        Object.assign(this, source);
        delete this.content;
        if(source.user) {
            Conversation.instances[this.guild][this.user] = this;
        } else {
            Conversation.instances[this.guild].all = this;
        }
        this.prefix = Database.getGroup(this.guild).prefix;
    }

    onMessage(message) {
        let content = message.content;
        if(!content.startsWith(this.prefix) && !this.ignorePrefix) return;
        if(content.split()[0].toLowerCase().includes('exit') && !this.cantExit) {
            // user exited conversation
            this.send('Exited!');
            if(this.asked) this.asked.reject();
            this.end();
        } else if(this.asked) {
            // user responded
            if(!this.staticChannel) this.channel = message.channel;
            if(this.cond) {
                this.cond(content, this.asked.resolve);
                return;
            }
            this.asked.resolve(content);
            this.asked = null;
        }
    }

    ask(question, withCondition) {
        let promise = new Promise((resolve, reject) => {
            this.channel.send(question);
            this.asked = {resolve, reject};
            if(withCondition) {
                this.cond = withCondition;
            }
        });
        return promise;
    }

    send(message) {
        this.channel.send(message);
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