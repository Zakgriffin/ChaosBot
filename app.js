const Discord = require('./services/discordHandler');
const Calendar = require('./services/calendarHandler');
const Database = require('./services/databaseHandler');

const {filesToObject} = require('./functions/fileSystem');

const events = filesToObject('./events', true);

exports.finishSetup = function() {
    Discord.finishSetup();
}

exports.trigger = function(event, ...args) {
    events[event].onEvent.apply(null, args);
}

exports.events = events;