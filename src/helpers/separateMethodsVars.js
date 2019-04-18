function separateMethodsVars(obj, isStatic = false) {
    let separatedObj = { methods: {}, variables: {} };
    for (let attr in obj) {
        if (obj[attr] instanceof Function) {
            if (attr == 'create' && isStatic) {
                throw new Error("Try using a different method name besides create in your static config. Can't overrid encage's create method")
            } else {
                separatedObj.methods[attr] = obj[attr];
            }
        } else {
            //create variables
            separatedObj.variables[attr] = {
                value: obj[attr],
                writeable: true,
                enumerable: true
            }
        }
    }
    return separatedObj;
}

module.exports = separateMethodsVars;
