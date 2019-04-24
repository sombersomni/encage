function separateStatics(Root, _static) {
    for (let key in Root) {
        if (Root[key] instanceof Function) {
            _static.methods[key] = Root[key];
        } else {
            _static.variables[key] = Root[key];
        }
    }
    return _static;
}

module.exports = separateStatics;