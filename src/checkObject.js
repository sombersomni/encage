function checkObject(obj) {
    let objArr = Object.keys(obj);
    if (objArr.length > 0) {
        objArr.forEach(key => {
            if (key === 'name' && (typeof obj[key] != 'string')) {
                throw new TypeError('name property for object must be a string');
            } else {
                const notObject = (!obj && (typeof obj[key] != 'object' || !(obj[key].constructor === Object)));
                if (notObject) {
                    throw new TypeError('Properties of object must be an object');
                }
            }
        });
    }
}

module.exports = checkObject;