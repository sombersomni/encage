function separateStatics(Root, _static) {
    for (let key in Root) {
        if ((Root[key] instanceof Function)) {
            if (key === 'create' && key === 'extend') {
                throw new Error("Try not to overwrite functions supplied by encage like create or extend. Use different method names instead");
            } else {
                _static.methods[key] = Root[key];
            }
        } else {
            _static.variables[key] = Root[key];
        }
    }
    return _static;
}

module.exports = separateStatics;