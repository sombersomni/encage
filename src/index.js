const { Shape, Circle, Square, Ellipse } = require('../test/examples/Shapes')
const separateStatics = require('./helpers/separateStatics');
const deepFreeze = require('./helpers/deepfreeze');
const deepAssign = require('./helpers/deepAssign');
let { checkStatic, checkInit } = require("./helpers/patterns");
let { SINGLETON_FLAG, INHERITANCE_FLAG, IGNORE_INIT } = require("./helpers/flags");
//this function is using closures to keep private variables and public variables intact and managable
function encage(Parent, options = { singleton: false }) {
  //keep track of the encage state for user specified options
  let state = { flag: 0 };
  let { flag } = state;
  if (typeof options != 'object' && !(options.constructor === Object)) {
    throw new TypeError('You need to use an object for your options');
  }
  if (Parent.inherited) {
    flag = flag ^ INHERITANCE_FLAG;
    //this is important for keeping inheritance through a prototype chain for infinite number of classes;
    delete Parent.inherited;
  }
  //checks if Parent Object/Class is an object or constructor class
  const isObject = (typeof Parent === 'object' && (Parent.constructor === Object));
  if (isObject) {
    let Root = Object.assign({}, Parent);
    //creates static state for object
    let _static = { methods: {}, variables: {} }
    if (Root['static'] instanceof Array) {
      _static = separateStatics(Root['static'][0], _static)
    } else {
      _static = separateStatics(Root['static'], _static);
    }
    function Encaged() {
      this.static = {};
      for (let key in _static.variables) {
        this.static[key] = _static.variables[key];
      }
      for (let key in _static.methods) {
        //binding to make sure the context is kept inside this class
        this.static[key] = this[key].bind(this);
      }
      //need to keep root attached to this static object;
      if (Root['static'] instanceof Array) {
        Root['static'][0] = Object.assign(this.static);
      } else {
        Root['static'] = Object.assign(this.static);
      }
      //DO NO TOUCH
    }
    Encaged.prototype = Object.assign({}, {
      extend: function (Child, extendOpts = { allowInits: true }) {
        if (typeof extendOpts != 'object' && !(extendOpts.constructor === Object)) {
          throw new TypeError('You need to use an object for your options');
        }
        //allows the user to inherit from base class
        //inheritance flag is set to 2;
        if (Child && typeof Child === 'object' && (Child.constructor === Object)) {
          let tempChild = {}
          //turn on ignore intialization flag
          flag = flag ^ IGNORE_INIT;
          let tempInst = Object.assign({}, this.create());
          flag = flag ^ IGNORE_INIT;

          //run instance and map it to temporary Child before adding inherited properties to it
          tempChild = Object.assign({}, tempInst, Child);
          //makes sure public property is not empty
          if (!tempChild['public']) {
            tempChild['public'] = {};
          }
          Object.keys(tempChild).forEach(prop => {
            if (prop != 'private' && prop != 'protected' && prop != 'public' && prop != 'static' && prop != 'init') {
              //compounds temp props into public and deletes rest around object
              if(!tempChild['public']) {
                tempChild['public'][prop] = tempChild[prop];
              }
              delete tempChild[prop];
            } else {
              const value = tempChild[prop];
              if (typeof value != 'object' && value.constructor != Object) {
                throw new TypeError("You must use an object when creating " + prop);
              }
              if (prop === 'static' || prop === 'init') {
                tempChild[prop] = [value]
              }
            }
          });
          //mapping items from Root object to new child object
          const { allowInits } = extendOpts;
          for (let setting in Root) {
            if (setting != 'private') {
              if (allowInits === true) {
                if (setting === 'static') {
                  if (tempChild['static'] && tempChild['static'] instanceof Array) {
                    if (Root['static'] instanceof Array) {
                      let staticArr = Root['static'].slice()
                      staticArr.unshift(tempChild['static'][0]);
                      tempChild['static'] = staticArr;
                    } else {
                      tempChild['static'].push(Root['static']);
                    }
                  } else {
                    tempChild['static'] = [null, Root['static']];
                  }
                }
                else {
                  if (setting === 'init') {
                    if (tempChild['init'] && tempChild['init'] instanceof Array) {
                      if (Root['init'] instanceof Array) {
                        let staticArr = Root['init'].slice()
                        staticArr.unshift(tempChild['static'][0]);
                        tempChild['init'] = staticArr;
                      } else {
                        tempChild['init'].push(Root['init']);
                      }
                    } else {
                      tempChild['init'] = [null, Root['init']]
                    }
                  } else {
                    tempChild[setting] = Object.assign({}, Root[setting], tempChild[setting]);
                  }
                }
              } else if (allowInits instanceof Array) {
                if (setting === 'init') {
                  let allowed = {};
                  if (Root['init'] instanceof Array) {
                    allowed = Root['init'].map(inits => {
                      let tempAllowed = {};
                      allowInits.forEach(each => {
                        if (inits.hasOwnProperty(each)) {
                          tempAllowed[each] = inits[each];
                        }
                      });
                      return tempAllowed;
                    });
                  } else {
                    allowInits.forEach(each => {
                      if (Root['init'].hasOwnProperty(each)) {
                        allowed[each] = Root['init'][each];
                      }
                    });
                  }

                  if (tempChild['init'] && tempChild['init'] instanceof Array) {
                    if (allowed instanceof Array) {
                      allowed.unshift(tempChild['static'][0]);
                      tempChild['init'] = allowed;
                    } else {
                      tempChild['init'].push(allowed);
                    }
                  } else {
                    tempChild['init'] = [null, allowed]
                  }
                } else if (setting === 'static') {
                  if (tempChild['static'] && tempChild['static'] instanceof Array) {
                    if (Root['static'] instanceof Array) {
                      let staticArr = Root['static'].slice().unshift(tempChild['static'][0]);
                      tempChild['static'] = staticArr;
                    } else {
                      tempChild['static'].push(Root['static']);
                    }
                  } else {
                    tempChild['static'] = [null, Root['static']];
                  }
                } else {
                  tempChild[setting] = Object.assign({}, Root[setting], tempChild[setting]);
                }
              } else {
                if (setting != 'init' && setting != 'static') {
                  tempChild[setting] = Object.assign({}, Root[setting], tempChild[setting]);
                }
              }
            }
          }
          return encage(Object.assign(tempChild, { inherited: true }));
        } else {
          throw new TypeError('You need to pass an object or constructor function');
        }
      },
      create: function (constructArgs = {}, createOpts = { sealed: false, freeze: false }) {
        if (typeof createOpts != 'object' && !(createOpts.constructor === Object)) {
          throw new TypeError('You need to use an object for your options');
        }
        //assign arguments from create to public and private set variables
        if ((typeof constructArgs === 'object' && constructArgs.constructor === Object)) {
          const publicProps = {};
          if (constructArgs) {
            Object.keys(constructArgs).forEach(prop => {
              //assigns class arguments to public vars
              const value = constructArgs[prop];
              if (Root.public && Root.public.hasOwnProperty(prop)) {
                publicProps[prop] = value
                //assigns class arguments to public vars
              } else if (Root.private && Root.private.hasOwnProperty(prop)) {
                Root.private[prop] = value;
              } else if (Root.protected && Root.protected.hasOwnProperty(prop)) {
                Root.protected[prop] = value;
              }
            });
          }

          //setup for private and protected state
          //sealing private so it can't be deleted from the outside.
          let _private = Object.assign({}, Root.private);
          //sealing protected so it can't be deleted from the outside.
          let _protected = Object.assign({}, Root.protected);
          //creates a new instance to configure before returning to user
          let newInst = Object.assign({}, Root.public, publicProps);
          //maps all functions to instance and private/static variables using apply
          let _staticRef = this.static;
          if (_private) {
            for (let prop in _private) {
              if (_private[prop] instanceof Function) {
                let tempFn = _private[prop];
                _private[prop] = function () {
                  return tempFn.apply(Object.assign({}, deepAssign(newInst),
                    _staticRef ? { static: deepFreeze(Object.create(_staticRef)) } : null,
                    { private: deepAssign(_private) },
                    _protected ? { protected: deepAssign(_protected) } : null), arguments);
                }
              }
            }
          }
          if (_protected) {
            for (let prop in _protected) {
              if (_protected[prop] instanceof Function) {
                let tempFn = _protected[prop];
                _protected[prop] = function () {
                  return tempFn.apply(Object.assign({}, deepAssign(newInst),
                    _staticRef ? { static: deepFreeze(Object.create(_staticRef)) } : null,
                    _private ? { private: deepAssign(_private) } : null,
                    { protected: deepAssign(_protected) }), arguments);
                }
              }
            }
          }
          Object.getOwnPropertyNames(newInst).forEach(name => {
            if (newInst[name] instanceof Function) {
              let tempFn = newInst[name];
              newInst[name] = function () {
                return tempFn.apply(Object.assign({}, deepAssign(this),
                  _staticRef ? { static: deepFreeze(Object.create(_staticRef)) } : {},
                  _private ? { private: deepAssign(_private) } : {},
                  _protected ? { protected: deepAssign(_protected) } : {}), arguments);
              }
            }
          });
          //Ignore flag ignores initialization property when extend function is used
          if ((flag & IGNORE_INIT) != IGNORE_INIT) {
            //check inits for multiple initializaitons from inherited parents
            //creates copy of instance so we don't add static or private variables
            //if length of array is greather than zero, begin initializing sequenced functions for user
            if (Root['init'] instanceof Array) {
              Root['init'].forEach((newStatic, i) => {
                for (let prop in newStatic) {
                  if (newStatic[prop] instanceof Function) {
                    newStatic[prop].call(Object.assign({}, deepAssign(newInst),
                      _staticRef || Root['static'][i] ? { static: deepAssign(i === 0 ? _staticRef : Root['static'][i]) } : null,
                      _private ? { private: deepAssign(_private) } : null,
                      _protected ? { protected: deepAssign(_protected) } : null,
                      { instance: deepAssign(newInst) }));
                  }
                }
              });
            } else {
              for (let prop in Root['init']) {
                if (Root['init'][prop] instanceof Function) {
                  Root['init'][prop].call(Object.assign({}, deepAssign(newInst),
                    _staticRef ? { static: deepAssign(_staticRef) } : null,
                    _private ? { private: deepAssign(_private) } : null,
                    _protected ? { protected: deepAssign(_protected) } : null,
                    { instance: deepAssign(newInst) }));
                }
              }
            }
          }
          //keeps user from changing object properties. Based on user setting
          if (createOpts.sealed) {
            newInst = Object.seal(newInst);
          } else if (createOpts.freeze) {
            newInst = deepFreeze(newInst);
          }
          //flips singleton flag so it will no longer create instances
          if (options.singleton) {
            flag = flag ^ SINGLETON_FLAG;
            options.singleton = false;
            return newInst;
          } else {
            return (flag & SINGLETON_FLAG) === SINGLETON_FLAG ? null : newInst;
          }
        } else throw new TypeError('Argument must be an object for create');
      }
    }, _static.methods);
    return new Encaged();
  } else {
    throw new TypeError('Must use a Object as an argument for create');
  }
}

module.exports = encage;