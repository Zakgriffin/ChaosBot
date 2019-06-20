exports.parse = (content) => {
    let val;
    if(hasWords(content, ['free', 'yes', 'open'])) {
        val = 'Y';
    } else if(hasWords(content, ['busy', 'no'])) {
        val = 'N';
    } else if(hasWords(content, ['unsure', 'remove'])) {
        val = 'U';
    }
    return {
        val,

        standardForm
    };
}

function hasWords(str, list) {
    for(word of list) {
        if(str.includes(word)) {
            return true;
        }
    }
}

var standardForm = function() {
    switch(this.val) {
        case 'Y':
            return 'Free';
        case 'N':
            return 'Busy';
        case 'U':
            return 'Unsure';
    }
}