const Employee = require('./examples/Employee');
const encage = require('../src/index');
const expect = require('chai').expect;
describe('#server test', function () {
    it('can call database and hide info', function (done) {
        const eEmployee = encage(Employee);
        const worker = eEmployee.create({ name: "Homer", company: "Duff" });
         //Prints out {name: "Homer", company: "Duff", getSSN: [Function] }
        worker.ready.then(() => {
            expect(worker.getPersonalData("test")).to.deep.equal({ location: 'Sprinfield',
            ssn: 335555555,
            phoneNumber: 2222222222 });
            done();
        });
    });
    it('allows promises to work on intialization', function(done) {
        const eEmployee = encage(Employee);
        const worker2 = eEmployee.create({ name: "Hank Hill", company: "Propane Accessories" });
        worker2.ready.then(() => {
            expect(worker2.getPersonalData("test")).to.deep.equal({ location: 'Sprinfield',
            ssn: 335555555,
            phoneNumber: 2222222222 });
            done();
        });
    })
});