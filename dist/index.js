"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var checkObject = require('./helpers/checkObject');

var separateStatics = require('./helpers/separateStatics');

var checkInit = require('./helpers/checkInit');

var deepFreeze = require('./helpers/deepfreeze');

var deepAssign = require('./helpers/deepAssign');

var mapRootToChild = require('./helpers/mapRootToChild');

var _require = require("./helpers/flags"),
    SINGLETON_FLAG = _require.SINGLETON_FLAG,
    INHERITANCE_FLAG = _require.INHERITANCE_FLAG,
    IGNORE_INIT = _require.IGNORE_INIT,
    TRACKING_FLAG = _require.TRACKING_FLAG;

var cuid = require('cuid'); //this function is using closures to keep private variables and public variables intact and managable


var numOfEncageInstances = 0;

function encage(Parent) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    singleton: false,
    tracking: false
  };
  //keep track of the encage state for user specified options
  var state = {
    flag: 0,
    hierarchy: {}
  };
  var flag = state.flag,
      hierarchy = state.hierarchy;

  if (options == null || options == undefined) {
    options = {
      singleton: false,
      tracking: false
    };
  }

  if (_typeof(options) != 'object' || !(options.constructor === Object)) {
    throw new TypeError('You need to use an object for your options');
  }

  if (Parent.inherited) {
    //this is important for keeping inheritance through a prototype chain for infinite number of classes;
    flag = flag ^ INHERITANCE_FLAG;
    hierarchy = Object.assign({}, Parent.hierarchy);
    delete Parent.inherited;
    delete Parent.hierarchy;
  } //checks if Parent Object/Class is an object


  var isObject = Parent && _typeof(Parent) === 'object' && Parent.constructor === Object;

  if (isObject) {
    var Encaged = function Encaged() {
      this["static"] = {};

      if (Object.keys(_static.variables).length > 0) {
        for (var key in _static.variables) {
          this["static"][key] = _static.variables[key];
        }
      }

      if (Object.keys(_static.methods).length > 0) {
        for (var _key in _static.methods) {
          //binding to make sure the context is kept inside this class
          this["static"][_key] = _static.methods[_key].bind(this);
        }
      } //need to keep root attached to this static object;


      if ((flag & TRACKING_FLAG) === TRACKING_FLAG) {
        //will keep track of instances in order of creation
        this["static"].instances = {};
        this["static"].numOfInstances = 0;
      } //DO NO TOUCH


      if (Root['static'] instanceof Array) {
        Root['static'][0] = deepAssign(this["static"]);
      } else {
        Root['static'] = deepAssign(this["static"]);
      }
    };

    checkObject(Parent);

    if (options.tracking) {
      flag = flag ^ TRACKING_FLAG;
    }

    if (Parent['name'] && Parent['name'].length > 0) {
      hierarchy[Parent['name']] = true;
    } else {
      var name = 'encageId' + numOfEncageInstances;
      Parent['name'] = name;
      hierarchy[name] = true;
      numOfEncageInstances++;
    }

    var Root = Object.assign({}, Parent);

    if ((flag & TRACKING_FLAG) === TRACKING_FLAG) {
      //creates the tracking function and uses closures to keep track of the flag that belongs to derived root
      var trackInstances = function trackInstances() {
        if ((flag & TRACKING_FLAG) === TRACKING_FLAG) {
          if (!this["static"].instances || !this["static"].numOfInstances) {
            this["static"].instances = {};
            this["static"].numOfInstances = 0;
          }

          this["static"].instances[this.instance.instanceID] = this.instance;
          this["static"].numOfInstances++;
        }

        return;
      };

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
    } //makes sure init properties are all functions. 
    //Throws error if not a function


    if (Root['init']) {
      if (Root['init'] instanceof Array) {
        checkInit(Root['init'][0]);
      } else {
        checkInit(Root['init']);
      }
    } //creates static state for object


    var _static = {
      methods: {},
      variables: {}
    };

    if (Root['static']) {
      if (Root['static'] instanceof Array) {
        _static = separateStatics(Root['static'][0], _static);
      } else {
        _static = separateStatics(Root['static'], _static);
      }
    }

    Encaged.prototype = Object.assign({}, {
      extend: function extend(Child) {
        var extendOpts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
          allowInits: true,
          tracking: false
        };

        if (extendOpts == null || extendOpts == undefined) {
          extendOpts = {
            allowInits: true,
            tracking: false
          };
        }

        if (_typeof(extendOpts) != 'object' || !(extendOpts.constructor === Object)) {
          throw new TypeError('You need to use an object for your options');
        }

        var _extendOpts = extendOpts,
            allowInits = _extendOpts.allowInits; //allows the user to inherit from base class
        //inheritance flag is set to 2;

        if (Child && _typeof(Child) === 'object' && Child.constructor === Object) {
          checkObject(Child); //set global flag for new inherited encage object
          //turn on ignore intialization flag

          flag = flag ^ IGNORE_INIT;
          var tempInst = Object.assign({}, this.create());
          flag = flag ^ IGNORE_INIT;

          if ((flag & TRACKING_FLAG) === TRACKING_FLAG) {
            extendOpts.tracking = true;
          } //run instance and map it to temporary Child before adding inherited properties to it


          var savedName = '';

          if (Child['name']) {
            savedName = Child['name'];
            delete Child['name'];
          }

          var tempChild = Object.assign({}, tempInst, Child);
          Child['name'] = savedName; //makes sure public property is not empty

          if (!tempChild['public']) {
            tempChild['public'] = {};
          }

          Object.getOwnPropertyNames(tempChild).forEach(function (prop) {
            if (prop != 'private' && prop != 'protected' && prop != 'public' && prop != 'static' && prop != 'init') {
              //compounds temp props into public and deletes rest around object
              if (!tempChild['public']) {
                tempChild['public'][prop] = tempChild[prop];
              }

              delete tempChild[prop];
            } else {
              var value = tempChild[prop];

              if (_typeof(value) != 'object' || value.constructor != Object) {
                throw new TypeError("You must use an object when creating " + prop);
              }

              if (prop === 'static' || prop === 'init') {
                tempChild[prop] = [value];
              }
            }
          }); //mapping items from Root object to new child object

          tempChild = mapRootToChild(tempChild, Root, allowInits);
          return encage(Object.assign(tempChild, {
            name: savedName,
            inherited: true,
            hierarchy: hierarchy
          }), {
            tracking: extendOpts.tracking
          });
        } else {
          throw new TypeError('Argument must be an object for extend');
        }
      },
      create: function create() {
        var constructArgs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var createOpts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
          sealed: false,
          freeze: false
        };
        var _staticRef = this["static"];

        if (constructArgs === null || constructArgs === undefined) {
          constructArgs = {};
        }

        if (createOpts === null || createOpts === undefined) {
          createOpts = {
            sealed: false,
            freeze: false
          };
        }

        if (_typeof(createOpts) != 'object' || !(createOpts.constructor === Object)) {
          throw new TypeError('You need to use an object for your options');
        } //assign arguments from create to public and private set variables


        if (_typeof(constructArgs) === 'object' && constructArgs.constructor === Object) {
          var _ret = function () {
            var publicProps = {};
            var publicFuncs = {};
            var rootPublicProps = {};
            var filteredPublicProps = [];

            if (constructArgs) {
              if (Root["public"]) {
                filteredPublicProps = Object.keys(Root["public"]).filter(function (key) {
                  return !constructArgs[key];
                });
                Object.keys(constructArgs).forEach(function (prop) {
                  //assigns class arguments to public vars
                  var value = constructArgs[prop];

                  if (Root["public"] && Root["public"].hasOwnProperty(prop)) {
                    if (value instanceof Function) {
                      publicFuncs[prop] = value;
                    } else {
                      publicProps[prop] = {
                        value: value,
                        writeable: !createOpts.sealed || !createOpts.freeze,
                        configurable: !createOpts.freeze,
                        enumerable: true
                      };
                    } //assigns class arguments to public vars

                  } else if (Root["private"] && Root["private"].hasOwnProperty(prop)) {
                    Root["private"][prop] = value;
                  } else if (Root["protected"] && Root["protected"].hasOwnProperty(prop)) {
                    Root["protected"][prop] = value;
                  }
                });
              }
            } //setup for private and protected state
            //sealing private so it can't be deleted from the outside.


            var _private = Root["private"] ? Object.assign({}, Root["private"]) : {}; //sealing protected so it can't be deleted from the outside.


            var _protected = Root["protected"] ? Object.assign({}, Root["protected"]) : {}; //creates a new instance to configure before returning to user


            if (filteredPublicProps.length > 0) {
              filteredPublicProps.forEach(function (prop) {
                var value = Root["public"][prop];

                if (value instanceof Function) {
                  publicFuncs[prop] = value;
                } else {
                  rootPublicProps[prop] = {
                    value: value,
                    writeable: !createOpts.sealed || !createOpts.freeze,
                    configurable: !createOpts.freeze,
                    enumerable: true
                  };
                }
              });
            }

            var newInst = Object.create({}, Object.assign({}, rootPublicProps, publicProps));
            newInst = Object.assign({}, newInst, publicFuncs); //adds function to instance so it can check if it belongs to Root;

            Object.defineProperty(newInst, 'instanceOf', {
              value: function value(rootToCheck) {
                return hierarchy[rootToCheck.name] ? true : false;
              }
            }); //maps all functions to instance and private/static variables using apply
            //Ignore flag ignores initialization property when extend function is used

            if ((flag & IGNORE_INIT) != IGNORE_INIT) {
              if ((flag & TRACKING_FLAG) === TRACKING_FLAG) {
                //allows for tracking individual instances for referencing
                var id = cuid();
                Object.defineProperty(newInst, 'instanceID', {
                  value: id,
                  writeable: false,
                  enumerable: true,
                  configurable: false
                });
              } //check inits for multiple initializaitons from inherited parents
              //creates copy of instance so we don't add static or private variables
              //if length of array is greather than zero, begin initializing sequenced functions for user


              if (Root.init) {
                if (Root['init'] instanceof Array) {
                  Root['init'].forEach(function (newStatic, i) {
                    for (var prop in newStatic) {
                      if (newStatic[prop] instanceof Function) {
                        newStatic[prop].call(Object.assign({}, {
                          "public": deepAssign(newInst)
                        }, _staticRef || Root['static'][i] ? {
                          "static": deepAssign(i === 0 ? _staticRef : Root['static'][i])
                        } : {}, _private ? {
                          "private": deepAssign(_private)
                        } : {}, _protected ? {
                          "protected": deepAssign(_protected)
                        } : {}, {
                          instance: deepAssign(newInst)
                        }));
                      }
                    }
                  });
                } else {
                  for (var prop in Root['init']) {
                    if (Root['init'][prop] instanceof Function) {
                      Root['init'][prop].call(Object.assign({}, {
                        "public": deepAssign(newInst)
                      }, _staticRef ? {
                        "static": deepAssign(_staticRef)
                      } : {}, _private ? {
                        "private": deepAssign(_private)
                      } : {}, _protected ? {
                        "protected": deepAssign(_protected)
                      } : {}, {
                        instance: deepAssign(newInst)
                      }));
                    }
                  }
                }
              }
            }

            if (_private) {
              for (var _prop in _private) {
                if (_private[_prop] instanceof Function) {
                  (function () {
                    var tempFn = _private[_prop];

                    _private[_prop] = function () {
                      return tempFn.apply(Object.assign({}, {
                        "public": deepAssign(newInst)
                      }, _staticRef ? {
                        "static": deepFreeze(Object.assign({}, _staticRef))
                      } : {}, {
                        "private": deepAssign(_private)
                      }, _protected ? {
                        "protected": deepAssign(_protected)
                      } : {}), arguments);
                    };
                  })();
                }
              }
            }

            if (_protected) {
              for (var _prop2 in _protected) {
                if (_protected[_prop2] instanceof Function) {
                  (function () {
                    var tempFn = _protected[_prop2];

                    _protected[_prop2] = function () {
                      return tempFn.apply(Object.assign({}, {
                        "public": deepAssign(newInst)
                      }, _staticRef ? {
                        "static": deepFreeze(Object.assign({}, _staticRef))
                      } : {}, _private ? {
                        "private": deepAssign(_private)
                      } : {}, {
                        "protected": deepAssign(_protected)
                      }), arguments);
                    };
                  })();
                }
              }
            }

            var instProps = Object.getOwnPropertyNames(newInst);

            if (instProps.length > 0) {
              instProps.forEach(function (name) {
                if (newInst[name] instanceof Function) {
                  var tempFn = newInst[name];

                  newInst[name] = function () {
                    return tempFn.apply(Object.assign({}, {
                      "public": deepAssign(newInst)
                    }, _staticRef ? {
                      "static": deepFreeze(Object.assign({}, _staticRef))
                    } : {}, _private ? {
                      "private": deepAssign(_private)
                    } : {}, _protected ? {
                      "protected": deepAssign(_protected)
                    } : {}), arguments);
                  };
                }
              });
            } //keeps user from changing object properties. Based on user setting


            if (createOpts.sealed) {
              newInst = Object.seal(newInst);
            } else if (createOpts.freeze) {
              newInst = deepFreeze(newInst);
            } //flips singleton flag so it will no longer create instances


            if (options.singleton) {
              flag = flag ^ SINGLETON_FLAG;
              options.singleton = false;
              return {
                v: newInst
              };
            } else {
              return {
                v: (flag & SINGLETON_FLAG) === SINGLETON_FLAG ? null : newInst
              };
            }
          }();

          if (_typeof(_ret) === "object") return _ret.v;
        } else {
          throw new TypeError('Argument must be an object for create');
        }
      },
      toggle: function toggle(optionName) {
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
    var inst = new Encaged();
    Object.defineProperty(inst, 'name', {
      value: Root.name,
      writable: false,
      configurable: false
    });
    return inst;
  } else {
    throw new TypeError('Must use a Object as an argument');
  }
}

module.exports = encage;