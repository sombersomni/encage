function checkInit(Root) {
    for (let key in Root) {
        if (!(Root[key] instanceof Function)) {
            throw new TypeError("init properties must be a function.");
        }
    }
}
module.exports = checkInit;