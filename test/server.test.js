const Employee = require('./examples/Employee');
const encage = require('../src/index');
const axios = require('axios');
const expect = require('chai').expect;
describe('#server test', function () {
    it('can call database and hide info', function (done) {
        const eEmployee = encage(Employee);
        const worker = eEmployee.create({ name: "Homer", company: "Duff" });
        //Prints out {name: "Homer", company: "Duff", getSSN: [Function] }
        worker.ready.then(() => {
            expect(worker.getPersonalData("test")).to.deep.equal({
                location: 'Sprinfield',
                ssn: 335555555,
                phoneNumber: 2222222222
            });
            done();
        });
    });
    it('allows promises to work on intialization', function (done) {
        const eEmployee = encage(Employee);
        const worker2 = eEmployee.create({ name: "Hank Hill", company: "Propane Accessories" });
        worker2.ready.then(() => {
            expect(worker2.getPersonalData("test")).to.deep.equal({
                location: 'Sprinfield',
                ssn: 335555555,
                phoneNumber: 2222222222
            });
            done();
        });
    })
    it('inheritance proimes work', function (done) {
        const McDonaldsEmployee = {
            public: {
                company: "McDonalds",
                printEarnings() {
                    this.private.earnings.forEach(pay => {
                        console.log("Earnings : " + pay.payment);
                    });
                }, 
                getFirstMonthsPay() {
                    return this.private.earnings[0].payment;
                }
            },
            private: {
                earnings: [],
            },
            init: {
                fetchEarnings: async function () {
                    try {
                        const response = await axios.get('http://localhost:3000/earnings');
                        this.private.earnings = response.data.earnings;
                    } catch (err) {
                        console.log(err);
                    }
                }

            }
        }
        const eEmployee = encage(Employee);
        const eMcDonaldsEmployee = eEmployee.extend(McDonaldsEmployee, { tracking: true });
        const worker = eMcDonaldsEmployee.create({ name: "Thurgood" });
        worker.ready.then(() => {
            worker.printEarnings();
            expect(worker.getFirstMonthsPay()).to.equal(21232)
            done();
        });
    })
});