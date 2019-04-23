const encage = require('../src/index.js');
const expect = require('chai').expect;
let eAccount;
describe('#encage workflow', function () {
    before(function () {
        const Account = {
            name: "Account", //sets name for Base Object so Encage can keep references for inheritance
            public: { //sets all your public variables
                name: "customer",
                id: 0,
                getBalance() { return this.protected.balance }, // use functions internally to retrieve your information
                setBalance(balance) { this.protected.balance = balance },
                setName(name) { this.public.name = name },
            },
            private: { sensitiveData: {}, weeklyReports: [] }, //sets private variables for this Class only
            protected: { accountNumber: 1112223333, password: "test", balance: 0 }, //sets private variables for this and inherited Objects
            static: { numOfAccounts: 0, customerIDs: [], premiumMembers: 0 }, //sets variables used by Encaged Object for tracking instances
            init: { //allows you to initialize functions immediately when instance is created similar to constructors
                trackAccounts() {
                    this.static.numOfAccounts++;
                    this.static.customerIDs.push(this.instance.id);
                }
            }
        }
        eAccount = encage(Account);
    });
    it('base case', function () {
        //you can set your values for private protected and public using this syntax
        const newAccount = eAccount.create({ 
            name: "Rick Sanchez", 
            id: 0324, 
            accountNumber: 2222222, 
            address: '123 Wubaluba Dr' });
        console.log(newAccount);
    });
    it('allows only Base Class to make changes to itself through static', function () {
        const Shape = {
            static: { numOfShapes: 0, countShapes() { this.static.numOfShapes++ } },
            public: { shapeCounter() { this.static.numOfShapes++ } }
        }
        const eShape = encage(Shape);
        const shape = eShape.create();
        eShape.static.countShapes(); //this will work!
        //notice that we dont need to use .public when dealing with functions for instance
        shape.shapeCounter(); //this will not work!
        expect(eShape.static.numOfShapes).to.equal(1);
    });
});