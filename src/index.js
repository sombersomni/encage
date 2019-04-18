function encage(RootClass) {
  //initialize encage
  //initializes your class with static variables first set in your config object
  return function () {
    //create a static object enclosed in main class user creates
    _static = new RootClass().static

    //creates a wrapper class for the main class created by the user
    //filters out static methods from normal variables
    const mainStatic = { methods: {}, variables: {} };
    for (let attr in _static) {
      if (_static[attr] instanceof Function) {
        if (attr != 'create') {
          mainStatic.methods[attr] = _static[attr]
        } else {
          console.log('create')
          throw new Error("Try using a different method name besides create in your static config. Can't overrid encage's create method")
        }
      } else {
        //create variables
        mainStatic.variables[attr] = {
          value: _static[attr],
          writeable: true, 
          enumerable: true
        }
      }
    }
    //creates a new object every invocation of encage
    const EncagedWrapper = Object.create(Object.assign({
      create() {
        const tempInstance = new RootClass();
        console.log(tempInstance)
        console.log(arguments)
        return {};
      }
    }, mainStatic.methods));

    return Object.defineProperties(EncagedWrapper, mainStatic.variables)
  }();
}




//Static variables are used to keep track of all instances of your main Class
class Bank {
  constructor(name ='Xavier', bankName='Regions') {
    /* these are your public variables, create them like you would normally
    however you must create the variables in the same order you call them in your
    construtor, if not you can use this.constructorOrder to keep 
    everything in the correct sequence */

    this.name = name;
    this.bankName = bankName;
    //this will keep the order of your constructor when you transition to a Encaged constructor
    this.constructorOrder = ['name', 'bankName'];
    this.static = {
      numOfBanks: 0,
      banks: [],
      getBanks: function() {
        //when you refer to a static variable, use the syntax below to use the variable.
        //You can't access it from your main object using this
        return _static.banks;
      }
    }
    //you can create private vairables so no one can access or change them through your variable
    //this can be used anywhere in your code using _private
    this.private = {
      addBanks() {
        _static.banks.push(this);
      }
    }
  }

  getBalance() {
    return 100;
  }
}
const EncagedBank = encage(Bank);
console.log(EncagedBank, Object.values(EncagedBank));
const bank = EncagedBank.create('Xavier', 'regions');
console.log(bank)
module.exports = encage;