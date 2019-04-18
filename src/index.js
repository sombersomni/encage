let separateMethodsVars = require('./helpers/separateMethodsVars')

function encage(obj) {
  //initialize encage
  //initializes your class with static variables first set in your config object
  return function () {
    //create a static object enclosed in main class user creates
    _static = obj.static != undefined ? Object.assign({}, obj.static): {};

    //creates a wrapper class for the main class created by the user
    //filters out static methods from normal variables
    const mainStatic = separateMethodsVars(_static);
    //creates a new object every invocation of encage
    return Object.create(Object.assign({
      create() {
        const args = Array.prototype.slice.call(arguments);
        const tempPublic = obj.public != undefined ? separateMethodsVars(obj.public) : {};
        const TempClass = function () {
          if (obj.public != undefined) {
            for (let key in tempPublic.variables) {
              this[key] = tempPublic.variables[key]
            }
          }
        }
        TempClass.prototype = Object.create(tempPublic.methods)
        return new TempClass;
      }
    }, mainStatic.methods), mainStatic.variables);
  }();
}


const Bank = {
  construct: {},
  public: {
    name: "Xavier",
    bankName: "Regions",
    getBalance: function() {
      return this.private.balance;
    }
  },
  private: {
    balance: 0
  }, 
  static: {
    numofBanks: 0
  }
}
const EncagedBank = encage(Bank);
const bank = EncagedBank.create('Steve', 'Bank of America');
console.log(bank)
module.exports = encage;