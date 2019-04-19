var chai = require('chai');
var encage = require('../src/index.js');
var expect = chai.expect;

let BankAccount;
let User;
describe('#encage', function () {
    it('throws error if encage takes any but Function or Object', function () {
        expect(encage.bind(null, "config")).to.throw(TypeError, 'Must use a constructor Function or Object');
        expect(encage.bind(null, 3)).to.throw(TypeError, 'Must use a constructor Function or Object');
        expect(encage.bind(null, true)).to.throw(TypeError, 'Must use a constructor Function or Object');
        expect(encage.bind(null, [])).to.throw(TypeError, 'Must use a constructor Function or Object');
    });
    describe('#create', function () {
        before(function () {
            BankAccount = {
                _init: {
                    addClient: function () {
                        this.static.numOfAccounts++;
                        this.static.clients.push(this.name);
                    }
                },
                static: {
                    numOfAccounts: 0,
                    clients: [],
                    printClients: function () {
                        for (let i in this.clients) {
                            console.log("Client " + i + " : " + this.clients[i]);
                        }
                    }
                },
                public: {
                    name: '',
                    bankName: 'regions',
                    setPassword: function (password) {
                        this.private.password = password;
                    },
                    getBalance: function () {
                        return this.private.balance;
                    },
                    widthdraw: function (password, amount) {
                        if (this.private.checkPassword(password)) {
                            this.private.reduceBalance(amount);
                            console.log("Account balance is : " + this.private.balance)
                            return amount;
                        }
                    },
                    deposit: function (password, amount) {
                        if (this.private.checkPassword(password)) {
                            this.private.addBalance(amount);
                            console.log("Account balance is : " + this.private.balance)
                        }
                    },
                },
                private: {
                    accountNumber: 0,
                    balance: 0,
                    password: "test",
                    checkPassword: function (password) {
                        return password === this.private.password
                    },
                    reduceBalance: function (amount) {
                        this.private.balance -= amount;
                    },
                    addBalance: function (amount) {
                        this.private.balance += amount;
                    }
                }
            }

        })
        it('keeps track of 5 instances using static variables', function () {
            const eBankAccount = encage(BankAccount);
            const account = eBankAccount.create({ name: 'Xavier', bankName: 'Regions', accountNumber: 10204343 });
            const account2 = eBankAccount.create({ name: 'Korey', bankName: 'Regions', accountNumber: 43462345 });
            const account3 = eBankAccount.create({ name: 'Martin', bankName: 'Bank Of America', accountNumber: 234323324 });
            const account4 = eBankAccount.create({ name: 'Gurjot', bankName: 'Credit Union', accountNumber: 212349021 });
            const account5 = eBankAccount.create({ name: 'Scarlett', bankName: 'Chase', accountNumber: 23423534 });
            expect(eBankAccount.clients).to.be.an.instanceof(Array);
            expect(eBankAccount.clients.length).to.equal(5);
            expect(eBankAccount.numOfAccounts).to.equal(5);

        });
        it('can change private variables while keeping them unreachable', function () {
            const eBankAccount = encage(BankAccount);
            const account = eBankAccount.create({ name: 'Xavier', bankName: 'Regions', accountNumber: 10204343 });
            expect(account.balance).to.be.undefined;
            expect(account.password).to.be.undefined;
            expect(account.getBalance()).to.equal(0);
            account.setPassword("marvel");
            account.deposit("marvel", 1000);
            expect(account.getBalance()).to.equal(1000);
        });
        it('can use static functions', function () {
            const eBankAccount = encage(BankAccount);
            const account = eBankAccount.create({ name: 'Xavier', bankName: 'Regions', accountNumber: 10204343 });
            const account2 = eBankAccount.create({ name: 'Korey', bankName: 'Regions', accountNumber: 43462345 });
            expect(eBankAccount.printClients).to.not.throw();
            expect(eBankAccount.printClients).to.be.instanceOf(Function);

        });
        it('can run create with no arguments passed', function () {
            const eBankAccount = encage(BankAccount);
            const account = eBankAccount.create();
            expect(account.name).to.equal('');
        })
        beforeEach(function () {
            User = function () {
                this.name = "Xavier";
                this.id = 21240242;
                this.private = {
                    info: {}
                }
                this.static = {
                    userCount: 0,
                    allIDs: []
                }
                this._init = {
                    upCount: function () {
                        this.static.userCount++;
                    },
                    addIDS: () => {
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
        });
        it('can take function constructors as a parameter', function () {
            const eUser = encage(User);
            const user1 = eUser.create({
                name: "Xavier",
                info: {
                    address: "222 Mahogany Lane",
                    phone: "1025552444",
                }
            });
            expect(user1.getName()).to.equal("Xavier");
            expect(user1.getAddress()).to.equal("222 Mahogany Lane");
            expect(eUser.userCount).to.equal(1);
            expect(eUser.allIDs.length).to.equal(1);
            expect(eUser.allIDs[0]).to.equal("Xavier");
        });
        beforeEach(function () { 
            
            
        });

    });
});