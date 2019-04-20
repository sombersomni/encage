function deepAssign(obj) {
    // Retrieve the property names defined on object
    var propNames = Object.getOwnPropertyNames(obj);
    // Freeze properties before freezing self
    for (let name of propNames) {
      const value = obj[name];
      obj[name] = value && value.constructor && typeof value === "object" && value.constructor === Object ? 
        JSON.parse(JSON.stringify(value)) : value;
    }
    return Object.assign(obj);
  }

module.exports = deepAssign;