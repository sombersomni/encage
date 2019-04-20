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
                    info: {
                        address: "333 Pickadrive Ln",
                        coordinates: {
                            longitude: "21 324",
                            lattitude: "3423 32432"
                        }
                    },
                    setSSN: function (ssn) {
                        console.log(this.private.sensitiveData.ssn)
                        this.private.sensitiveData.ssn = ssn;
                        console.log(this.private.sensitiveData.ssn)
                    },
                    getSSN: function () {
                        return this.private.sensitiveData.ssn;
                    },
                    setPassword: function (password) {
                        this.private.password = password;
                    },
                    getBalance: function () {
                        return this.private.balance;
                    },
                    withdraw: function (password, amount) {
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
                    sensitiveData: {
                        ssn: 324639342,
                    },
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
        it('doesnt all values to be cloned across instances', function () {
            const account = eBankAccount.create({ name: 'Beaver', bankName: 'Bank Of America', accountNumber: 10204343, password: "fiveonit"});
            const account2 = eBankAccount.create();
            account.setSSN(333344433);
            account2.setSSN(555555555);
            account.info.address = "4888 Fake Dr";
            expect(account.getSSN()).to.equal(333344433)
            expect(account2.getSSN()).to.equal(555555555)
            expect(account.info.address).to.equal("4888 Fake Dr");
            expect(account2.info.address).to.equal("333 Pickadrive Ln");
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
            expect(earth).to.be.an('object');
            const earth2 = eEarth.create();
            expect(earth2).to.be.null;
        });
        it('can allow for overwritten functions but only for public vars', function () {
            const account = eBankAccount.create({ name: "Melissa", bankName: "Chase", password: "password" });
            account.deposit("password", 100);
            account.withdraw("password", 10);
            expect(account.getBalance()).to.equal(90);
            account.deposit = function () { return _private.balance; }
            expect(account.deposit).to.throw(ReferenceError, "_private is not defined");
            account.withdraw = function () { return this.static; }
            expect(account.withdraw()).to.be.undefined;
            account.getName = function () { return "My name is " + this.name }
            expect(account.getName()).to.equal("My name is Melissa");
        });
        it('allows all instances to be sealed so no other properties can be added but changes can be made to objects', function () {
            const account = eBankAccount.create({ name: "Harry", bankName: "Gringots", password: "Griffindor" }, { sealed: true });
            expect(Object.isSealed(account)).to.be.true;
            expect(Object.isExtensible(account)).to.be.false;
            account.location = "UK";
            expect(account.location).to.be.undefined;
            expect(account.name).to.equal("Harry");
            account.name = "Ron";
            account.info.address = "blah blah";
            account.info.coordinates.longitude = '35 67';


        });
        it('allows all instances to be frozen so no changes can be made', function () {
            const account = eBankAccount.create({ name: "Hermione", bankName: "Gringots", password: "Hufflepuff" }, { freeze: true });
            expect(Object.isFrozen(account)).to.be.true;
            expect(Object.isExtensible(account)).to.be.false;
            function deleteName() {
                "use strict";
                delete account.name
            };
            expect(deleteName).to.throw(TypeError);
            expect(account.name).to.equal("Hermione");
            account.name = "Juno";
            expect(account.name).to.equal("Hermione");
            expect(Object.isFrozen(account.info)).to.be.true;

        });
        it('cant change statics from within public, must use a static function', function() {

        });
        it('can keep track of all instances in order of creation', function () {
            const Animal = {
                public: {
                    name: 'n/a',
                    type: 'n/a',
                },
                speed: {}

            }
        })

    });
    describe('#extend', function () {
        it('allow one object to inherit functionality from another without passing private', function () {
            function Shape() {
                this.width = 10;
                this.height = 10;
                this.name = '';
                this.sides = 0;
                this.position = { x: 0, y: 0 };
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
                    id: 201232131
                }
                this.protected = {
                    checkCollision: function (shape) {
                        if (shape instanceof Square) {
                            if (this.position.x === shape.position.x)
                                return 1;
                            else return 2;
                        } else {
                            return 0;
                        }
                    }
                }
            }

            function Square() {
                this.sides = 4;
                this.flat = true;
            }
            Square.prototype = {
                area() {
                    return this.height * this.width;
                },
                hit(shape) {
                    return this.protected.checkCollision(shape);
                }
            }
            const eShape = encage(Shape);
            const eSquare = eShape.extend(Square);
            const square = eSquare.create({ name: "box", width: 20, height: 20, sides: 4 });
            const square2 = eSquare.create({ name: "box", width: 5, height: 5, sides: 4, id: 342343243 });
            expect(square.area()).to.equal(400);
            expect(square).to.be.instanceOf(Square);
            expect(square.hit(square2)).to.equal(1);
            expect(square.id).to.be.undefined;
        })
    });
});