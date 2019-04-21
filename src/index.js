const { Shape, Circle, Square, Ellipse } = require('../test/examples/Shapes')
const separateStatics = require('./helpers/separateStatics');
const deepFreeze = require('./helpers/deepfreeze');
const deepAssign = require('./helpers/deepAssign');
let { checkStatic, checkInit } = require("./helpers/patterns");
let { SINGLETON_FLAG, INHERITANCE_FLAG, IGNORE_INIT } = require("./helpers/flags");
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
        const tempRoot = new Parent();
        Root = Object.create(Parent.prototype);
        Root['public'] = {};
        Object.getOwnPropertyNames(tempRoot).forEach(prop => {
          if (prop != 'private' && prop != 'protected' && prop != 'public' && prop != 'static' && prop != 'init') {
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
        if (Child && Child instanceof Function || (typeof Child === 'object' && (Child.constructor === Object))) {
          let tempChild = {}
          //turn on ignore intialization flag
          flag = flag ^ IGNORE_INIT;
          tempInst = Object.create(this.create());
          flag = flag ^ IGNORE_INIT;
          if (Child instanceof Function) {
            tempProto = Child.prototype;
            Child.prototype = Object.assign(tempInst, tempProto);
            tempChild = new Child();
            //relegates this.variables into temps public object for reorganization later
            tempChild['public'] = {};
            for (let prop in Child.prototype) {
              if (prop === 'public') {
                tempChild['public'] = Object.assign({}, Child.prototype['public']);
              } else {
                tempChild['public'][prop] = Child.prototype[prop];
              }
            }
          } else {
            //run instance and map it to temporary Child before adding inherited properties to it
            tempChild = Object.assign(tempInst, Child);
            //makes sure public property is not empty
            if(!tempChild['public']) {
              tempChild['public'] = {};
            }
          }
          Object.keys(tempChild).forEach(prop => {
            if (prop != 'private' && prop != 'protected' && prop != 'public' && prop != 'static' && prop != 'init') {
              //compounds temp props into public and deletes rest around object
              tempChild['public'][prop] = tempChild[prop];
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
                      let staticArr = Root['static'].slice().unshift(tempChild['static'][0]);
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
                        let staticArr = Root['init'].slice().unshift(tempChild['static'][0]);
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
                      let staticArr = allowed.unshift(tempChild['static'][0]);
                      tempChild['init'] = staticArr;
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
          return encage(Object.assign(tempChild, { inherited: true, numOfChildren: numOfChildren }));
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
          let filteredOutArgsPublic = [];
          if (constructArgs) {
            filteredOutArgsPublic = Root.public ? Object.keys(Root.public).filter(prop => !constructArgs.hasOwnProperty(prop)) : [];
            Object.keys(constructArgs).forEach(prop => {
              //assigns class arguments to public vars
              const value = constructArgs[prop];
              if (Root.public && Root.public.hasOwnProperty(prop)) {
                publicProps[prop] = {
                  value,
                  writeable: !createOpts.freeze,
                  enumerable: true,
                  configurable: !createOpts.sealed && !createOpts.freeze
                }
                //assigns class arguments to public vars
              } else if (Root.private && Root.private.hasOwnProperty(prop)) {
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
          let newInst = {};
          if ((flag & INHERITANCE_FLAG) === INHERITANCE_FLAG) {
            newInst = Object.create(Parent, publicProps);
          }
          else
            newInst = Object.create(isObject ? {} : Parent.prototype, publicProps);
          //maps all functions to instance and private/static variables using apply
          let _staticRef = this.static;
          if (_private) {
            for (let prop in _private) {
              if (_private[prop] instanceof Function) {
                const tempFn = _private[prop];
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
                const tempFn = _protected[prop];
                _protected[prop] = function () {
                  return tempFn.apply(Object.assign({}, deepAssign(newInst),
                    _staticRef ? { static: deepFreeze(Object.create(_staticRef)) } : null,
                    _private ? { private: deepAssign(_private) } : null,
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
                    _staticRef ? { static: deepFreeze(Object.create(_staticRef)) } : null,
                    _private ? { private: deepAssign(_private) } : null,
                    _protected ? { protected: deepAssign(_protected) } : null), arguments);
                }
              } else {
                newInst[prop] = Root.public[prop];
              }
            });
          }
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
    throw new TypeError('Must use a constructor Function or Object');
  }
}

// const eShape = encage(Shape);
// const eCircle = eShape.extend(Circle);
// const eEllipse = eShape.extend(eCircle.extend(Ellipse).create());

// const circle = eCircle.create({ name: "circle1" });
// const circle2 = eCircle.create({ name: "circle2" });
// const circle3 = eCircle.create({ name: "circle3" });
// const ellipse = eEllipse.create({ name: "ellipse" });
// console.log(ellipse instanceof Ellipse, ellipse instanceof Circle, ellipse instanceof Shape);
// console.log("__CHECKING TEST_______");
// console.log(eShape);
module.exports = encage;