function encage(Parent) {
  //creates the static holder variables for main Class
  if (!(Parent instanceof Function) && !(Parent.isPrototypeOf(Object)))
    throw new TypeError('Must use a constructor Function or Object');

  const Root = {};
  if (Parent.isPrototypeOf(Object)) {
    Root = Object.freeze(Parent);
  } else {
    try {
      Root = Object.assign({}, new Parent());
      console.log(Root);
    } catch (err) {
      console.warn("make sure to use a constructor function")
    }
  }
  function Encaged() {
    if (Root instanceof Function) {
    } else if (Object.prototype.isPrototypeOf(Root) && Root.static != undefined) {
      for (let key in Root.static) {
        if (!(Root.static[key] instanceof Function)) {
          this[key] = Root.static[key]
        }
      }
    }
  }
  Encaged.prototype = {
    create: function () {
      //setup for public variables
      const publicProps = {};
      const privateProps = {};
      let filteredOutArgsPublic = [];
      let filteredOutArgsPrivate = [];
      if (arguments.length == 1 && arguments[0] instanceof Object && Object.keys(arguments[0]).length > 0) {
        filteredOutArgsPublic = Root.public != undefined? Object.keys(Root.public).filter(prop => !arguments[0].hasOwnProperty(prop)) : [];
        filteredOutArgsPrivate = Root.private != undefined? Object.keys(Root.private).filter(prop => !arguments[0].hasOwnProperty(prop)) : [];
        Object.keys(arguments[0]).forEach(prop => {
          if (Root.public != undefined && Root.public.hasOwnProperty(prop)) {
            const value = arguments[0][prop];
            publicProps[prop] = {
              value,
              writeable: true,
              enumerable: true
            }
          } else if (Root.private != undefined && Root.private.hasOwnProperty(prop)) {
            const value = arguments[0][prop];
            privateProps[prop] = value;
          }
        });
      }
      //setup for public methods
      let _private = { job: 'sports' };
      //creates a new instance to configure before returning to user
      const initialize = () => {
        let newInst = Object.create({}, publicProps);
        if( Root.public != undefined) {
          filteredOutArgsPublic.forEach(prop => {
            if (Root.public[prop] instanceof Function) {
              newInst[prop] = function () {
                return Root.public[prop].apply(
                  Object.assign(
                    {}, newInst,
                    Root.static != undefined ? { static: this } : {},
                    Root.private != undefined ? { private: Object.assign(_private) } : {}
                  ), arguments);
              }
            }
          });
        }
        //creates copy of instance so we don't add static or private variables
        const instCopy = Object.assign({}, newInst, Root.static != undefined ? { static: this } : {});
        if(Root._init != undefined) {
          Object.values(Root._init).forEach(fn => {
            fn.call(instCopy);
          })
        }
        return newInst;
      }
      return initialize();

    }
  }
  const inst = new Encaged();
  return inst;
}

//testing
const Person = {
  static: {
    numOfPeople: 0,
    allPeople: []
  },
  public: {
    name: 'Default Name',
    age: 214,
    hobbies: ['programming', 'math'],
    getJob: function () {
      return this.private.job;
    },
    setJob: function (job) {
      this.private.job = job;
    },
  },
  private: {
    job: 'Podcaster',
  },
  _init: {
    addPerson: function () {
      this.static.numOfPeople++;
      this.static.allPeople.push(this.name);
    }
  },
}
const EncagedPeople = encage(function () { });
console.log(EncagedPeople);
const xavier = EncagedPeople.create({ name: "Xavier", age: 10, job: 'sports' });
//if you dont use the object syntax above, make sure to
//add arguments in same order as you placed them in public
//const stark = EncagedPeople.create("Stark");
console.log(xavier);
// console.log(xavier.getJob());
// xavier.setJob('skater');
// console.log("new job", xavier.getJob());
// xavier.setJob('racer');
// console.log(xavier.getJob());
// console.log(EncagedPeople);

module.exports = encage;