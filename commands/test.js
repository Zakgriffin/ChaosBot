const fs = require('fs');
exports.start = (global, message) => {
    message.channel.send('Entered test command');
}

exports.run = (global, details) => {
    details.message.channel.send('WORKS');

    // called when all details are inputed


    /*
    console.log('tested');

    let raw = fs.readFile('saved_data/testfile.json', (err, data) => {
        if (err) throw err;
        let obj = JSON.parse(data);
        obj.thing = 'test';
        fs.writeFile('saved_data/testfile.json', JSON.stringify(obj, null, 2), (err) => {
            if (err) throw err;
            console.log('DONE!')
        });
    })
    */
}

exports.neededDetails = {
    startTime: 'time'
}
exports.optionalDetails = {
    endTime: 'time'
}