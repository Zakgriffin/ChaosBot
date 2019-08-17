const {filesToObject} = require('../../functions/fileSystem');
const details = filesToObject('./commands/details');
const App = require('../../App');
const Discord = require('discord.js');
require('../../functions/primitive');

exports.onEvent = async (command, content, convo) => {
    convo.template = templateParse(command.detailTemplate);
    convo.givenDetails = {};
    convo.command = command;

    eachMessage(content, convo);
}

function eachMessage(content, convo) {
    let prefix = App.groups[convo.guild].prefix;
    content = content.startsWith(prefix) ? content.substring(content.indexOf(prefix) + 1) : content;

    let first = content.substr(0, content.indexOf(' ') + 1).toLowerCase();
    if(['done', 'confirm'].includes(first)) {
        convo.command.run(convo.givenDetails);
        convo.end();
        return;
    }
    let detsToParse = content.split(',');
    detsToParse.map(det => det.trim());

    let data = convo.template.data;
    let formats = convo.template.formats;

    let newDets = {};
    let problems = [];
    for(let detString of detsToParse) {
        let [detKey, ...toParse] = detString.split(' ');
        toParse = toParse.join(' ');

        let detObj = data[detKey.toLowerCase()];
        if(!detObj) {
            problems.push(`I couldn't relate ${detKey} to a detail`);
            continue;
        }
        let detKeyCaps = detKey;
        if(detObj.alias) {
            detKeyCaps = detObj.alias;
            detObj = data[detKeyWithCaps];
        }
        let parsingDetail = details[detObj.type];

        // parse
        try {
            let parsed = parsingDetail.parse(toParse, detObj.references || {});
            // either returns {key: val, key2: val2} or just val
            let o = {};
            if(detObj.references) o = parsed; // first case
            else o = {detKeyCaps: parsed}; // second case
            // ERR? ^

            for(let [key, val] of Object.entries(o)) {
                if(!val || !val.isComplete()) {
                    let t = key.camelToSpaces().toLowerCase();
                    problems.push(`"${toParse}" did not contain all the needed info for its ${t} component`);
                    continue;
                }
                convo.givenDetails[key] = val;
            }
        } catch(e) {
            // error parsing
            let t = detKeyCaps.camelToSpaces().toLowerCase();
            if(typeof e !== 'string') problems.push(`"${toParse}" could not be understood as a ${t}`);
            else problems.push(e);
            continue;
        }
    }

    let form = formats[convo.activeFormat];
    // ERR? ^
    if(!form) form = formats.main;
    let newOldGiven = Object.assign({}, data, newDets);
    let newOldAwait = form.needed.concat(form.optional);

    // set awaitState
    let awaitState;
    if(Object.keys(newOldGiven).length === 0) {
        awaitState = 'none';
    } else {
        awaitState = 'optional';
        for(let key of newOldAwait) {
            let full = false;
            if(!data[key] && !newDets[key]) {
                awaitState = 'needed';
                break;
            }
            if(full) awaitState = 'full';
        }
    }

    // build embed
    const embed = new Discord.RichEmbed().setColor(0x0000FF);

    // given
    if(awaitState === 'none') {
        embed.addField(`I don't have any detail info`, `Please add some details with "${prefix}[detail] [info]"`);
    } else {
        let text = '';
        for(let key of newOldAwait) {
            if(data[key]) text += `- ${key.camelToSpaces()}: ${data[key].standardForm()}\n`;
            else if(newDets[key]) text +=  `- ${key.camelToSpaces()}: ${newDets[key].standardForm()} (NEW)\n`;
        }
        console.log('AHHHHHH!!!' + newOldAwait);
        embed.addField("Here's what I have", text);
    }

    // awaiting
    if(awaitState === 'full') {
        embed.addField('Those are all the details I can use', 'But you can still modify anything if you would like');
    } else {
        let text = '';
        for(let key of form[awaitState]) {
            if(!data[key] && !newDets[key]) text += `- ${key.camelToSpaces()}: a ${val.type}\n`;
        }
        if(awaitState === 'needed') embed.addField(`Here's what I need`, text);
        else embed.addField('I have everything I need, but you can still give me optional details like', text);
    }

    // send and await
    convo.ask(embed).then(response => {
        eachMessage(response, convo); // recursive call
    }).catch(err => {
        console.log(err);
    });
}

function templateParse(template) {
    let res = {
        data: {},
        formats: {}
    };
    for(let [key, val] of Object.entries(template)) {
        if(key === 'formats') {
            if(template.formats.needed) res.formats.main = template.formats;
            else res.formats = template.formats;
        } else {
            if(typeof val === 'string') {
                if(val === '') res.data[key] = {type: key}; // time: ''
                else res.data[key] = {type: val}; // start: 'time'
            } else {
                res.data[key] = val;
                for(let [maybeKeywords, keywordList] of Object.entries(val)) {
                    if(maybeKeywords === 'keywords') {
                        for(let elem of keywordList) {
                            res.data[elem] = {alias: key};
                        }
                        delete res.data[key][maybeKeywords];
                    }
                }
            }
            let lowKey = key.toLowerCase();
            if(key !== lowKey)res.data[lowKey] = {alias: key};
        }
    }
    return res;
}