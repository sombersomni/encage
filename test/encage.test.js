var chai = require('chai');
var encage = require('../src/index.js');
var expect = chai.expect;

let eBankAccount;
describe('#encage', function () {
    it('throws error if encage takes any but Function or Object', function () {
        expect(encage.bind(null, "config")).to.throw(TypeError, 'Must use a constructor Function or Object');
        expect(encage.bind(null, 3)).to.throw(TypeError, 'Must use a constructor Function or Object');
        expect(encage.bind(null, true)).to.throw(TypeError, 'Must use a constructor Function or Object');
        expect(encage.bind(null, [])).to.throw(TypeError, 'Must use a constructor Function or Object');
    });
    describe('#create', function () {
        before(function () {
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
            eBankAccount = encage(BankAccount);
        })
        it('keeps track of 5 instances using static variables', function () {
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

            const account = eBankAccount.create({ name: 'Reggie', bankName: 'Regions', accountNumber: 10204343 });
            expect(account.balance).to.be.undefined;
            expect(account.password).to.be.undefined;
            expect(account.getBalance()).to.equal(0);
            account.setPassword("marvel");
            account.deposit("marvel", 1000);
            expect(account.getBalance()).to.equal(1000);
        });
        it('can use static functions', function () {
            const account = eBankAccount.create({ name: 'Shazam', bankName: 'Regions', accountNumber: 10204343 });
            const account2 = eBankAccount.create({ name: 'Spiderman', bankName: 'Regions', accountNumber: 43462345 });
            expect(eBankAccount.printClients).to.not.throw();
            expect(eBankAccount.printClients).to.be.instanceOf(Function);

        });
        it('can run create with no arguments passed', function () {
            const account = eBankAccount.create();
            expect(account.name).to.equal('');
        })
        it('can take function constructors as a parameter', function () {
            function User() {
                this.name = "Xavier";
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
            const eUser = encage(User);
            const user1 = eUser.create({
                name: "Xavier",
                info: {
                    address: "222 Mahogany Lane",
                    phone: "1025552444",
                }
            });
            expect(user1).to.be.instanceOf(User);
            expect(user1.getName()).to.equal("Xavier");
            expect(user1.getAddress()).to.equal("222 Mahogany Lane");
            expect(eUser.userCount).to.equal(1);
            expect(eUser.allIDs.length).to.equal(1);
            expect(eUser.allIDs[0]).to.equal("Xavier");
        });
        it("can create singleton objects for one instance", function () {
            function Earth() {
                this.population = 21424214;
                this.size = 35353035;
            }
            Earth.prototype = {
                description() {
                    return "Big blue ball floating in space"
                }
            }
            const options = { singleton: true };
            const eEarth = encage(Earth, options);
            const earth = eEarth.create();
            expect(earth.description()).to.equal("Big blue ball floating in space");
            expect(earth).to.be.instanceOf(Earth);
            console.log(earth);
            expect(earth).to.be.an('object');
            const earth2 = eEarth.create();
            expect(earth2).to.be.null;
        })

    });
    describe('#extend', function () {
        it('allow one object to inherit functionality from another without passing private', function () {
            function Shape() {
                this.width = 10;
                this.height = 10;
                this.name = '';
                this.sides = 0;
                this.init = {
                    addShape: function () {
                        this.static.numOfShapes++;
                        this.static.shapes.push(this._instance);
                    }
                }
                this.static = {
                    numOfShapes: 0,
                    shapes: []
                }
                this.private = {
                    position: { x: 0, y: 0 }
                }
                this.protected = {
                    checkCollision: function () {
                        return 1;
                    }
                }
            }

            function Square() {
                this.sides = 4;
                this.flat = true;
            }
            Square.prototype = {
                area() {
                    return this.length * this.width;
                }
            }
            const eShape = encage(Shape);
            const eSquare = eShape.extend(Square);
            const square = eSquare.create({ name: "box", width: 20, height: 20, sides: 4 });
            expect(square.position).to.be.undefined;
        })
    });
});