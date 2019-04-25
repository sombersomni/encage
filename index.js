/**
 * encage.js
 * Classes that create private and protected variables
 * Automatiacally tracks instances from Class
 *
 * Copyright (c) Somber Somni 2019
 * MIT License
 */
const checkObject = require('./src/checkObject');
const separateStatics = require('./src/separateStatics');
const checkInit = require('./src/checkInit');
const deepFreeze = require('./src/deepfreeze');
const deepCopy = require('./src/deepCopy');
const deepAssign = require('./src/deepAssign');
const mapRootToChild = require('./src/mapRootToChild');
let { SINGLETON_FLAG, INHERITANCE_FLAG, IGNORE_INIT, TRACKING_FLAG } = require("./src/flags");
const cuid = require('cuid');
//this function is using closures to keep private variables and public variables intact and managable
let numOfEncageInstances = 0;
function encage(Parent = {}, options = { singleton: false, tracking: false }) {
  //keep track of the encage state for user specified options
  let state = { flag: 0, hierarchy: {} };
  let { flag, hierarchy } = state;

  if (options == null || options == undefined) {
    options = { singleton: false, tracking: false };
  }
  if (typeof options != 'object' || !(options.constructor === Object)) {
    throw new TypeError('You need to use an object for your options');
  }
  //checks if Parent Object/Class is an object
  const isObject = (Parent && typeof Parent === 'object' && (Parent.constructor === Object));
  if (isObject) {
    checkObject(Parent);
    if (Parent.inherited) {
      //this is important for keeping inheritance through a prototype chain for infinite number of classes;
      flag = flag ^ INHERITANCE_FLAG;
      hierarchy = Object.assign({}, Parent.hierarchy);
      delete Parent.inherited;
      delete Parent.hierarchy;
    }
    if (options.tracking) {
      flag = flag ^ TRACKING_FLAG;
    }
    if (Parent['name'] && Parent['name'].length > 0) {
      hierarchy[Parent['name']] = true;
    } else {
      const name = 'encageId' + numOfEncageInstances;
      Parent['name'] = name;
      hierarchy[name] = true;
      numOfEncageInstances++;
    }
    let Root = Object.assign({}, Parent);
    if ((flag & TRACKING_FLAG) === TRACKING_FLAG) {
      //creates the tracking function and uses closures to keep track of the flag that belongs to derived root
      function trackInstances() {
        if ((flag & TRACKING_FLAG) === TRACKING_FLAG) {
          if (!this.static.instances || !this.static.numOfInstances) {
            this.static.instances = {};
            this.static.numOfInstances = 0;
          }
          this.static.instances[this.instance.instanceID] = this.instance;
          this.static.numOfInstances++;
        }
        return;
      }
      if (Root.init instanceof Array) {
        if (!Root['init'][0]) {
          Root['init'][0] = {};
        }
        Root['init'][0]['trackInstances'] = trackInstances;
      } else {
        if (!Root['init']) {
          Root['init'] = {};
        }
        Root['init']['trackInstances'] = trackInstances;
      }
    }
    //makes sure init properties are all functions. 
    //Throws error if not a function
    if (Root['init']) {
      if (Root['init'] instanceof Array) {
        checkInit(Root['init'][0]);
      } else {
        checkInit(Root['init']);
      }
    }
    //creates static state for object
    let _static = { methods: {}, variables: {} }
    if (Root['static']) {
      if (Root['static'] instanceof Array) {
        _static = separateStatics(Root['static'][0], _static)
      } else {
        _static = separateStatics(Root['static'], _static);
      }
    }
    function Encaged() {
      this.static = {};
      if (Object.keys(_static.variables).length > 0) {
        for (let key in _static.variables) {
          this.static[key] = _static.variables[key];
        }
      }
      if (Object.keys(_static.methods).length > 0) {
        for (let key in _static.methods) {
          //binding to make sure the context is kept inside this class
          const tempFn = function () {
            const returnValue = _static.methods[key].apply(this, arguments);
            if(returnValue) {
              return deepCopy(returnValue);
            }
            else {
              return returnValue;
            }
          }
          this.static[key] = tempFn.bind(this);
        }
      }
      //need to keep root attached to this static object;
      if ((flag & TRACKING_FLAG) === TRACKING_FLAG) {
        //will keep track of instances in order of creation
        this.static.instances = {};
        this.static.numOfInstances = 0;
      }
      //DO NO TOUCH
      if (Root['static'] instanceof Array) {
        Root['static'][0] = deepAssign(this.static);
      } else {
        Root['static'] = deepAssign(this.static);
      }
    }
    Encaged.prototype = Object.assign({}, {
      extend(Child = {}, extendOpts = { allowInits: true, tracking: false }) {
        if (extendOpts == null || extendOpts == undefined) {
          extendOpts = { allowInits: true, tracking: false }
        }
        if (typeof extendOpts != 'object' || !(extendOpts.constructor === Object)) {
          throw new TypeError('You need to use an object for your options');
        }
        const { allowInits } = extendOpts;
        //allows the user to inherit from base class
        //inheritance flag is set to 2;
        if (Child && typeof Child === 'object' && (Child.constructor === Object)) {
          checkObject(Child);

          //set global flag for new inherited encage object
          //turn on ignore intialization flag
          flag = flag ^ IGNORE_INIT;
          let tempInst = Object.assign({}, this.create());
          flag = flag ^ IGNORE_INIT;

          if ((flag & TRACKING_FLAG) === TRACKING_FLAG) {
            extendOpts.tracking = true;
          }
          //run instance and map it to temporary Child before adding inherited properties to it
          let savedName = '';
          if (Child['name']) {
            savedName = Child['name'];
            delete Child['name'];
          }
          let tempChild = Object.assign({}, tempInst, Child);
          Child['name'] = savedName;
          //makes sure public property is not empty
          if (!tempChild['public']) {
            tempChild['public'] = {};
          }
          Object.getOwnPropertyNames(tempChild).forEach(prop => {
            if (prop != 'private' && prop != 'protected' && prop != 'public' && prop != 'static' && prop != 'init') {
              //compounds temp props into public and deletes rest around object
              if (!tempChild['public']) {
                tempChild['public'][prop] = tempChild[prop];
              }
              delete tempChild[prop];
            } else {
              const value = tempChild[prop];
              if (typeof value != 'object' || value.constructor != Object) {
                throw new TypeError("You must use an object when creating " + prop);
              }
              if (prop === 'static' || prop === 'init') {
                tempChild[prop] = [value]
              }
            }
          });
          //mapping items from Root object to new child object
          tempChild = mapRootToChild(tempChild, Root, allowInits);
          return encage(Object.assign(tempChild, { name: savedName, inherited: true, hierarchy }), { tracking: extendOpts.tracking });
        } else {
          throw new TypeError('Argument must be an object for extend');
        }
      },
      create(constructArgs = {}, createOpts = { sealed: false, freeze: false }) {
        let _staticRef = this.static;
        if (constructArgs === null || constructArgs === undefined) {
          constructArgs = {};
        }
        if (createOpts === null || createOpts === undefined) {
          createOpts = { sealed: false, freeze: false };
        }
        if (typeof createOpts != 'object' || !(createOpts.constructor === Object)) {
          throw new TypeError('You need to use an object for your options');
        }
        //assign arguments from create to public and private set variables
        if ((typeof constructArgs === 'object' && constructArgs.constructor === Object)) {
          const publicProps = {};
          const publicFuncs = {};
          const rootPublicProps = {};
          let filteredPublicProps = [];
          if (constructArgs) {
            if (Root.public) {
              filteredPublicProps = Object.keys(Root.public).filter(key => !constructArgs[key]);
              Object.keys(constructArgs).forEach(prop => {
                //assigns class arguments to public vars
                const value = constructArgs[prop];
                if (Root.public && Root.public.hasOwnProperty(prop)) {
                  if (value instanceof Function) {
                    publicFuncs[prop] = value;
                  } else {
                    publicProps[prop] = {
                      value,
                      writeable: !createOpts.sealed || !createOpts.freeze,
                      configurable: !createOpts.freeze,
                      enumerable: true
                    }
                  }
                  //assigns class arguments to public vars
                } else if (Root.private && Root.private.hasOwnProperty(prop)) {
                  Root.private[prop] = value;
                } else if (Root.protected && Root.protected.hasOwnProperty(prop)) {
                  Root.protected[prop] = value;
                }
              });
            }
          }
          //setup for private and protected state
          //sealing private so it can't be deleted from the outside.
          let _private = Root.private ? Object.assign({}, Root.private) : {};
          //sealing protected so it can't be deleted from the outside.
          let _protected = Root.protected ? Object.assign({}, Root.protected) : {};
          //creates a new instance to configure before returning to user
          if (filteredPublicProps.length > 0) {
            filteredPublicProps.forEach(prop => {
              const value = Root.public[prop];
              if (value instanceof Function) {
                publicFuncs[prop] = value;
              } else {
                rootPublicProps[prop] = {
                  value,
                  writeable: !createOpts.sealed || !createOpts.freeze,
                  configurable: !createOpts.freeze,
                  enumerable: true
                }
              }
            });
          }
          let newInst = Object.create({}, Object.assign({}, rootPublicProps, publicProps));
          newInst = Object.assign({}, newInst, publicFuncs);
          //adds function to instance so it can check if it belongs to Root;
          Object.defineProperty(newInst, 'instanceOf', {
            value: function (rootToCheck) {
              return hierarchy[rootToCheck.name] ? true : false;
            }
          })
          //maps all functions to instance and private/static variables using apply
          //Ignore flag ignores initialization property when extend function is used
          let waitingForInits = [];

          //binds the private, protected, public and static variables together to allow user to use in functions
          const boundContext = Object.assign({}, { public: deepAssign(newInst) },
            _staticRef ? { static: deepAssign(_staticRef) } : {},
            { private: deepAssign(_private) },
            _protected ? { protected: deepAssign(_protected) } : {});

          if ((flag & IGNORE_INIT) != IGNORE_INIT) {
            if ((flag & TRACKING_FLAG) === TRACKING_FLAG) {
              //allows for tracking individual instances for referencing
              const id = cuid();
              Object.defineProperty(newInst, 'instanceID', {
                value: id,
                writeable: false,
                enumerable: true,
                configurable: false
              });
            }
            //check inits for multiple initializaitons from inherited parents
            //creates copy of instance so we don't add static or private variables
            //if length of array is greather than zero, begin initializing sequenced functions for user
            if (Root.init) {
              if (Root['init'] instanceof Array) {
                Root['init'].forEach((newStatic, i) => {
                  for (let prop in newStatic) {
                    if (newStatic[prop] instanceof Function) {
                      const returnValue = newStatic[prop].call(Object.assign({}, { public: deepAssign(newInst) },
                        _staticRef || Root['static'][i] ? { static: deepAssign(i === 0 ? _staticRef : Root['static'][i]) } : {},
                        _private ? { private: deepAssign(_private) } : {},
                        _protected ? { protected: deepAssign(_protected) } : {},
                        { instance: deepAssign(newInst) }));
                      if (returnValue instanceof Promise) {
                        waitingForInits.push(returnValue);
                      }
                    }
                  }
                });
              } else {
                for (let prop in Root['init']) {
                  if (Root['init'][prop] instanceof Function) {
                    const returnValue = Root['init'][prop].call(Object.assign({}, { public: deepAssign(newInst) },
                      _staticRef ? { static: deepAssign(_staticRef) } : {},
                      _private ? { private: deepAssign(_private) } : {},
                      _protected ? { protected: deepAssign(_protected) } : {},
                      { instance: deepAssign(newInst) }));

                    if (returnValue instanceof Promise) {
                      waitingForInits.push(returnValue);
                    }
                  }
                }
              }
            }
          }
          //sets ready variable for instance to wait for promises to finish
          if (waitingForInits.length > 0) {
            const initPromise = Promise.all(waitingForInits);
            Object.defineProperty(newInst, 'ready', {
              value: initPromise,
              writeable: false,
              configurable: false,
              enumerable: false
            });
          }
          if (_private) {
            for (let prop in _private) {
              if (_private[prop] instanceof Function) {
                let tempFn = _private[prop];
                _private[prop] = function () {
                  const returnValue = tempFn.apply(boundContext, arguments);
                  //keeps the object from being manipulated externally
                  if(returnValue) {
                    return deepCopy(returnValue);
                  }
                  else {
                    return returnValue;
                  }
                }
              }
            }
          }
          if (_protected) {
            for (let prop in _protected) {
              if (_protected[prop] instanceof Function) {
                let tempFn = _protected[prop];
                _protected[prop] = function () {
                  const returnValue = tempFn.apply(boundContext, arguments);
                  //keeps the object from being manipulated externally
                  if(returnValue) {
                    return deepCopy(returnValue);
                  }
                  else {
                    return returnValue;
                  }
                }
              }
            }
          }
          const instProps = Object.getOwnPropertyNames(newInst);
          if (instProps.length > 0) {
            instProps.forEach(name => {
              if (newInst[name] instanceof Function) {
                let tempFn = newInst[name];
                newInst[name] = function () {
                  const returnValue = tempFn.apply(boundContext, arguments);
                  //keeps the object from being manipulated externally
                  if(returnValue) {
                    return deepCopy(returnValue);
                  }
                  else {
                    return returnValue;
                  }
                }
              }
            });
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
        } else {
          throw new TypeError('Argument must be an object for create');
        }
      }, toggle(optionName) {
        //allows toggling of previously defined options for easier management
        if (optionName && typeof optionName === 'string') {
          switch (optionName) {
            case 'singleton':
              flag = flag ^ SINGLETON_FLAG;
              break;
            case 'tracking':
              flag = flag ^ TRACKING_FLAG;
              break;
            default:

              return flag;
          }
        } else {
          throw new TypeError('Option name needs to be a string. Either use tracking or singleton');
        }
      }
    });
    const inst = new Encaged();
    Object.defineProperty(inst, 'name', { value: Root.name, writable: false, configurable: false })
    return inst;
  } else {
    throw new TypeError('Must use a Object as an argument');
  }
}

module.exports = encage;