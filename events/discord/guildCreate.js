const Conversation = require('../../classes/Conversation');
const Database = require('../../services/databaseHandler');
const Calendar = require('../../services/calendarHandler');

exports.onEvent = async discordGuild => {
    const guild = discordGuild.id;
    const channel = getDefaultChannel(discordGuild);
    let convo = new Conversation({guild, channel,
        cantExit: true,
        staticChannel: true,
        ignorePrefix: true,
        allUsers: true
    });

    if(Database.existsGroup(guild)) {
        // re-added
        convo.send(`Thanks for adding me back to your server!\nYour data was remembered so there's not need to set up again`);
        return convo.end();
    }

    let groupData = {};

    groupData.name = discordGuild.name;
    let users = [];
    /*
    for(let member of discordGuild.members.array()) {
        //if(member.user.bot) continue;
        users.push(member.id);
    }
    groupData.users = users;
    */
    convo.askForInfo = function(question, keyword) {
        return this.askConditional(question, content => {
            // condition
            let words = content.split(' ');
            if(words[0] === keyword && words[1]) {
                return {parsed: words[1]};
            } else {
                return {onIssue: `Sorry, I didn't understand that. Remember, I need "${keyword} [Your ${keyword.capitalize()}]"`};
            }
        });
    }
    groupData.prefix = await convo.askForInfo(
        `Thanks for adding me to your server! To set me up, I need to know a few things.\nFirstly, I need a prefix for you to call me by like "!" or "?".\nTell me one now with "prefix [Your Prefix]"`,
        'prefix'
    );
    groupData.role = await convo.askForInfo(
        `Ok, your prefix is now "${groupData.prefix}". Next I need a role that all users capable of scheduling will have tell me one now with "role [Your Role]"`,
        'role'
    );
    /*
    groupData.email = convo.askForInfo(
        `Understood, the last thing I need is a google email. Tell me one now with "email [Your Calendar Email]"`,
        'email'
    );
    groupData.email = response;
    let token = await Calendar.newToken(groupData.email, convo);
    groupData.token = token;
    */
    convo.send(`Alright, that's all for setup. You can now use all my features. Try ${groupData.prefix}help to see what commands I know`);
    convo.end();

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
        c.permissionsFor(guild.client.user).has('SEND_MESSAGES'))
        .sort((a, b) => a.position - b.position)
        .first();
}