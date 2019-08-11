const Discord = require('./services/discordHandler');
const Calendar = require('./services/calendarHandler');
const {filesToObject} = require('./functions/fileSystem');

const events = filesToObject('./events', true);
var groups = filesToObject('./saved_data/group');

exports.finishSetup = function() {
    Discord.finishSetup();
}

exports.trigger = function(event, ...args) {
    events[event].onEvent.apply(null, args);
}

exports.events = events;
exports.groups = groups;