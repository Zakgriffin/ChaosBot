exports.TextD = class {
    constructor(text) {
        this.val = text;
    }

    clone() {return new TextD(this.val);}
    isComplete() {return this.val != undefined;}
    standardForm() {return this.val;}
}

exports.parse = (content) => {
    return new TextD(content);
}