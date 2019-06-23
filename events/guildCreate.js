const fs = require('fs');

module.exports = (guild) => {
    /*
    create json file in "./saved_data/guilds/${name}"
    add to json "events" object and "users" array
    populate "users" with all active members
        - on new user, add them to "users" array
    */
    let path = `./saved_data/guilds/guild_${guild.id}.json`;

    if (fs.existsSync(path)) return console.log('Already Exists!');

    let guildData = {
        users: [],
        events: {}
    }

    for(let member of guild.members) {
        if(!member[1].user.bot) guildData.users.push(member[0]);
    }

    fs.writeFileSync(path, JSON.stringify(guildData, null, 2));
}