const ErrorProne = {
    name: [],
    public: {
        name: 'noname',
        personality: ['cool', 'sweet'],
        getName() {
            return this.public.name
        },
        setName(name) {
            this.public.name = name + this.private.lastName.slice(0,1);
            return;
        }
    },
    breakCode() {
        return 'blahblahblah';
    }
}

const ErrorChild = {
    name() {
        return true;
    },
    protected() {
        return true;
    },
    public: {
        getInfo() { return this.private.info }
    },
    private: {
        info: {}
    }
}

module.exports = { ErrorProne, ErrorChild };