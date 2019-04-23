const User = {
    public: {
        name: 'default',
        id: 21240242,
        setName: function (name) {
            this.public.name = name;
        },
        getName: function () {
            return this.public.name;
        },
        setAddress: function(address) {
            this.info.address = address;
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