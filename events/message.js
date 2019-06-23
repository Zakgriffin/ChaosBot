const g = require('../index');
const {forFilesInFolder} = require('../util');

// tracks chat context with discord users
let contextData = {};

// details
let detailList = {};
forFilesInFolder('./details', (name, props) => {
    detailList[name.toLowerCase()] = props;
});

// on event call
module.exports = (message) => {
    // ignore all bots
    if(message.author.bot) return;
    const prefix = g.config.prefix;
    if(!message.content.startsWith(prefix)) return;

    const channel = message.channel;
    const sender = message.author.id;

    let lowCase = message.content.toLowerCase().slice(prefix.length);
    let command = lowCase.split(' ')[0];
    let cmd = g.commands[command];

    if(!contextData[sender]) {
        // no context from user
        if(cmd || !g.userData[sender]) {
            if(!g.userData[sender]) {
                // new user setup
                command = 'newuser';
                if(cmd) channel.send(`Hang on, you can't use a command until you enter your info`);
            }
            cmd = g.commands[command];
            contextData[sender] = {
                activeCommand: command,
                neededDetails: cmd.neededDetails,
                optionalDetails: cmd.optionalDetails,
                details: {}
            }
            cmd.start(message);
            lowCase = lowCase.substring(command.length);
        } else return channel.send(`"${command}" is not a valid command`);
    } else if(cmd) return channel.send('Please finish entering the necessary details before starting a new command');

    let senderContext = contextData[sender];

    // handling specific arguments
    if(command == 'done') {
        for(key in senderContext.neededDetails) {
            if(!senderContext.details[key]) {
                return channel.send('Please finish entering the necessary details before confirming command');
            }
        }
        // command confirmed
        g.commands[senderContext.activeCommand].run(message, senderContext.details);
        delete contextData[sender];
        return;
    }
    if(command == 'exit' && senderContext.activeCommand != 'newuser') {
        channel.send(`Exited command "${senderContext.activeCommand}"`);
        delete contextData[sender];
        return;
    }

    // adding details
    const detailRaws = lowCase.split(',');
    let problems = [];
    for(let raw of detailRaws) {
        if(raw.length == 0) return;
        raw = raw.trim();
        // name of detail
        let detail = raw.split(' ')[0];
        const content = raw.slice(detail.length).trim();

        // all details that can be used with this command
        const allDetails = Object.assign({},
            senderContext.neededDetails,
            senderContext.optionalDetails
        );
        // match forupper and lower case
        let match;
        for(key in allDetails) {
            if(key.toLowerCase() == detail) {
                detail = key;
                match = true;
                break;
            }
        }

        if(!match) {
            problems.push(`"${detail}" is not a valid detail`);
            continue;
        }

        if(content == 'delete') {
            delete senderContext.details[detail];
            continue;
        }

        const parser = detailList[allDetails[detail]];
        try {
            // parse content and modify sender context
            let result = parser.parse(content);
            // did not throw error, but not all info was retrieved
            if(!result || !result.isComplete()) throw `could not be understood as a ${allDetails[detail]}`;
            // set detail if all ok
            senderContext.details[detail] = result;
        } catch(err) {
            // could not parse content
            console.error(err);
            problems.push(`"${raw}" ${err}`);
        }
    }

    const embed = new g.Discord.RichEmbed().setColor(0x0000FF);

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
        embed.addField("I don't have any detail info", `Please add some details with "${prefix}[detail] [info]"`);
    }

    // details not given
    text = getText(senderContext.neededDetails,
        (a, b) => { return `- a ${b}, ${a}\n` });
    if(text) {
        embed.addField("Here's what I need", text);
    } else {
        text = getText(senderContext.optionalDetails,
            (a, b) => { return `- a ${b}, ${a}\n` });
        if(text) {
            embed.addField("I have everything I need, but you can still give me optional details like", text);
        } else {
            embed.addField("Those are all the details I can use", 'But you can still modify anything ifyou would like');
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