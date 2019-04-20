"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var deepFreeze = require("./helpers/deepfreeze");

var deepAssign = require("./helpers/deepAssign");

var _require = require("./helpers/flags"),
    SINGLETON_FLAG = _require.SINGLETON_FLAG; //this function is using closures to keep private variables and public variables intact and managable


function encage(Parent) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    singleton: false
  };
  //keep track of the encage state for user specified options
  var encageState = {
    flag: 0
  }; //checks if Parent Object/Class is an object or constructor class

  var isObject = _typeof(Parent) === 'object' && Parent.constructor === Object;

  if (Parent && Parent instanceof Function || isObject) {
    var Encaged = function Encaged() {
      for (var _key2 in _static.variables) {
        this[_key2] = _static.variables[_key2];
      }

      for (var _key3 in _static.methods) {
        this[_key3] = this[_key3].bind(this);
      }
    };

    var Root = {};

    if (isObject) {
      Root = Object.create(Parent);
    } else {
      try {
        tempRoot = Object.create(new Parent());
        Root = Object.create(Parent.prototype);
        Root['public'] = {};

        for (var _prop in tempRoot) {
          if (_prop != 'private' && _prop != 'protected' && _prop != 'public' && _prop != 'static' && _prop != 'init') Root['public'][_prop] = tempRoot[_prop];else Root[_prop] = Object.assign({}, tempRoot[_prop]);
        }

        for (var key in Parent.prototype) {
          Root['public'][key] = Parent.prototype[key];
        }
      } catch (err) {
        console.warn("make sure to use a constructor function");
      }
    } //creates static state for object


    var _static = {
      methods: {},
      variables: {}
    };

    for (var _key in Root["static"]) {
      if (Root["static"][_key] instanceof Function) {
        if (_key != 'create') {
          _static.methods[_key] = Root["static"][_key];
        } else throw new Error("You can't overwrite the create method. Try using another method name or use _create");
      } else {
        _static.variables[_key] = Root["static"][_key];
      }
    }

    Encaged.prototype = Object.assign({}, {
      extend: function extend(Child) {
        var extendOpts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
          allowInits: true
        };
        //allows the user to inherit from base class
        tempChild = Object.create(new Child());
        tempChild['public'] = {};

        for (var _key4 in Child.prototype) {
          tempChild['public'][_key4] = Child.prototype[_key4];
        }

        let {allowInits} = extendOpts;
        for (var setting in Root) {
          if (setting != 'private') {
            if (allowInits === true) {
              tempChild[setting] = Object.assign({}, tempChild[setting], Root[setting]);
            } else if (allowInits instanceof Array) {
              if (setting === 'init') {
                allowed = {};
                for (var each in allowInits) {
                  if (Root['init'].hasOwnProperty(each)) {
                    allowed[each] = Root['init'][each];
                  }
                }

                tempChild[setting] = Object.assign({}, tempChild[setting], allowed);
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

        var newChild = Object.create(Child.prototype);
        return encage(Object.assign(newChild, tempChild), {
          inherited: true
        });
      },
      create: function create() {
        var constructArgs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var createOpts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
          sealed: false,
          freeze: false
        };

        //assign arguments from create to public and private set variables
        if (_typeof(constructArgs) === 'object' && constructArgs.constructor === Object) {
          //creates a new instance to configure before returning to user
          var initialize = function initialize() {
            var _ref = this;

            var newInst = {};
            if (options.inherited) newInst = Object.create(Parent, publicProps);else newInst = Object.create(isObject ? {} : Parent.prototype, publicProps); //maps all functions to instance and private/static variables using apply

            if (_private) {
              for (var _prop2 in _private) {
                if (_private[_prop2] instanceof Function) {
                  (function () {
                    var tempFn = _private[_prop2];

                    _private[_prop2] = function () {
                      return tempFn.apply(Object.assign({}, deepAssign(newInst), Root["static"] ? {
                        "static": Object.seal(Object.assign({}, _ref))
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
              for (var _prop3 in _protected) {
                if (_protected[_prop3] instanceof Function) {
                  (function () {
                    var tempFn = _protected[_prop3];

                    _protected[_prop3] = function () {
                      return tempFn.apply(Object.assign({}, deepAssign(newInst), Root["static"] ? {
                        "static": Object.seal(Object.assign({}, _ref))
                      } : {}, {
                        "private": deepAssign(_private)
                      }, {
                        "protected": deepAssign(_protected)
                      }), arguments);
                    };
                  })();
                }
              }
            }

            if (Root["public"]) {
              filteredOutArgsPublic.forEach(function (prop) {
                if (Root["public"][prop] instanceof Function) {
                  newInst[prop] = function () {
                    return Root["public"][prop].apply(Object.assign({}, deepAssign(this), Root["static"] ? {
                      "static": Object.seal(Object.assign({}, _ref))
                    } : {}, _private ? {
                      "private": deepAssign(_private)
                    } : {}, _protected ? {
                      "protected": deepAssign(_protected)
                    } : {}), arguments);
                  };
                } else {
                  newInst[prop] = Root["public"][prop];
                }
              });
            } //creates copy of instance so we don't add static or private variables


            if (Root.init) {
              for (prop in Root.init) {
                if (Root.init[prop] instanceof Function) {
                  Root.init[prop].call(Object.assign({}, deepAssign(newInst), Root["static"] ? {
                    "static": Object.assign(_ref)
                  } : {}, _private ? {
                    "private": deepAssign(_private)
                  } : {}, _protected ? {
                    "protected": deepAssign(_protected)
                  } : {}, {
                    _instance: Object.seal(Object.create(newInst))
                  }));
                }
              }
            }

            if (createOpts.sealed) {
              newInst = Object.seal(newInst);
            } else if (createOpts.freeze) {
              newInst = deepFreeze(newInst);
            } //flips singleton flag so it will no longer create instances


            if (options.singleton) {
              encageState.flag = encageState.flag ^ SINGLETON_FLAG;
              options.singleton = false;
              return newInst;
            } else {
              return encageState.flag & 1 ? null : newInst;
            }
          };

          var publicProps = {};
          var filteredOutArgsPublic = [];

          if (constructArgs) {
            filteredOutArgsPublic = Root["public"] ? Object.keys(Root["public"]).filter(function (prop) {
              return !constructArgs.hasOwnProperty(prop);
            }) : [];
            Object.keys(constructArgs).forEach(function (prop) {
              //assigns class arguments to public vars
              if (Root["public"] && Root["public"].hasOwnProperty(prop)) {
                var _value = constructArgs[prop];
                publicProps[prop] = {
                  value: _value,
                  writeable: true,
                  enumerable: true //assigns class arguments to public vars

                };
              } else if (Root["private"] && Root["private"].hasOwnProperty(prop)) {
                var _value2 = constructArgs[prop];
                Root["private"][prop] = _value2;
              } else if (Root["protected"] && Root["protected"].hasOwnProperty(prop)) {
                Root["protected"][prop] = value;
              }
            });
          } else {
            filteredOutArgsPublic = Object.keys(Root["public"]);
          } //setup for private and protected state
          //sealing private so it can't be deleted from the outside.


          var _private = Object.assign({}, Root["private"]); //sealing protected so it can't be deleted from the outside.


          var _protected = Object.assign({}, Root["protected"]);

          return initialize.call(this);
        } else throw new TypeError('Argument must be an object for create');
      }
    }, _static.methods);
    var inst = new Encaged();
    return inst;
  } else {
    throw new TypeError('Must use a constructor Function or Object');
  }
}

module.exports = encage;