function checkObject(obj) {
    const objArr = Object.keys(obj);
    if (objArr.length > 0) {
        objArr.forEach(key => {
            const notObject = (typeof obj[key] !== 'object' || obj[key].constructor !== Object);
            if (key === 'name') {
                if (typeof obj[key] != 'string') {
                    throw new TypeError('name property for object must be a string');
                }
            } else if (key === 'public' || key === 'private' || key === 'protected') {
                if (notObject) {
                    throw new TypeError(`You must use an object when creating ${key} property`);
                }
            } else if(key === 'static' || key === 'init') {
                if (notObject && !(obj[key] instanceof Array)) {
                    throw new TypeError(`You must use an object when creating ${key} property`);
                }
            } else {
                throw new TypeError(`Your property ${key} should probably be in the public, private, protected, static or init property`)
            }
        });
    }
}

module.exports = checkObject;