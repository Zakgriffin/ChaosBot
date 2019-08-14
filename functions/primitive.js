exports.saveUserData = function() {
    let data = JSON.stringify(g.userData, null, 2);
    fs.writeFile('./saved_data/user_data.json', data, (err) => {
        if(err) throw err;
    });
}

String.prototype.capitalize = function() {
    return this[0].toUpperCase() + this.slice(1);
}

exports.map = function(value, start1, stop1, start2, stop2) {
    if(start1 == stop2) return start1;
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

String.prototype.camelToSpace = function() {
    str = this[0].toUpperCase() + this.substring(1);
    return str.split(/(?=[A-Z])/).join(' ');
}