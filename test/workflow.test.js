var encage = require('../index.js');
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
    it('cant gain access to private variables by using newly added functions', function () {
        const Artist = {
            public: { name: '', genre: '', getSongs() { return this.protected.songs } },
            private: { bonusContent: {}, address: '' },
            protected: { songs: [] }
        }
        const eArtist = encage(Artist);
        const artist = eArtist.create({ name: 'Kendrick Lamar', songs: ['The Heart', 'DNA', 'ADHD'] });
        artist.getPrivate = function () { return this.private; }
        artist.getProtected = function () { return this.protected; }
        expect(artist.getPrivate()).to.be.undefined;
        expect(artist.getProtected()).to.be.undefined;
        expect(artist.getSongs()).to.include.ordered.members(['The Heart', 'DNA']);
    });
    it('base case for setting private variables', function () {
        const Employee = {
            public: {
                name: '',
                getSSN(password) { return this.private.checkPassword(password) ? this.private.ssn : null },
                setSSN(password, ssn) { this.private.ssn = this.private.checkPassword(password) ? ssn : this.private.ssn }
            },
            private: {
                ssn: 0,
                password: '1234',
                checkPassword(password) { return password == this.private.password }
            }
        }
        const eEmployee = encage(Employee);
        const worker = eEmployee.create({ name: 'Clark Kent', ssn: 55555555, password: 'superman' });
        expect(worker.getSSN('zod')).to.be.null; //Prints out null
        expect(worker.getSSN('superman')).to.equal(55555555) //Prints out 55555555
        worker.setSSN('superman', 222222222);
        expect(worker.getSSN('superman')).to.equal(222222222) //Prints out 222222222
    });
    it('can create over 100 instances and track them', function () {
        const NPC = { public: { showSecret() { return this.private.secret } }, private: { secret: '' } }
        const eNPC = encage(NPC, { tracking: true });
        eNPC.createTownsPeople = function (num) {
            for (let i = 0; i < num; i++) {
                this.create({ name: "towney" });
            }
        }
        eNPC.createTownsPeople(100);
        const npc1 = eNPC.create({ name: 'Shopkeeper' });
        eNPC.toggle('tracking'); //turns it off
        const npc2 = eNPC.create({ name: 'Customer' });
        eNPC.toggle('tracking'); //turns it back off
        const npc3 = eNPC.create({ name: 'Potion Master' });
        expect(eNPC.static.numOfInstances).to.equal(102) //Prints out 2
    });
    it('can keep changes made in public variable inside static', function () {
        const BankAccount = {
            init: {
                addClient: function () {
                    this.static.numOfAccounts++;
                    this.private.balance *= this.private.interest;
                    this.static.clientNames[this.public.id] = this.public.name
                    this.static.clients.push(this.instance);
                }
            },
            static: {
                numOfAccounts: 0,
                clientNames: {},
                clients: []
            },
            public: {
                name: "",
                id: 0,
                setName(name) {
                    this.public.name = name;
                    //helps update your static list
                    this.static.clientNames[this.public.id] = this.public.name
                }
            },
            private: { interest: 1.2, balance: 0 }
        }
        const eBankAccount = encage(BankAccount);
        const account = eBankAccount.create({ name: "Tony Stark", id: 1 });
        expect(eBankAccount.static.clientNames[account.id]).to.equal('Tony Stark'); //Prints out
        account.setName("Iron Man");
        expect(eBankAccount.static.clientNames[account.id]).to.equal('Iron Man'); //Prints out
    });
});