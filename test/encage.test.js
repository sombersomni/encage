var chai = require('chai');
var encage = require('../src/index.js');
var expect = chai.expect;

//test objects and constructors
const BankAccount = require('./examples/BankAccount');
const {Shape, Square, Circle} = require('./examples/Shapes');
const User = require('./examples/User');
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
            eBankAccount = encage(BankAccount);
        })
        it('keeps track of 5 instances using static variables', function () {
            const account = eBankAccount.create({ name: 'Xavier', bankName: 'Regions', accountNumber: 10204343 });
            const account2 = eBankAccount.create({ name: 'Korey', bankName: 'Regions', accountNumber: 43462345 });
            const account3 = eBankAccount.create({ name: 'Martin', bankName: 'Bank Of America', accountNumber: 234323324 });
            const account4 = eBankAccount.create({ name: 'Gurjot', bankName: 'Credit Union', accountNumber: 212349021 });
            const account5 = eBankAccount.create({ name: 'Scarlett', bankName: 'Chase', accountNumber: 23423534 });
            expect(eBankAccount.static.clients).to.be.an.instanceof(Array);
            expect(eBankAccount.static.clients.length).to.equal(5);
            expect(eBankAccount.static.numOfAccounts).to.equal(5);

        });
        it('doesnt all values to be cloned across instances', function () {
            const account = eBankAccount.create({ name: 'Beaver', bankName: 'Bank Of America', accountNumber: 10204343, password: "fiveonit" });
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
            expect(account.private).to.be.undefined;
            expect(account.password).to.be.undefined;
            expect(account.getBalance()).to.equal(0);
            account.setPassword("marvel");
            account.deposit("marvel", 1000);
            expect(account.getBalance()).to.equal(1000);
        });
        it('can use static functions', function () {
            const account = eBankAccount.create({ name: 'Shazam', bankName: 'Regions', accountNumber: 10204343 });
            const account2 = eBankAccount.create({ name: 'Spiderman', bankName: 'Regions', accountNumber: 43462345 });
            expect(eBankAccount.static.printClients).to.not.throw();
            expect(eBankAccount.static.printClients).to.be.instanceOf(Function);

        });
        it('can run create with no arguments passed', function () {
            const account = eBankAccount.create();
            expect(account.name).to.equal('');
        })
        it('can create with an empty constructor and object', function () {
            function Test() { }
            const eTest = encage(Test);
            expect(eTest.static).to.be.empty;
            const test1 = eTest.create({});
            expect(test1).to.be.instanceOf(Test);
            expect(test1).to.be.empty;
            const Test2 = {};
            const eTest2 = encage(Test2);
            expect(eTest2.static).to.be.empty;
            const test2 = eTest2.create({});
            expect(test2).to.be.empty;
        })
        it('can take function constructors as a parameter', function () {
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
            expect(eUser.static.userCount).to.equal(1);
            expect(eUser.static.allIDs.length).to.equal(1);
            expect(eUser.static.allIDs[0]).to.equal("Xavier");
        });
        it('can create instances that can be referenced back to initial Class', function () {
            const eUser = encage(User);
            const user1 = eUser.create({ name: "Homer" });
            const user2 = eUser.create({ name: "Lisa" });
            const user3 = eUser.create({ name: "Apu" });
            const user4 = eUser.create({ name: "Moe" });
            expect(user1).to.be.instanceOf(User);
            expect(user2).to.be.instanceOf(User);
            expect(user3).to.be.instanceOf(User);
            expect(user4).to.be.instanceOf(User);
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
            account.deposit = function () { return _protected.balance; }
            expect(account.deposit).to.throw(ReferenceError);
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
        it('cant change statics from within public, must use a static function', function () {
            const account = eBankAccount.create({ name: "Hermione", bankName: "Gringots", password: "Hufflepuff" });
            account.deleteClients();
            expect(delete account.name).to.be.true;
            expect(eBankAccount.static.clients.length).to.equal(eBankAccount.static.numOfAccounts);
            eBankAccount.deleteClients();
            expect(eBankAccount.static.clients).to.be.undefined;
        });

    });

    describe('#extend', function () {
        it('allow one object to inherit functionality from another without passing private', function () {
            const eShape = encage(Shape);
            const eSquare = eShape.extend(Square);
            const square = eSquare.create({ name: "first box" });
            const square2 = eSquare.create({ name: "small box", width: 5, height: 5, sides: 4, id: 342343243 });
            expect(eShape.static.numOfShapes).to.equal(2);
            expect(eSquare.static.numOfSquares).to.equal(2);
            expect(square.area()).to.equal(225);
            expect(square).to.be.instanceOf(Square);
            expect(square.id).to.be.undefined;
            expect(square.hit(square2)).to.equal(1);

        });
        it('keeps instances of base class tied to istanceof Base', function () {
            const eShape = encage(Shape);
            const eCircle = eShape.extend(Circle);
            const circle = eCircle.create();
            const circle2 = eCircle.create();
            const circle3 = eCircle.create();
            expect(circle).to.be.instanceOf(Circle);
            expect(circle2).to.be.instanceOf(Circle);
            expect(circle3).to.be.instanceOf(Circle);
        });
        // it('lets user choose specific init functions to be passed to inherited', function () {
        //     const eShape = encage(Shape);
        //     const eSquare = eShape.extend(Square, { allowInits: ["countShapes"] });
        //     const square = eSquare.create({ name: "red square", width: 2, height: 2, sides: 4 });
        //     const square2 = eSquare.create({ name: "red square", width: 2, height: 2, sides: 4 });
        //     console.log(eSquare);
        // });
    });
});