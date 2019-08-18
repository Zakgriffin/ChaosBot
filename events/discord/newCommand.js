const {filesToObject} = require('../../functions/fileSystem');
const details = filesToObject('./commands/details');
const Database = require('../../services/databaseHandler');
const {RichEmbed} = require('discord.js');
require('../../functions/primitive');

exports.onEvent = async (command, content, convo) => {
    if(command.instant) {
        // no need for details
        let promise = command.run(convo);
        promise.then(() => {
            Database.saveGroup(convo.guild);
            convo.end();
        });
        return;
    }

    convo.template = templateParse(command.detailTemplate);
    convo.givenDetails = {};
    convo.command = command;
    command.start(convo);
    eachMessage(content.cutBefore(' '), convo);
}

function eachMessage(content, convo) {
    let prefix = convo.prefix;
    content = content.startsWith(prefix) ? content.cutBefore(prefix) : content;

    let first = content.cutAfter(' ').toLowerCase();
    if(['done', 'confirm'].includes(first)) {
        let promise = convo.command.run(convo);
        promise.then(() => {
            Database.saveGroup(convo.guild);
            convo.end();
        });
        return;
    }
    let detsToParse = content.split(',');
    detsToParse = detsToParse.map(det => det.trim());

    let data = convo.template.data;
    let oldDets = convo.givenDetails;
    let formats = convo.template.formats;

    let newDets = {};
    let problems = [];
    for(let detString of detsToParse) {
        if(!detString) continue;
        let [detKey, ...toParse] = detString.split(' ');
        toParse = toParse.join(' ');

        let detObj = data[detKey.toLowerCase()];
        if(!detObj) {
            problems.push(`I couldn't relate "${detKey}" to a detail`);
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
            if(detObj.references) { 
                // first case
                for(let [key, val] of Object.entries(parsed)) {
                    if(!val || !val.isComplete()) {
                        let t = key.camelToSpaces().toLowerCase();
                        problems.push(`"${toParse}" did not contain all the needed info for its ${t} component`);
                        continue;
                    }
                    convo.givenDetails[key] = val;
                }
            } else {
                // second case
                if(!parsed || !parsed.isComplete()) {
                    let t = data[detKeyCaps].type.camelToSpaces().toLowerCase();
                    problems.push(`"${toParse}" could not be understood as a ${t}`);
                    continue;
                }
                newDets[detKeyCaps] = parsed;
            }
        } catch(err) {
            // error parsing
            let t = data[detKeyCaps].type.camelToSpaces().toLowerCase();
            if(typeof err !== 'string') {
                problems.push(`Something went wrong with parsing "${toParse}" as a ${t}`);
                if(err) console.log(err)
            }
            else problems.push(`${detKeyCaps.camelToSpaces()}: ${err}`);
            continue;
        }
    }

    let form = formats[convo.activeFormat];
    // ERR? ^
    if(!form) form = formats.main;
    let oldNewGiven = Object.assign({}, oldDets, newDets);
    let awaiting = form.needed.concat(form.optional);

    // set awaitState
    let awaitState;
    if(Object.keys(oldNewGiven).length === 0) {
        awaitState = 'none';
    } else {
        let isFull = true;
        awaitState = 'needed';
        for(let key of form.needed) {
            if(!oldNewGiven[key]) {
                isFull = false;
                break;
            }
        }
        if(isFull) {
            awaitState = 'optional';
            for(let key of form.optional) {
                if(!oldNewGiven[key]) {
                    isFull = false;
                    break;
                }
            }
            if(isFull) awaitState = 'full';
        }
    }

    // build embed
    const embed = new RichEmbed().setColor(0x0000FF);

    // given
    if(awaitState === 'none') {
        embed.addField(`I don't have any detail info`, `Please add some details with "${prefix}[detail] [info]"`);
    } else {
        let text = '';
        for(let key of awaiting) {
            if(!oldNewGiven[key]) continue;
            let t = `${key.camelToSpaces()}: ${(newDets[key] || oldDets[key]).standardForm()}`;
            if(newDets[key]) text +=  `- ${t} :point_left:\n`;
            else text += `- ${t}\n`;
        }
        embed.addField("Here's what I have", text);
    }

    // awaiting
    if(awaitState === 'full') {
        embed.addField('Those are all the details I can use', 'But you can still modify anything if you would like');
    } else {
        let text = '';
        if(awaitState === 'none') awaitState = 'needed';
        for(let key of form[awaitState]) {
            if(!oldNewGiven[key]) text += `- ${key.camelToSpaces()}: a ${data[key].type}\n`;
        }
        if(awaitState === 'needed') embed.addField(`Here's what I need`, text);
        else embed.addField('I have everything I need, but you can still give me optional details like', text);
    }

    Object.assign(convo.givenDetails, newDets);

    // problems
    if(problems.length > 0) {
        let text = '';
        for(let problem of problems) {
            text += `- ${problem}\n`;
        }
        embed.addField('But I had problems with', text);
    }

    // send and await
    convo.ask(embed).then(response => {
        eachMessage(response, convo); // recursive call
    }).catch(err => {
        if(err) console.log(err);
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
                        for(let word of keywordList) {
                            res.data[word] = {alias: key};
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