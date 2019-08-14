const {filesToObject} = require('./functions/fileSystem');
const {getNested} = require('./functions/other')
const details = filesToObject('./commands/details');
require('./functions/primitive');

exports.onEvent = async (command, content, convo) => {
    convo.template = command.detailTemplate;
    convo.givenDetails = {};

    let detsRaw = content.split(cmd)[1];
    let detsToParse = detsRaw.split(',');
    detsToParse.map(det => det.trim());

    let problems = [];
    for(let detString of detsToParse) {
        let [detKey, ...toParse] = detString.split(' ');
        toParse = toParse.join(' ');
        let data = convo.template.data;
        let formats = convo.template.formats;

        let detObj = data[detKey];
        if(!detObj) {
            problems.push(`I couldn't relate ${detKey} to a detail`);
            continue;
        }
        if(detObj.alias) detObj = data[detObj.alias];
        let parsingDetail = details[detObj.type];

        // parse
        try {
            let parsed = parsingDetail.parse(toParse, detObj);
            let o = {};
            if(detObj.references) o = parsed;
            else o = {detKey: parsed};

            for(let [key, val] of Object.entries(o)) {
                if(!val || !val.isComplete()) {
                    problems.push(`"${toParse}" did not contain all the needed info for its ${data[key].full} component`);
                    continue;
                }
                convo.givenDetails[key] = val;
            }
        } catch(e) {
            let d = detObj.full.toLowerCase();
            if(typeof e !== 'string') problems.push(`"${toParse}" could not be understood as a ${d}`);
            else problems.push(e);
            continue;
        }
    }
    // check for complete format
    let awaitState; // none, needed, optional, full

    let form = formats[convo.activeFormat];
    if(!form) form = formats.main;
    let awaiting = {};

    if(Object.keys(convo.givenDetails).length === 0) awaitState = 'none';
    else awaitState = 'needed';

    for(let [pendKey, pendVal] of Object.entries(form.needed)) {
        if(!givenDetails[pendKey]) awaiting[pendKey] = {full: pendVal.full};
    }
    if(awaiting.length === 0) {
        awaitState = 'optional';
        for(let [pendKey, pendVal] of Object.entries(form.optional)) {
            if(!givenDetails[pendKey]) awaiting[pendKey] = {full: pendVal.full};
        }
    }
    if(awaiting.length === 0) awaitState = 'full';

    // build embed
    const embed = new g.Discord.RichEmbed().setColor(0x0000FF);

    function listText(obj, func) {
        let ret = '';
        for(let val of Object.values(obj)) {
            ret += + '- ' + func(val, format[key]) + '\n';
        }
        return ret;
    }

    // given
    if(awaitState === 'none') {
        let p = App.groups[convo.guild].prefix;
        embed.addField("I don't have any detail info", `Please add some details with "${p}[detail] [info]"`);
    } else {
        let awaitString = '- ' + awaiting.join('\n- ');
        let text = getText(convo.givenDetails, elem => `${elem.full}: ${elem}`);
        embed.addField("Here's what I have", text);
    }

    // awaiting
    let text = listText(awaiting, elem => `${elem.full}: a ${elem.type.camelToSpaces().toLowerCase()}`);
    if(awaitState === 'needed') {
        embed.addField(`Here's what I need`, text);
    } else if(awaitState === 'optional') {
        embed.addField('I have everything I need, but you can still give me optional details like', text);
    } else if(awaitState === 'full') {
        embed.addField('Those are all the details I can use', 'But you can still modify anything if you would like');
    }
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
            let lowKey = key.toLowerCase()
            if(typeof val === 'string') {
                if(val === '') res.data[key] = {type: key}; // time: ''
                else res.data[key] = {type: val}; // start: 'time'
            } else {
                res.data[lowKey] = val;
                for(let [key2, val2] of Object.entries(val)) {
                    if(key2 === 'keywords') {
                        for(let elem of val2) {
                            res.data[elem] = {alias: lowKey};
                        }
                        delete res.data[lowKey][key2];
                    }
                }
            }
            res.data[lowKey].full = key.camelToSpace();
        }
    }
    return res;
}