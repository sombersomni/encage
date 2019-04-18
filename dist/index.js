import EncageWrapper from './src/EncageWrapper.js';

function encage(config = {}) {
  function initEncage() {
    //creates static variables
    const _static = this;

    console.log(_static);

    const EncagedClass = function () {
      _static.numOfBanks++;
      this.name = 'Regions';
    };

    EncagedClass.prototype = {
      getBalance: function () {
        return _static.numOfBanks;
      }
    };
    return new EncageWrapper();
  } //initializes your class with static variables first set in your config object


  return initEncage.call(config.static != undefined ? config.static : {});
}

const config = {
  static: {
    numOfBanks: 0
  }
};
const encagedBank = encage(config);
const bank = encagedBank.create();
console.log(bank.getBalance());
const bank2 = encagedBank.create();
console.log(bank2.getBalance());
console.log(encagedBank.numOfBanks);