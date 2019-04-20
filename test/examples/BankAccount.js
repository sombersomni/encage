const BankAccount = {
    init: {
        addClient: function () {
            this.static.numOfAccounts++;
            this.static.clients.push(this.name);
        }
    },
    static: {
        numOfAccounts: 0,
        clients: [],
        printClients: function () {
            for (let i in this.static.clients) {
                console.log("Client " + i + " : " + this.static.clients[i]);
            }
        },
        deleteClients: function () {
            delete this.static.clients;
        }
    },
    public: {
        name: '',
        bankName: 'regions',
        info: {
            address: "333 Pickadrive Ln",
            coordinates: {
                longitude: "21 324",
                lattitude: "3423 32432"
            }
        },
        setSSN: function (ssn) {
            this.private.sensitiveData.ssn = ssn;
        },
        deleteClients: function () {
            delete this.static.clients;

        },
        getSSN: function () {
            return this.private.sensitiveData.ssn;
        },
        setPassword: function (password) {
            this.private.password = password;
        },
        deletePassword: function (password) {
            delete this.private.password;
        },
        getBalance: function () {
            return this.protected.balance;
        },
        withdraw: function (password, amount) {
            if (this.private.checkPassword(password)) {
                this.private.reduceBalance(amount);
                console.log("Account balance is : " + this.protected.balance)
                return amount;
            }
        },
        deposit: function (password, amount) {
            if (this.private.checkPassword(password)) {
                this.private.addBalance(amount);
                console.log("Account balance is : " + this.protected.balance)
            }
        },
    },
    private: {
        accountNumber: 0,
        password: "test",
        sensitiveData: {
            ssn: 324639342,
        },
        checkPassword: function (password) {
            return password === this.private.password
        },
        reduceBalance: function (amount) {
            this.protected.balance -= amount;
        },
        addBalance: function (amount) {
            this.protected.balance += amount;
        }
    },
    protected: {
        balance: 0,
    }
}

module.exports = BankAccount;