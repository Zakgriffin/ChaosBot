class StatusD {
    constructor(status) {
        this.val = status;
    }

    clone() {return new StatusD(this.val);}
    isComplete() {return ['Y', 'N', 'U'].indexOf(this.val) != -1;}
    standardForm() {
        switch(this.val) {
            case 'Y':
                return 'Free';
            case 'N':
                return 'Busy';
            case 'U':
                return 'Unsure';
        }
    }
}
exports.StatusD = StatusD;

exports.parse = (content) => {
    let status;
    if(content.containsWords(['free', 'yes', 'open'])) {
        status = 'Y';
    } else if(content.containsWords(['busy', 'no'])) {
        status = 'N';
    } else if(content.containsWords(['unsure', 'remove'])) {
        status = 'U';
    }

    return new StatusD(status);
}

String.prototype.containsWords = function(list) {
    for(word of list) {
        if(this.includes(word)) return true;
    }
}