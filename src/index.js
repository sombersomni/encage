const deepFreeze = require("./helpers/deepfreeze");
const deepAssign = require("./helpers/deepAssign");
let { checkStatic, checkInit } = require("./helpers/patterns");
let { SINGLETON_FLAG, INHERITANCE_FLAG } = require("./helpers/flags");
//this function is using closures to keep private variables and public variables intact and managable
function encage(Parent, options = { singleton: false }) {
  //keep track of the encage state for user specified options
  let state = { flag: 0, numOfChildren: 0 };
  let { flag, numOfChildren } = state;
  if (typeof options != 'object' && !(options.constructor === Object)) {
    throw new TypeError('You need to use an object for your options');
  }
  if (Parent.inherited) {
    flag = flag ^ INHERITANCE_FLAG;
    numOfChildren = Parent.numOfChildren;
    delete Parent.inherited;
    delete Parent.numOfChildren;
  }
  //checks if Parent Object/Class is an object or constructor class
  const isObject = (typeof Parent === 'object' && (Parent.constructor === Object));
  if (Parent && Parent instanceof Function || isObject) {
    let Root = {};
    if (isObject) {
      Root = Object.assign({}, Parent);
    } else {
      try {
        tempRoot = new Parent();
        Root = Object.create(Parent.prototype);
        console.log("ROOT", Root);
        Root['public'] = {};
        Object.getOwnPropertyNames(tempRoot).forEach(prop => {
          if (prop != 'private' && prop != 'protected' && prop != 'public' && !checkStatic.test(prop) && !checkInit.test(prop)) {
            Root['public'][prop] = tempRoot[prop];
          } else {
            Root[prop] = Object.assign({}, tempRoot[prop]);
          }
        });
        for (let key in Parent.prototype) {
          Root['public'][key] = Parent.prototype[key];
        }
      } catch (err) {
        console.warn("make sure to use a constructor function");
      }
    }
    //creates static state for object
    let _static = { methods: {}, variables: {} }
    for (let key in Root['static']) {
      if ((Root['static'][key] instanceof Function)) {
        if (key === 'create' && key === 'extend') {
          throw new Error("Try not to overwrite functions supplied by encage like create or extend. Use different method names instead");
        } else {
          _static.methods[key] = Root['static'][key];
        }
      } else {
        _static.variables[key] = Root['static'][key];
      }
    }

    function Encaged() {
      this.static = {};
      for (let key in _static.variables) {
        this.static[key] = _static.variables[key];
      }
      for (let key in _static.methods) {
        this.static[key] = this[key].bind(this);
      }

      //keeps track of number of children creaeted
      //DO NO TOUCH
    }
    Encaged.prototype = Object.assign({}, {
      extend: function (Child, extendOpts = { allowInits: true }) {
        if (typeof extendOpts != 'object' && !(extendOpts.constructor === Object)) {
          throw new TypeError('You need to use an object for your options');
        }
        //allows the user to inherit from base class
        //inheritance flag is set to 2;
        if (Child && Child instanceof Function || (typeof Child === 'object' && (Child.constructor === Object))) {
          numOfChildren++;
          let tempChild = {}
          if (Child instanceof Function) {
            tempChild = Object.create(new Child());
            tempChild['public'] = {};
            for (let key in Child.prototype) {
              tempChild['public'][key] = Child.prototype[key];
            }
          } else {
            //run instance and map it to temporary Child before adding inherited properties to it
            tempChild = Object.create(Child);
          }
          Object.getOwnPropertyNames(tempChild).forEach(prop => {
            if (prop != 'private' && prop != 'protected' && prop != 'public' && prop != 'static' && prop != 'init') {
              //compounds temp props into public and deletes rest around object
              tempChild['public'] = Object.assign(tempChild['public'], { [prop]: tempChild[prop] });
              delete tempChild[prop];
            }
          });
          //mapping items from Root object to new child object
          const { allowInits } = extendOpts;
          for (let setting in Root) {
            if (setting != 'private') {
              if (allowInits === true) {
                if (setting === 'static') {
                  tempChild['static' + numOfChildren] = Object.assign(this.static);
                }
                else {
                  tempChild[setting != 'init' ? setting : setting + numOfChildren] = Object.assign({}, tempChild[setting], Root[setting]);
                }
              } else if (allowInits instanceof Array) {
                if (setting === 'init') {
                  let allowed = {};
                  allowInits.forEach(each => {
                    if (Root['init'].hasOwnProperty(each))
                      allowed[each] = Object.assign({}, Root['init'][each]);
                  });
                  tempChild[setting + numOfChildren] = Object.assign({}, tempChild[setting], allowed);
                } else if (setting === 'static') {
                  tempChild['static' + numOfChildren] = Object.assign(this.static);
                } else {
                  tempChild[setting] = Object.assign({}, tempChild[setting], Root[setting]);
                }
              } else {
                if (setting != 'init' && setting != 'static') {
                  tempChild[setting] = Object.assign({}, tempChild[setting], Root[setting]);
                }
              }
            }
          }
          return encage(Object.assign(tempChild, { inherited: true, numOfChildren: numOfChildren, p: Child }));
        }
      },
      create: function (constructArgs = {}, createOpts = { sealed: false, freeze: false }) {
        if (typeof createOpts != 'object' && !(createOpts.constructor === Object)) {
          throw new TypeError('You need to use an object for your options');
        }
        //assign arguments from create to public and private set variables
        if ((typeof constructArgs === 'object' && constructArgs.constructor === Object)) {
          const publicProps = {};
          let filteredOutArgsPublic = [];
          if (constructArgs) {
            filteredOutArgsPublic = Root.public ? Object.keys(Root.public).filter(prop => !constructArgs.hasOwnProperty(prop)) : [];
            Object.keys(constructArgs).forEach(prop => {
              //assigns class arguments to public vars
              if (Root.public && Root.public.hasOwnProperty(prop)) {
                const value = constructArgs[prop];
                publicProps[prop] = {
                  value,
                  writeable: !createOpts.freeze,
                  enumerable: true,
                  configurable: !createOpts.sealed && !createOpts.freeze
                }
                //assigns class arguments to public vars
              } else if (Root.private && Root.private.hasOwnProperty(prop)) {
                const value = constructArgs[prop];
                Root.private[prop] = value;
              } else if (Root.protected && Root.protected.hasOwnProperty(prop)) {
                Root.protected[prop] = value;
              }
            });
          } else {
            filteredOutArgsPublic = Object.keys(Root.public);
          }
          //setup for private and protected state
          //sealing private so it can't be deleted from the outside.
          let _private = Object.assign({}, Root.private);
          //sealing protected so it can't be deleted from the outside.
          let _protected = Object.assign({}, Root.protected);
          //creates a new instance to configure before returning to user
          function initialize() {
            let _staticRef = this.static;
            let newInst = {}
            if ((flag & INHERITANCE_FLAG) === INHERITANCE_FLAG) {
              newInst = Object.create(Parent, publicProps);
              console.log("___CREATED NEW INSTANCE___");
              console.log(newInst instanceof Parent.p);
            }
            else
              newInst = Object.create(isObject ? {} : Parent.prototype, publicProps);
            //maps all functions to instance and private/static variables using apply
            if (_private) {
              for (let prop in _private) {
                if (_private[prop] instanceof Function) {
                  const tempFn = _private[prop];
                  _private[prop] = function () {
                    return tempFn.apply(Object.assign({}, deepAssign(newInst),
                      _staticRef ? { static: deepFreeze(Object.create(_staticRef)) } : {},
                      { private: deepAssign(_private) },
                      _protected ? { protected: deepAssign(_protected) } : {}), arguments);
                  }
                }
              }
            }
            if (_protected) {
              for (let prop in _protected) {
                if (_protected[prop] instanceof Function) {
                  const tempFn = _protected[prop];
                  _protected[prop] = function () {
                    return tempFn.apply(Object.assign({}, deepAssign(newInst),
                      _staticRef ? { static: deepFreeze(Object.create(_staticRef)) } : {},
                      { private: deepAssign(_private) },
                      { protected: deepAssign(_protected) }), arguments);
                  }
                }
              }
            }
            if (Root.public) {
              filteredOutArgsPublic.forEach(prop => {
                if (Root.public[prop] instanceof Function) {
                  newInst[prop] = function () {
                    return Root.public[prop].apply(Object.assign({}, deepAssign(this),
                      _staticRef ? { static: deepFreeze(Object.create(_staticRef)) } : {},
                      _private ? { private: deepAssign(_private) } : {},
                      _protected ? { protected: deepAssign(_protected) } : {}), arguments);
                  }
                } else {
                  newInst[prop] = Root.public[prop];
                }
              });
            }
            //check inits for multiple initializaitons from inherited parents
            const initsToStart = Object.keys(Root).filter(key => checkInit.test(key))
            //creates copy of instance so we don't add static or private variables
            //if length of array is greather than zero, begin initializing sequenced functions for user
            if (initsToStart.length > 0) {
              initsToStart.forEach(name => {
                const index = parseInt(name.slice(-1));
                for (let prop in Root[name]) {
                  if (Root[name][prop] instanceof Function) {
                    Root[name][prop].call(Object.assign({}, deepAssign(newInst),
                      _staticRef ? { static: Number.isNaN(index) ? _staticRef : Root['static' + index] } : {},
                      _private ? { private: deepAssign(_private) } : {},
                      _protected ? { protected: deepAssign(_protected) } : {},
                      { _instance: deepAssign(newInst) }));
                  }
                }
              });
            }
            if (createOpts.sealed) {
              newInst = Object.seal(newInst);
            } else if (createOpts.freeze) {
              newInst = deepFreeze(newInst);
            }
            //turn off inhertiance flag
            if ((flag & INHERITANCE_FLAG) === INHERITANCE_FLAG) {
              flag = flag ^ INHERITANCE_FLAG;
            }
            //flips singleton flag so it will no longer create instances
            if (options.singleton) {
              flag = flag ^ SINGLETON_FLAG;
              options.singleton = false;
              return newInst;
            } else {
              return (flag & SINGLETON_FLAG) === SINGLETON_FLAG ? null : newInst;
            }
          }
          return initialize.call(this);
        } else throw new TypeError('Argument must be an object for create');
      }
    }, _static.methods);
    return new Encaged();
  } else {
    throw new TypeError('Must use a constructor Function or Object');
  }
}

module.exports = encage;