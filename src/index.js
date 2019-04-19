var { SINGLETON_FLAG } = require("./helpers/flags");

//this function is using closures to keep private variables and public variables intact and managable
function encage(Parent, options = { singleton: false }) {
  //keep track of the encage state for user specified options
  let encageState = { flag: 0 };
  //checks if Parent Object/Class is an object or constructor class
  const isObject = (typeof Parent === 'object' && (Parent.constructor === Object));
  if (Parent && Parent instanceof Function || isObject) {
    let Root = {};
    if (isObject) {
      Root = Object.create(Parent);
    } else {
      try {
        tempRoot = Object.create(new Parent());
        Root = Object.create(Parent.prototype);
        Root['public'] = {};
        for (let prop in tempRoot) {
          if (prop != 'private' && prop != 'protected' && prop != 'public' && prop != 'static' && prop != 'init')
            Root['public'][prop] = tempRoot[prop];
          else Root[prop] = Object.assign({}, tempRoot[prop]);
        }
        for (let key in Parent.prototype) {
          Root['public'][key] = Parent.prototype[key];
        }
        Root = Object.freeze(Root);
      } catch (err) {
        console.warn("make sure to use a constructor function")
      }
    }
    //creates static state for object
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
      extend: function (Child, extendOpts = { allowInits: true }) {
        tempChild = Object.create(new Child());
        tempChild['public'] = {};
        for (let key in Child.prototype) {
          tempChild['public'][key] = Child.prototype[key];
        }
        const { allowInits } = extendOpts;
        for (let setting in Root) {
          if (setting != 'private') {
            if (allowInits === true) {
              tempChild[setting] = Object.assign({}, tempChild[setting], Root[setting]);
            } else if (allowInits instanceof Array) {
              if (setting === 'init') {
                allowed = {};
                for (let each in allowInits) {
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
        const newChild = Object.create(Child.prototype);
        return encage(Object.assign(newChild, tempChild), { inherited: true });
      },
      create: function (createOpts = {}) {
        //assign arguments from create to public and private set variables
        if ((typeof createOpts === 'object' && createOpts.constructor === Object)) {

          const publicProps = {};
          let filteredOutArgsPublic = [];
          if (createOpts) {
            filteredOutArgsPublic = Root.public ? Object.keys(Root.public).filter(prop => !createOpts.hasOwnProperty(prop)) : [];
            Object.keys(createOpts).forEach(prop => {
              //assigns class arguments to public vars
              if (Root.public && Root.public.hasOwnProperty(prop)) {
                const value = createOpts[prop];
                publicProps[prop] = {
                  value,
                  writeable: true,
                  enumerable: true
                }
                //assigns class arguments to public vars
              } else if (Root.private && Root.private.hasOwnProperty(prop)) {
                const value = createOpts[prop];
                Root.private[prop] = value;
              } else if (Root.protected && Root.protected.hasOwnProperty(prop)) {

              }
            });
          } else {
            filteredOutArgsPublic = Object.keys(Root.public);
          }
          //setup for private and protected state
          //sealing private so it can't be deleted from the outside.
          let _private = Object.seal(Object.assign({}, Root.private));
          //sealing protected so it can't be deleted from the outside.
          let _protected = Object.seal(Object.assign({}, Root.protected));
          //creates a new instance to configure before returning to user
          const initialize = () => {
            let newInst = {}
            if (options.inherited)
              newInst = Object.create(Parent, publicProps);
            else
              newInst = Object.create((isObject ? {} : Parent.prototype), publicProps);
            //maps all functions to instance and private/static variables using apply
            if (_private) {
              for (let prop in _private) {
                if (_private[prop] instanceof Function) {
                  const tempFn = _private[prop];
                  _private[prop] = function () {
                    return tempFn.apply(Object.assign({}, newInst,
                      Root.static ? { static: Object.seal(Object.assign({}, this)) } : {},
                      { private: Object.assign(_private) },
                      _protected ? { protected: Object.assign(_protected) } : {}), arguments);
                  }
                }
              }
            }
            if (Root.public) {
              filteredOutArgsPublic.forEach(prop => {
                if (Root.public[prop] instanceof Function) {
                  newInst[prop] = function () {
                    return Root.public[prop].apply(Object.assign({}, newInst,
                      Root.static ? { static: Object.seal(Object.assign({}, this)) } : {},
                      _private ? { private: Object.assign(_private) } : {},
                      _protected ? { protected: Object.assign(_protected) } : {}), arguments);
                  }
                } else {
                  newInst[prop] = Root.public[prop];
                }
              });
            }
            //creates copy of instance so we don't add static or private variables
            if (Root.init) {
              for (prop in Root.init) {
                if (Root.init[prop] instanceof Function) {
                  Root.init[prop].call(Object.assign({}, newInst,
                    Root.static ? { static: Object.assign(this) } : {},
                    _private ? { private: Object.assign(_private) } : {},
                    _protected ? { protected: Object.assign(_protected) } : {},
                    { _instance: Object.seal(newInst) }));
                }
              }
            }
            if (options.singleton) {
              encageState.flag = encageState.flag ^ SINGLETON_FLAG;
              options.singleton = false;
              return newInst;
            } else {
              return encageState.flag & 1 ? null : newInst;
            }
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
module.exports = encage;