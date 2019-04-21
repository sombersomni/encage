var chai = require('chai');
var encage = require('../src/index.js');
var expect = chai.expect;

//test objects and constructors
const BankAccount = require('./examples/BankAccount');
const { Shape, Square, Circle, Ellipse } = require('./examples/Shapes');
const { Character, Player, Slime, Enemy } = require('./examples/Game');
const User = require('./examples/User');
const Earth = require('./examples/Earth');

let eBankAccount;
describe('#encage', function () {
    it('throws error if encage takes any but Function or Object', function () {
        expect(encage.bind(null, "config")).to.throw(TypeError, 'Must use a Object as an argument for create');
        expect(encage.bind(null, 3)).to.throw(TypeError, 'Must use a Object as an argument for create');
        expect(encage.bind(null, true)).to.throw(TypeError, 'Must use a Object as an argument for create');
        expect(encage.bind(null, [])).to.throw(TypeError, 'Must use a Object as an argument for create');
        expect(encage.bind(null, function Jedi() { })).to.throw(TypeError, 'Must use a Object as an argument for create');
    });
    describe('#create', function () {
        before(function () {
            eBankAccount = encage(BankAccount);
        })
        it('keeps track of 5 instances using static variables', function () {
            eBankAccount.create({ name: 'Xavier', bankName: 'Regions', accountNumber: 10204343 });
            eBankAccount.create({ name: 'Korey', bankName: 'Regions', accountNumber: 43462345 });
            eBankAccount.create({ name: 'Martin', bankName: 'Bank Of America', accountNumber: 234323324 });
            eBankAccount.create({ name: 'Gurjot', bankName: 'Credit Union', accountNumber: 212349021 });
            eBankAccount.create({ name: 'Scarlett', bankName: 'Chase', accountNumber: 23423534 });
            expect(eBankAccount.static.clients).to.be.an.instanceof(Array);
            expect(eBankAccount.static.clients.length).to.equal(5);
            expect(eBankAccount.static.numOfAccounts).to.equal(5);

        });
        it('doesnt allow values to be cloned across instances', function () {
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
        it('can create with an empty object', function () {
            const Test = {};
            const eTest = encage(Test);
            expect(eTest.static).to.be.empty;
            const test = eTest.create({});
            expect(test).to.be.empty;
        })
        it("can create singleton objects for one instance", function () {
            const options = { singleton: true };
            const eEarth = encage(Earth, options);
            const earth = eEarth.create();
            expect(earth.description()).to.equal("Big blue ball floating in space");
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
            expect(square.id).to.be.undefined;
            expect(square.hit(square2)).to.equal(1);

        });

        it('can use objects in inheritance', function () {
            const eCharacter = encage(Character);
            const eEnemy = eCharacter.extend(Enemy);
            const eSlime = eEnemy.extend(Slime);
            const slime = eSlime.create({ name: "silver slime", color: "silver", health: 40, info: { description: "slimer moves slow " } });
            console.log(slime);
            console.log(eCharacter);
            console.log(eEnemy);
            console.log(eSlime);
        });
        it('lets user choose specific init functions to be passed to inherited', function () {
            const eShape = encage(Shape);
            console.log(eShape);
            const eSquare = eShape.extend(Square, { allowInits: ["countShapes"] });
            console.log(eShape)
            eSquare.create({});
            const eCircle = eShape.extend(Circle, { allowInits: false });
            eCircle.create({});
            expect(eShape.static.numOfShapes).to.equal(1);
            expect(eSquare.static.numOfSquares).to.equal(1);
            eShape.static.numOfSquares++;
            console.log(eShape);
        });
    });
});