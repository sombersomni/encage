const User = {
    public: {
        name: 'default',
        id: 21240242,
        getName: function () {
            return this.name;
        },
        getAddress: function () {
            return this.private.info.address;
        }
    },
    private: {
        info: {}
    },
    static: {
        userCount: 0,
        allIDs: []
    },
    init: {
        upCount: function () {
            this.static.userCount++;
        },
        addIDS: function () {
            this.static.allIDs.push(this.name);
        }
    }
}

module.exports = User;