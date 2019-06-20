const fs = require('fs');

module.exports = (global, message) => {
    const config = global.config;
    const client = global.client;
    // ignore all bots
    if(message.author.bot) return;
    if(!message.content.startsWith(config.prefix)) return;

    const channel = message.channel;
    const sender = message.author.id;
    let lowCase = message.content.toLowerCase().slice(config.prefix.length);

    // grab the command data from the client.commands Enmap
    let command = lowCase.split(' ')[0];
    let cmd = global.commands.get(command);

    // starting new operation
    if(!global.contextData[sender]) {
        // no context from user
        if(cmd || !global.userData[sender]) {
            if(!global.userData[sender]) {
                // new user setup
                command = 'newuser';
                if(cmd) channel.send(`Hang on, you can't use a command until you enter your info`);
            }
            cmd = global.commands.get(command);
            global.contextData[sender] = {
                activeCommand: command,
                neededDetails: cmd.neededDetails,
                optionalDetails: cmd.optionalDetails,
                details: {}
            }
            cmd.start(global, message);
            lowCase = lowCase.substring(command.length);
        } else return channel.send(`"${command}" is not a valid command`);
    } else if(cmd) return channel.send('Please finish entering the necessary details before starting a new command');

    let senderContext = global.contextData[sender];

    // handling specific arguments
    if(command == 'done') {
        for(key in senderContext.neededDetails) {
            if(!senderContext.details[key]) {
                return channel.send('Please finish entering the necessary details before confirming command');
            }
        }
        // command confirmed
        senderContext.details.message = message;
        global.commands.get(senderContext.activeCommand).run(global, senderContext.details);
        delete global.contextData[sender];
        return;
    }
    if(command == 'exit' && senderContext.activeCommand != 'newuser') {
        channel.send(`Exited command "${senderContext.activeCommand}"`);
        delete global.contextData[sender];
        return;
    }

    // adding details
    const detailRaws = lowCase.split(',');
    let problems = [];
    detailRaws.forEach(raw => {
        if(raw.length == 0) return;
        raw = raw.trim();
        let type = raw.split(' ')[0];
        const content = raw.slice(type.length).trim();
 
        const dets = Object.assign({},
            senderContext.details,
            senderContext.neededDetails,
            senderContext.optionalDetails
        );
        // match for upper and lower case
        let match;
        for(key in dets) {
            if(key.toLowerCase() == type) {
                type = key;
                match = true;
                break;
            }
        }
        
        if(!match) return problems.push(`"${type}" is not a valid detail`);

        if(content == 'delete') {
            delete senderContext.details[type];
            return;
        }

        const parser = global.details.get(dets[type]);
        try {
            // parse content and modify sender context
            let result = parser.parse(content);
            for(let key in result) {
                // did not throw error, but not all info was retrieved
                if(result[key] == undefined) throw `could not be understood as a ${dets[type]}`;
            }
            senderContext.details[type] = result;
        } catch(err) {
            // could not parse content
            problems.push(`"${raw}" ${err}`);
        }
    })

    const embed = new global.Discord.RichEmbed()
        .setColor(0x0000FF)

    function getText(list, formatFunc) {
        let listText = '';
        for(key in list) {
            if(!senderContext.details[key])
            listText += formatFunc(key, list[key]);
        }
        return listText;
    }

    let text = '';
    // current details
    for(key in senderContext.details) {
        text += `- ${key}: ${senderContext.details[key].standardForm()}\n`
    }
    
    if(text) {
        embed.addField("Here's what I have", text);
    } else {
        embed.addField("I don't have any detail info", `Please add some details with "${config.prefix}[detail] [info]"`);
    }

    // details not given
    text = getText(senderContext.neededDetails,
        (a, b) => {return `- a ${b}, ${a}\n`});
    if(text) {
        embed.addField("Here's what I need", text);
    } else {
        text = getText(senderContext.optionalDetails,
            (a, b) => {return `- a ${b}, ${a}\n`});
        if(text) {
            embed.addField("I have everything I need, but you can still give me optional details like", text);
        } else {
            embed.addField("Those are all the details I can use", 'But you can still modify anything if you would like');
        }
    }
    
    if(problems.length > 0) {
        function getText() {
            let text = '';
            problems.forEach(problem => {
                text += `- ${problem}\n`;
            })
            return text;
        }
        embed.addField('But I had problems with', getText());
    }

    channel.send(embed);
};