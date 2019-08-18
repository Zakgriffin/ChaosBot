const Conversation = require('../../classes/Conversation');
const Database = require('../../services/databaseHandler');

exports.onEvent = async discordGuild => {
    const guild = discordGuild.id;
    const channel = getDefaultChannel(discordGuild);
    let convo = new Conversation({guild, channel,
        cantExit: true,
        staticChannel: true,
        ignorePrefix: true
    });

    if(Database.existsGroup(guild)) {
        // re-added
        convo.send(`Thanks for adding me back to your server!\nYour data was remembered so there's not need to set up again`);
        return convo.end();
    }

    let groupData = {};

    groupData.name = discordGuild.name;
    let users = [];
    for(let member of discordGuild.members.array()) {
        //if(member.user.bot) continue;
        users.push(member.id);
    }
    groupData.users = users;

    let question = `Thanks for adding me to your server! To set me up, I need to know a few things.\nFirstly, I need a prefix for you to call me by like "!" or "?".\nTell me one now with "prefix [Your Prefix]"`;
    let response = await convo.ask(question, (res, resolve) => {
        // condition
        let words = res.split(' ');
        if(words[0] === 'prefix' && words[1]) return resolve(words[1]);
        convo.ask(`Sorry, I didn't understand that. Remember, I need "prefix [Your Prefix]"`);
    });
    groupData.prefix = response;


    question = `Ok, your prefix is now "${groupData.prefix}". Next I need a role that all users capable of scheduling will have tell me one now with "role [Your Role]"`;
    response = await convo.ask(question, (res, resolve) => {
        // condition
        let words = res.split(' ');
        if(words[0] === 'role' && words[1]) return resolve(words[1]);
        convo.ask(`Sorry, I didn't understand that. Remember, I need "role [Your Role]"`);
    });
    groupData.authRole = response;

    convo.send(`Alright, that's all for setup. You can now use all my features. Try ${groupData.prefix}help to see what commands I know`);
    convo.end();

    console.log(groupData);
    Database.saveGroup(guild, groupData);
}

exports.eventSource = 'discord';

function getDefaultChannel(guild) {
    // stealed from https://anidiots.guide/frequently-asked-questions#default-channel

    // get "original" default channel
    if(guild.channels.has(guild.id))
        return guild.channels.get(guild.id)
  
    // Check for a "general" channel, which is often default chat
    const generalChannel = guild.channels.find(channel => channel.name === "general");
    if (generalChannel)
          return generalChannel;
    // Now we get into the heavy stuff: first channel in order where the bot can speak
    // hold on to your hats!
    return guild.channels
        .filter(c => c.type === "text" &&
        c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
        .sort((a, b) => a.position - b.position)
        .first();
}