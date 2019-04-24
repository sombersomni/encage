const axios = require('axios');
async function getData() {
    const response = await axios.get('http://localhost:3000/homer');
    this.private.personalData = response.data;
}
const Employee = {
    public: {
        name: "n/a",
        company: "global inc",
        getPersonalData(password) { return password == "test" ? this.private.personalData : null },
    },
    private: { personalData: {} },
    init: {
        assignSSN(done) {
            return axios.get('http://localhost:3000/homer')
            .then(response => { 
                this.private.personalData = response.data
            } )
            .catch(err => { console.log(err) } );
        },
        grabData() {
            return getData.call(this);
        }
    }
}

module.exports = Employee;