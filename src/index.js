//this function is using closures to keep private variables and public variables intact and managable
function encage(Parent) {
  const isObject = (typeof Parent === 'object' && Parent.constructor === Object);
  if (Parent && Parent instanceof Function || isObject) {
    let Root = {};
    if (isObject) {
      Root = Object.freeze(Parent);
    } else {
      try {
        Root = Object.assign({}, new Parent());
      } catch (err) {
        console.warn("make sure to use a constructor function")
      }
    }
    let _static = { methods: {}, variables: {} }
    for (let key in Root.static) {
      if ((Root.static[key] instanceof Function)) {
        _static.methods[key] = Root.static[key];
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
    console.log(_static);
    Encaged.prototype = Object.assign({}, {
      create: function () {
        //setup for public variables
        //assign arguments from create to public and private set variables
        if (arguments.length == 1 && arguments[0] instanceof Object && Object.keys(arguments[0]).length > 0) {
          Root
        }
        const publicProps = {};
        let filteredOutArgsPublic = [];
        if (arguments.length == 1 && arguments[0] instanceof Object && Object.keys(arguments[0]).length > 0) {
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
        }
        //setup for public methods
        let _private = Object.assign({}, Root.private);
        //creates a new instance to configure before returning to user
        const initialize = () => {
          let newInst = Object.create({}, publicProps);
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
              }
            });
          }
          //creates copy of instance so we don't add static or private variables
          if (Root._init) {
            for (prop in Root._init) {
              Root._init[prop].call(Object.assign({}, newInst,
                Root.static != undefined ? { static: this } : {},
                _private != undefined ? { private: Object.assign(_private) } : {}));
            }
          }
          return newInst;
        }
        return initialize();
      }
    }, _static.methods);
    const inst = new Encaged();
    return inst;
  } else {
    throw new TypeError('Must use a constructor Function or Object');
  }
}

module.exports = encage;