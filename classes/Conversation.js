const {msgBits} = require('../functions/other');

class Conversation {
    constructor(source) {
        Object.assign(this, msgBits(source));
        delete this.content;
        if(!Conversation.instances[this.guild]) Conversation.instances[this.guild] = {};
        Conversation.instances[this.guild][this.user] = this;
    }

    onMessage(message) {
        if(message.content.split()[0].toLowerCase().includes('exit')) {
            // user exited conversation
            this.send('Exited!');
            if(this.asked) this.asked.reject();
            this.end();
        } else if(this.asked){
            // user responded
            this.channel = message.channel;
            this.asked.resolve(message);
            this.asked = null;
        }
    }

    ask(question) {
        let promise = new Promise((resolve, reject) => {
            this.channel.send(question);
            this.asked = {resolve, reject};
        });
        console.log(this.asked);
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
setInterval(() => console.log(Conversation.instances), 500);

Conversation.onMessage = function(message) {
    let {guild, user} = msgBits(message);
    if(!Conversation.instances[guild]) return false;
    let convo = Conversation.instances[guild][user];
    if(convo) {
        convo.onMessage(message);
        return true;
    }
    return false;
}

module.exports = Conversation;