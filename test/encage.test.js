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
        expect(encage.bind(null, "config")).to.throw(TypeError, 'Must use a Object as an argument');
        expect(encage.bind(null, 3)).to.throw(TypeError, 'Must use a Object as an argument');
        expect(encage.bind(null, true)).to.throw(TypeError, 'Must use a Object as an argument');
        expect(encage.bind(null, [])).to.throw(TypeError, 'Must use a Object as an argument');
        expect(encage.bind(null, function Jedi() { })).to.throw(TypeError, 'Must use a Object as an argument');
    });
    it('allows user to name their object for referencing later', function () {
        const eUser = encage(User);
        expect(eUser.name).to.equal('encageId0');
        const User2 = {
            name: "User2",
            public: {
                username: "n/a",
            }
        }
        const eUser2 = encage(User2);
        expect(eUser2.name).to.equal('User2');

    });
    it('can create empty encage object', function() {
        const eObject = encage({});
        expect(eObject.static).to.be.empty;
    });
    it('can allow tracking of all instances', function () {
        const eUser = encage(User, { tracking : true });
        const user = eUser.create({ name: "sombersomni" });
        const user2 = eUser.create({ name: "beauty" });
        expect(user.name).to.equal(eUser.static.instances[user.instanceID].name);
        expect(user2.name).to.equal(eUser.static.instances[user2.instanceID].name);
        //stops tracking
        eUser.toggle('tracking');
        const user3 = eUser.create({ name: "hulk" });
        expect(eUser.static.instances[user3.instanceID]).to.be.undefined;
        //continues tracking
        eUser.toggle('tracking');
        const user4 = eUser.create({ name: "babyface" });
        expect(user4.name).to.equal(eUser.static.instances[user4.instanceID].name);
        
    });
    it("can create singleton objects for one instance", function () {
        const options = { singleton: true };
        const eEarth = encage(Earth, options);
        const earth = eEarth.create();
        expect(earth.description()).to.equal("Big blue ball floating in space");
        expect(earth).to.be.an('object');
        const earth2 = eEarth.create();
        expect(earth2).to.be.null;
    });
    it('init properties must be a function', function () {
        const Test = {
            init: {
                fakeFunc() {
                    return true;
                },
                name: 'Single',   
            },
            public: {
                name: 'Duplicate'
            }
        }
        const eUser = encage(User);
        expect(encage.bind(null, Test)).to.throw(TypeError, "init properties must be a function");
        expect(eUser.extend.bind(eUser, Test)).to.throw(TypeError, "init properties must be a function");

    });
    describe('#create', function () {
        before(function () {
            eBankAccount = encage(BankAccount);
        })
        afterEach(function () {
            eBankAccount.static.deleteClients();
        })
        it('takes only an object as an argument or nothing', function () {
            expect(eBankAccount.create({})).to.be.an('object');
            expect(eBankAccount.create()).to.be.an('object');
            expect(eBankAccount.create(null)).to.be.an('object');
            expect(eBankAccount.create(undefined)).to.be.an('object');
            expect(eBankAccount.create.bind(eBankAccount, 5)).to.throw(TypeError, 'Argument must be an object for create');
            expect(eBankAccount.create.bind(eBankAccount, function Test() { })).to.throw(TypeError, 'Argument must be an object for create');
            expect(eBankAccount.create.bind(eBankAccount, false)).to.throw(TypeError, 'Argument must be an object for create');
            expect(eBankAccount.create.bind(eBankAccount, [])).to.throw(TypeError, 'Argument must be an object for create');
        });
        it('checks if options are an object or nothing at all', function () {
            expect(eBankAccount.create.bind(eBankAccount, null, 1)).to.throw(TypeError, 'You need to use an object for your options');
            expect(eBankAccount.create.bind(eBankAccount, null, false)).to.throw(TypeError, 'You need to use an object for your options');
            expect(eBankAccount.create.bind(eBankAccount, null, function Test() { })).to.throw(TypeError, 'You need to use an object for your options');
            expect(eBankAccount.create.bind(eBankAccount, null, [])).to.throw(TypeError, 'You need to use an object for your options');
            expect(eBankAccount.create.bind(eBankAccount, null, new Set())).to.throw(TypeError, 'You need to use an object for your options');

        });
        it('checks if properties in object are objects themselves', function() {
            expect(eBankAccount.extend.bind(eBankAccount, { public: 3 })).to.throw(TypeError, 'You must use an object when creating public');
            expect(eBankAccount.extend.bind(eBankAccount, { private: [] })).to.throw(TypeError, 'You must use an object when creating private');
            expect(eBankAccount.extend.bind(eBankAccount, { init: false })).to.throw(TypeError, 'You must use an object when creating init');
            expect(eBankAccount.extend.bind(eBankAccount, { static: function () {} })).to.throw(TypeError, 'You must use an object when creating static');
        });
        it('create or extend funcitons wont overide existing functions', function () {
            const Test = {
                static: { create: function () {} }
            } 
            const Test2 = {
                init: {
                    useExtend() { this.static.extend();}
                },
                static: { extend: function () { console.log("extend is working"); } }
            }
            const eTest = encage(Test);
            let test = eTest.create();
            expect(test).to.be.empty;
            const eTest2 = encage(Test2);
            let test2 = eTest2.create();
            expect(test2).to.be.empty;
        });
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
            eBankAccount.create({ name: 'Shazam', bankName: 'Regions', accountNumber: 10204343 });
            eBankAccount.create({ name: 'Spiderman', bankName: 'Regions', accountNumber: 43462345 });
            expect(eBankAccount.static.printClients).to.not.throw();
            expect(eBankAccount.static.printClients).to.be.instanceOf(Function);

        });
        it('can run create with no arguments passed', function () {
            const account = eBankAccount.create();
            expect(account.name).to.equal('');
        })
        it('discards duplicate property names in objects', function() {
            const User = { public: { name: 'player' }, private: { name: 'secret' } }
            const eUser = encage(User);
            const user = eUser.create({ name: 'Scarlo' });
            expect(user.name).to.equal('Scarlo');
            //INSTEAD DO THIS
            const User2 = { public: { username: 'player' }, private: { name: 'secret' } }
            const eUser2 = encage(User2);
            const user2 = eUser2.create({ username: 'Scarlo', name: 'Scarlett Johansson' });
            expect(user2.name).to.be.undefined;
            expect(user2.private).to.be.undefined;
            expect(user2.username).to.equal('Scarlo');
        });
        it('can create with an empty object', function () {
            const Test = {};
            const eTest = encage(Test);
            expect(eTest.static).to.be.empty;
            expect(eTest).to.be.an('object');
            const test = eTest.create({});
            expect(test).to.be.an('object');
        })
        it('ignores properties that are not described in Base Object', function() {
            const Artist = { 
                public: { name: '', genre: '' }, 
                private: { bonusContent: {}, address: '' },
                protected: { songs: [] }
            }
            const eArtist = encage(Artist);
            const artist = eArtist.create({ id: 21334, name: "Tame Impala", albums: [], tours: [], songs: [] });
            expect(artist).to.deep.equal({ name: "Tame Impala", genre: '' });
        })
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
            expect(account.name).to.equal("Ron");
            account.setAddress('Muggleland');
            account.newInfo = { place: "space" };
            expect(account.newInfo).to.be.undefined;
            //objects are mutable still, so if you have an object it can be added to.
            expect(account.info.address).to.equal('Muggleland');
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
            account.setBankName('Snerkins');
            expect(account.bankName).to.equal("Gringots");
            account.getBalance = function () { return true };
            expect(account.getBalance()).to.equal(0);
            expect(Object.isFrozen(account.info)).to.be.true;

        });
        it('can change statics out in public', function () {
            const account = eBankAccount.create({ name: "Hermione", bankName: "Gringots", password: "Hufflepuff" });
            expect(delete account.name).to.be.true;
            expect(eBankAccount.static.clients.length).to.equal(eBankAccount.static.numOfAccounts);
            delete eBankAccount.static.clients;
            expect(eBankAccount.static.clients).to.be.undefined;
        });
        it('cant make changes to encage object name', function () {
            const eCharacter = encage(Character);
            expect(eCharacter.name).to.equal("Character");
            eCharacter.name = "test";
            expect(eCharacter.name).to.equal("Character");
        });

    });
    describe('#extend', function () {
        it('can only take an onbject or nothing as argument', function () {
            // expect(eBankAccount.extend.bind(eBankAccount, {})).to.be.an('object');
            expect(eBankAccount.extend({})).to.be.an('object');
            expect(eBankAccount.extend).to.throw(TypeError, 'Argument must be an object for extend');
            expect(eBankAccount.extend.bind(eBankAccount, function Test() { })).to.throw(TypeError, 'Argument must be an object for extend');
            expect(eBankAccount.extend.bind(eBankAccount, 5)).to.throw(TypeError, 'Argument must be an object for extend');
            expect(eBankAccount.extend.bind(eBankAccount, [])).to.throw(TypeError, 'Argument must be an object for extend');
        });
        it('can only take an object for configuration and nothing else', function () {
            expect(eBankAccount.extend({}, {})).to.be.an('object');
            expect(eBankAccount.extend.bind(eBankAccount, {}, 3)).to.throw(TypeError, 'You need to use an object for your options');
            expect(eBankAccount.extend.bind(eBankAccount, {}, function Test() { })).to.throw(TypeError, 'You need to use an object for your options');
            expect(eBankAccount.extend.bind(eBankAccount, {}, 5)).to.throw(TypeError, 'You need to use an object for your options');
            expect(eBankAccount.extend.bind(eBankAccount, {}, [])).to.throw(TypeError, 'You need to use an object for your options');
        });
        it('checks if properties in object are objects themselves', function() {
            expect(eBankAccount.extend.bind(eBankAccount, { public: 3 })).to.throw(TypeError, 'You must use an object when creating public');
            expect(eBankAccount.extend.bind(eBankAccount, { private: [] })).to.throw(TypeError, 'You must use an object when creating private');
            expect(eBankAccount.extend.bind(eBankAccount, { init: false })).to.throw(TypeError, 'You must use an object when creating init');
            expect(eBankAccount.extend.bind(eBankAccount, { static: function () {} })).to.throw(TypeError, 'You must use an object when creating static');
        });
        it('allow one object to inherit functionality from another without passing private', function () {
            const eShape = encage(Shape);
            const eSquare = eShape.extend(Square);
            const square = eSquare.create({ name: "first box" });
            const square2 = eSquare.create({ name: "small box", width: 5, height: 5, sides: 4, id: 342343243 });
            expect(eShape.static.numOfShapes).to.equal(2);
            expect(eSquare.static.numOfSquares).to.equal(2);
            expect(eShape.static.shapes.length).to.equal(2);
            expect(square.area()).to.equal(225);
            expect(square.id).to.be.undefined;
            expect(square.hit(square2)).to.equal(1);
        });

        it('lets user choose specific init functions to be passed to inherited', function () {
            const eShape = encage(Shape);
            eShape.create({ name: "shape" });
            expect(eShape.static.numOfShapes).to.equal(1);
            expect(eShape.static.shapes[0].name).to.equal("shape");
            const eSquare = eShape.extend(Square, { allowInits: ["countShapes"] });
            eSquare.create({});
            const eCircle = eShape.extend(Circle, { allowInits: false });
            eCircle.create({});
            expect(eShape.static.numOfShapes).to.equal(2);
            expect(eSquare.static.numOfSquares).to.equal(1);
            expect(eCircle.static.circleCount).to.equal(1);
            eShape.static.numOfSquares++;
            expect(eSquare.static.numOfSquares).to.equal(1);

        });
        it('inhertiance levels deep works', function () {
            const eCharacter = encage(Character);
            const eEnemy = eCharacter.extend(Enemy);
            const eSlime = eEnemy.extend(Slime);
            const slime = eSlime.create({ name: "silver slime", color: "silver", health: 40, info: { description: "slimer moves slow" } });
            expect(eCharacter.static.numOfCharacters).to.equal(1);
            expect(eEnemy.static.enemyCount).to.equal(1);
            expect(eSlime.static.numOfSlimes).to.equal(1);
            expect(eSlime.static.trackSlimes[0]).to.deep.equal(slime);
            expect(eEnemy.static.allEnemies[0]).to.deep.equal(slime);
        });
    });
});