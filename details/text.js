exports.parse = (content) => {
    return {
        val: content.trim(),

        standardForm
    };
}
var standardForm = function() {
    return this.val;
}