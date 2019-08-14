exports.msgBits = function(message) {
    return {
        guild: message.guild.id,
        channel: message.channel,
        user: message.author.id,
        content: message.content
    };
}

exports.getNested = function(key, obj, condition = () => true) {
    for([curKey, curVal] of Object.entries(obj)) {
        if(curKey === key) {
            return curVal;
        } else if(typeof curVal === 'object' && condition(curKey, curVal)) {
            let nest = getNested(key, curVal);
            if(nest) return nest;
        }
    }
}