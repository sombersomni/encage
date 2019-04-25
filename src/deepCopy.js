function deepCopy(value) {
    if(typeof value === 'object' && value.constructor === Object) {
        let newObject = {};
        for(let prop in value) {
            newObject[prop] = deepCopy(value[prop]);
        }
        return newObject;
    } else if(value instanceof Array) {
        const newArray = value.map(each => {
            return deepCopy(each);
        });
        return newArray;
    } else {
        return value;
    }

}

module.exports = deepCopy;