function User() {
    this.name = "default";
    this.id = 21240242;
    this.private = {
        info: {}
    }
    this.static = {
        userCount: 0,
        allIDs: []
    }
    this.init = {
        upCount: function () {
            this.static.userCount++;
        },
        addIDS: function () {
            this.static.allIDs.push(this.name);
        }
    }
}
User.prototype = {
    getName: function () {
        return this.name;
    },
    getAddress: function () {
        return this.private.info.address;
    }
}

module.exports = User;