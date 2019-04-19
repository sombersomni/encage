//this function is using closures to keep private variables and public variables intact and managable
function encage(Parent) {
  const isObject = (typeof Parent === 'object' && Parent.constructor === Object);
  if (Parent && Parent instanceof Function || isObject) {
    let Root = {};
    if (isObject) {
      Root = Object.freeze(Parent);
    } else {
      try {
        tempRoot = Object.assign({}, new Parent());
        Root['public'] = {};
        for (let prop in tempRoot) {
          if (prop != 'private' && prop != 'public' && prop != 'static' && prop != '_init')
            Root['public'][prop] = tempRoot[prop];
          else Root[prop] = Object.assign({}, tempRoot[prop]);
        }
        for (let key in Parent.prototype) {
          Root['public'][key] = Parent.prototype[key];
        }
      } catch (err) {
        console.warn("make sure to use a constructor function")
      }
    }
    let _static = { methods: {}, variables: {} }
    for (let key in Root.static) {
      if ((Root.static[key] instanceof Function)) {
        if (key != 'create') {
          _static.methods[key] = Root.static[key];
        } else throw new Error("You can't overwrite the create method. Try using another method name or use _create")
      } else {
        _static.variables[key] = Root.static[key];
      }
    }
    function Encaged() {
      for (let key in _static.variables) {
        this[key] = _static.variables[key];
      }
      for (let key in _static.methods) {
        this[key] = this[key].bind(this);
      }
    }
    Encaged.prototype = Object.assign({}, {
      create: function () {
        //setup for public variables
        //assign arguments from create to public and private set variables
        if ((typeof arguments[0] === 'object' && arguments[0].constructor === Object) || (arguments.length === 0)) {

          const publicProps = {};
          let filteredOutArgsPublic = [];
          if (arguments.length === 1) {
            filteredOutArgsPublic = Root.public != undefined ? Object.keys(Root.public).filter(prop => !arguments[0].hasOwnProperty(prop)) : [];
            Object.keys(arguments[0]).forEach(prop => {
              //assigns class arguments to public vars
              if (Root.public != undefined && Root.public.hasOwnProperty(prop)) {
                const value = arguments[0][prop];
                publicProps[prop] = {
                  value,
                  writeable: true,
                  enumerable: true
                }
                //assigns class arguments to public vars
              } else if (Root.private != undefined && Root.private.hasOwnProperty(prop)) {
                const value = arguments[0][prop];
                Root.private[prop] = value;
              }
            });
          } else {
            filteredOutArgsPublic = Object.keys(Root.public);
          }

          //setup for public methods
          let _private = Object.assign({}, Root.private);
          //creates a new instance to configure before returning to user
          const initialize = () => {
            let newInst = Object.create((isObject ? {} : Parent.prototype), publicProps);
            //maps all functions to instance and private/static variables using apply
            if (_private) {
              for (let prop in _private) {
                if (_private[prop] instanceof Function) {
                  const tempFn = _private[prop];
                  _private[prop] = function () {
                    return tempFn.apply(Object.assign({}, newInst,
                      Root.static != undefined ? { static: this } : {}, { private: Object.assign(_private) }), arguments);
                  }
                }
              }
            }
            if (Root.public) {
              filteredOutArgsPublic.forEach(prop => {
                if (Root.public[prop] instanceof Function) {
                  newInst[prop] = function () {
                    return Root.public[prop].apply(Object.assign({}, newInst,
                      Root.static != undefined ? { static: this } : {},
                      _private != undefined ? { private: Object.assign(_private) } : {}), arguments);
                  }
                } else {
                  newInst[prop] = Root.public[prop];
                }
              });
            }
            //creates copy of instance so we don't add static or private variables
            if (Root._init) {
              for (prop in Root._init) {
                if (Root._init[prop] instanceof Function) {
                  Root._init[prop].call(Object.assign({}, newInst,
                    Root.static != undefined ? { static: this } : {},
                    _private != undefined ? { private: Object.assign(_private) } : {}));
                }
              }
            }
            return newInst;
          }
          return initialize();
        } else throw new TypeError('Argument must be an object for create');
      }
    }, _static.methods);
    const inst = new Encaged();
    return inst;
  } else {
    throw new TypeError('Must use a constructor Function or Object');
  }
}

// const BankAccount = {
//   _init: {
//     addClient: function () {
//       this.static.numOfAccounts++;
//       this.static.clients.push(this.name);
//     }
//   },
//   static: {
//     numOfAccounts: 0,
//     clients: [],
//     printClients: function () {
//       for (let i in this.clients) {
//         console.log("Client " + i + " : " + this.clients[i]);
//       }
//     }
//   },
//   public: {
//     name: '',
//     bankName: 'regions',
//     setPassword: function (password) {
//       this.private.password = password;
//     },
//     getBalance: function () {
//       return this.private.balance;
//     },
//     widthdraw: function (password, amount) {
//       if (this.private.checkPassword(password)) {
//         this.private.reduceBalance(amount);
//         console.log("Account balance is : " + this.private.balance)
//         return amount;
//       }
//     },
//     deposit: function (password, amount) {
//       if (this.private.checkPassword(password)) {
//         this.private.addBalance(amount);
//         console.log("Account balance is : " + this.private.balance)
//       }
//     },
//   },
//   private: {
//     accountNumber: 0,
//     balance: 0,
//     password: "test",
//     checkPassword: function (password) {
//       return password === this.private.password
//     },
//     reduceBalance: function (amount) {
//       this.private.balance -= amount;
//     },
//     addBalance: function (amount) {
//       this.private.balance += amount;
//     }
//   }
// }

// const eBankAccount = encage(BankAccount);
// console.log(eBankAccount);
// const account = eBankAccount.create();
// console.log(account);
// const account2 = eBankAccount.create({ name: 'Korey', bankName: 'Regions', accountNumber: 43462345 });
// console.log("account 2 _______", account2);
// console.log("last", eBankAccount);
module.exports = encage;