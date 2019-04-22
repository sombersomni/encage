function separateStatics(Root, static) {
    for (let key in Root) {
        if (Root[key] instanceof Function) {
            static.methods[key] = Root[key];
        } else {
            static.variables[key] = Root[key];
        }
    }
    return static;
}

module.exports = separateStatics;