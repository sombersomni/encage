# Encage - Protect Your Instances

Encage allows users to create objects with private variables by emulating C++'s classes. Easily manage your instances and hide your information with minimal effort
```js
const User = {
  public: { name: "placeholder", showPassword() { return this.private.secret } },
  private: { secret: "*" },
}
const eUser = encage(User, {tracking: true}); //tracks instances created automatically by setting tracking to true
const dash = eUser.create({ name: "Dash", secret: "test"});
console.log(dash.private.secret); //throws a TypeError: Cannot read property 'secret' of undefined
console.log(dash.showPassword()) //Prints "test"!
```
## Features

- Create instances with private and protected variables
- Allows you to track instances automatically
- Emulates c++ Classes
- Supports the [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) API
- Create Singletons
- More inheritance control
- Toggle tracking of instances
- Protects your code

## Getting Started

### Installing
You can use npm to install this package. To run test you will need to download [mocha](https://mochajs.org/#installation) and [chai](https://www.chaijs.com/guide/installation/) for you devDependancies!
```
npm install encage
```
## Creating a Encage Object
In javascript, you would typically use a constructor to create a Class. However, javascript Classes create instances that expose your variables publically, allowing for progammers or users to tamper with the code in unforseeable ways. To fix this problem, you can create an Encage Object which mimics a Class and gives you extra features for easier variable management. 
```js
const eObject = encage({});
console.log(eObject) //Prints { static: {} }
```
It's as simple as that. Encage takes a javascript object as an argument. 

## Basic Usage

### Setting Up Object
Below is a basic example of How to set up your Base Class. You can only use objects to create you configuration for Class. DO NOT USE CONSTRUCTORS, CONSTRUCTOR INSTANCES OR CLASSES!
```js
const Account = {
    name: "Account",
    public: { //sets all your public variables
        name: "customer",
        id: 0,
        getBalance() { return this.protected.balance }, // use functions internally to retrieve your information
        setBalance(balance) { this.protected.balance = balance },
        setName(name) { this.public.name = name }, //must use this.public or changes may not take effect
    },
    private: { sensitiveData: {} }, //sets private variables for this Class only
    protected: { accountNumber: 1112223333, password: "test", address: '' }, //sets private variables for this and inherited Objects
    static: { numOfAccounts: 0, customerIDs: [], premiumMembers: 0 }, //sets variables used by Encaged Object for tracking instances
    init: { //allows you to initialize functions immediately when instance is created similar to constructors
        trackAccounts() {
            this.static.numOfAccounts++;
            this.static.customerIDs.push(this.instance.id);
        }
    }
}
const eAccount = encage(Account); //create Encage Object aka your Base Class
console.log(eAccount) //Prints out { static: { numOfAccounts: 0, customerIDs: [], premiumMembers: 0 } }
```
As you can see, you can start your class off with generic values which can be changed later with each new instance. 
Here's a break down for each property
### Object Properties

* **Public:**
    This holds all your variables and functions that you want to be publically accessible for every instance object you create. This is similar to creating normal variables, however we use the naming convention below to keep the code more manageable. 
```js
  const User = {
    public: { 
        name: "user", 
        setName(name){ this.public.name = name },
        getName() { return this.public.name }
    }
}
```
* **Private:**
  This holds all your vairables you want to remain hidden and safe. No one can access this variable, not even you, unless you create a public function to retreive the variables value.

```js
const User = {
    public: { getPrivateAddress() { return this.private.address } },
    private: { address: '555 Fake Dr' }
}
```
  Private variables can not be passed down to inherited Classes! You may want to use the Protected property if you want this feature.

* **Protected:**
  Protected variables work just like private variables, except they can be passed down to Classes that inherit from this Encage Object. 

* **Static:**
  These variables are used to keep track of your instances from your Base Class (Encage Object). They are publically available from the Base Class. Instances can also read and write data in static variables. This isn't exactly like C++, but it allows you to keep open communicaton with your Encage Object. In addition, Encage Objects can only use static properties or properties attached to the object after its creation. It has no access to instance properties. Here's an example below.
```js
const Shape = {
    static: { numOfShapes: 0, countShapes() { this.static.numOfShapes++ } }
}
const eShape = encage(Shape); //creates Encage Object
const shape = eShape.create(); //creates an instance
eShape.static.countShapes();
console.log(eShape.static.numOfShapes) //Prints out 1
```
In the example above, we increase the count after an instance is made. However, we would have to run countShapes() every time we want to increment our numOfShapes. There is a better way to do this. 

* **Init:**
    This property allows you to add methods that you can deploy every time an instance is create. This is great for keeping track of how many instances you've created, do quick alterations to variables or do async calls to a server to receive data to assign to your instances or private/protected variables. Below is a better approach to designing a counter for objects created using the Shapes example.
   
```js
const Shape = {
    static: { numOfShapes: 0 },
    init: { countShapes() { this.static.numOfShapes++ } 
    }
}
    const eShape = encage(Shape);
    const shape = eShape.create();
    console.log(eShape.static.numOfShapes) //prints out 1
```
The code is now easier to manage. Once the init functions are completed, they are no longer used until the next instance is created. Keep this in mind if you need to use this function throughout your code. Init also can not take any arguments in its function since it runs internally in the Encage Object!

### Creating Instances
You can create instances using the create function provided by your Encage Object. This code extends the Account example above.
```js
    const Account = {...}; //code is above under Setting Up Object
    const eAccount = encage(Account);
    //you can set your values for private protected and public using this syntax
    const newAccount = eAccount.create({ 
        name: "Rick Sanchez", 
        id: 0324, 
        accountNumber: 2222222, 
        address: '123 Wubaluba Dr' });
    console.log(newAccount);
    //Prints out
    /* { name: 'Rick Sanchez',
        id: 212,
        getBalance: [Function],
        setBalance: [Function],
        setName: [Function] } */
    
```
The create method takes an object containing the values that will overwrite the defaults set in our Account object. This allows you to enter your property values without regarding the order, allowing for easier intergration with databases and apis that use jsons. The properties must exist in your Base object or the values will not be read! Make sure to also keep your property names unique across your public and private vairables, or it will cause overlap in value assignment.
```js
//DO NOT DO THIS
const User = { public: { name: 'player' }, private: { name: 'secret' } }
const eUser = encage(User);
const user = eUser.create({ name: 'Scarlo' });
//INSTEAD DO THIS
const User = { public: { username: 'player' }, private: { name: 'secret' } }
const eUser = encage(User);
const user = eUser.create({ username: 'Scarlo', name: 'Scarlett Johansson' });
console.log(user); //Prints out { username: 'Scarlo' }
//Scarlett Johansson is not shown because its private!!
```
You should also be aware that any defaults that exist in your Encage Object will be transfered to your instance, so make sure to use well defined default values.

### Initializing Instances
The init property allows you to control the flow of how your instance is initialized. You have access to the public,private, protected and static variables during this process.
```js
 const BankAccount = {
    init: {
        addClient: function () {
            this.static.numOfAccounts++;
            this.private.balance *= this.private.interest;
            this.static.clientNames[this.public.id] = this.public.name
            this.static.clients.push(this.instance);
        }
    },
    static: {
        numOfAccounts: 0,
        clientNames: {},
        clients: []
    },
    public: {
        name: "",
        id: 0,
        setName(name) {
            this.public.name = name;
            //helps update your static list
            this.static.clientNames[this.public.id] = this.public.name
        }
    },
    private: { interest: 1.2, balance: 0 }
}
const eBankAccount = encage(BankAccount);
const account = eBankAccout.create({ name: "Tony Stark" , id: 1 });
console.log(eBankAccount);
/* { static:
   { numOfAccounts: 1,
     clientNames: { '1': 'Tony Stark' },
     clients: [ [Object] ] } } */
account.setName("Iron Man"); 
console.log(eBankAccount) ;
/*{ static:
   { numOfAccounts: 1,
     clientNames: { '1': 'Iron Man' },
     clients: [ [Object] ] } } */
```
Managing your Instances is easier than ever!

### Controling Private Variables
Private variables are not accessible in your instances, so you must create functions in your Base Class to tamper with them. You can also create private functions!
```js
const Employee = {
    public: {
        name: '',
        getSSN(password) { return this.private.checkPassword(password) ? this.private.ssn : null },
        setSSN(password, ssn) { this.private.ssn = this.private.checkPassword(password) ? ssn : this.private.ssn }
    },
    private: {
        ssn: 0,
        password: '1234',
        checkPassword(password) { return password == this.private.password }
    }
}
const eEmployee = encage(Employee);
const worker = eEmployee.create({ name: 'Clark Kent', ssn: 55555555, password: 'superman' });
console.log(worker) //Prints out { name: 'Clark Kent', getSSN: [Function], setSSN: [Function] }
console.log(worker.getSSN('zod')) //Prints out null
console.log(worker.getSSN('superman')) //Prints out 55555555
worker.setSSN('superman', 222222222)
console.log(worker.getSSN('superman')) //Prints out 222222222
```
How is the private even accessible? Any function placed in your Base Class is given global access to all your variables through the this keyword. **_DO NOT RETURN THIS OR YOU WILL EXPOSE YOUR INSTANCE AND ALL ITS PRIVATE VALUES__**.

### Working with Promises
This is a basic example, but you may want to take basic steps to secure your code. You should use the **_init_** property and add a function that can securely set up the private variable when the instance intializes.
```js
const Employee = {
    public: {
        name: "n/a",
        company: "global inc",
        getPersonalData(password) { return password == "test" ? this.private.personalData : null },
        getEarnings() { return this.private.earnings };
    },
    private: { personalData: {}, earnings: [] },
    init: {
        assignSSN() {
            return fetch('./getData') //must return a promise or it will work properly
            .then(response => response.json())
            .then(data => { this.private.personalData = data } );
        },
        fetchEarnings: async function () {
            try {
                const response = await axios.get('/earnings');
                this.private.earnings = response.data.earnings;
            } catch (err) {
                console.log(err);
            }
        }
    }
}
const eEmployee = encage(Employee);
const worker = eEmployee.create({ name: "Homer", company: "Duff" });
worker.ready.then(() => { 
    console.log(worker.getPersonalData());
    console.log(worker.getEarnings());
    }); //Prints out private data!
```
This works incredibly well when working with databases. You must use the **_ready_** property of your instance so you can continue where your promises left off.

## Inheritance

### Using extend
Encage objects come with another function called extend, which allows you to inherit properties from the Base Class.

```js
const Character = { public: { name: '', type: 'generic' }, private: { inventory: [] }};
const Enemy = { public: { type: 'enemy' } };
const Slime = { public: { description: 'a gelatinous creature' }};
const eCharacter = encage(Character);
const eEnemy = eCharacter.extend(Enemy);
const eSlime = eEnemy.extend(Slime);
const slime = eSlime.create({ name: "silver slime" });
console.log(slime); 
/* Prints out
{ type: 'enemy',
  description: 'a gelatinous creature',
  name: 'silver slime' } */
```
This works like normal inheritance. The newest Encage Object will outweight all other properties, and any properties left are derived from the parent.
You can also manage the names of your Encage Classes by using the name property. Otherwise, Encage handles labeling names internally.
```js
const Enemy = { name: "Enemy", public: { type: 'enemy' } };
```

### Using instanceOf
Because we are using objects, we lose the ability to check if instances belong to a Class. Luckily, instances come with an instanceOf function that solves this problem!
```js
console.log(slime.instanceOf(eCharacter)) //Prints out true
console.log(slime.instanceOf(eEnemy)) //Prints out true
```

## Managing Instances
Encage makes it even easier to manage your instances. Set the **tracking** option to true when creating a Class and encage will keep track of all your instances automatically, no matter how deep your inheritance chain goes!
```js
const NPC = { public: { showSecret() { return this.private.secret } }, private: { secret: '' } }
const eNPC = encage(NPC, { tracking: true });
eNPC.createTownsPeople = function (num) {
    for (let i = 0; i < num; i++) {
        this.create({ name: "towney"});
    }
}
eNPC.createTownsPeople(2);
console.log(eNPC);
/* Prints out
{ static:
   { instances:
      { cjuup703e000fp4v10w9o42o0: [Object],
        cjuup703e000gp4v15run1r02: [Object] },
     numOfInstances: 2 },
  createTownsPeople: [Function] }
*/
```
Each instance is assigned an id and is stored into a hash table for quick referencing. You can access the id using the **instanceID** property given to the object.
```js
const eUser = encage(User, { tracking : true });
const user = eUser.create({ name: "sombersomni" });
console.log(user.instanceID); //Prints out cjuw16bky00002kv16bjx0fbm
```

The Encage Object keeps the order in which the instances were initialized and also the total number of instances. The **_extend_** method also comes with the tracking option. You can also toggle this tracking feature on and off whever you need it. 
```js
const npc1 = eNPC.create({ name: 'Shopkeeper' });
eNPC.toggle('tracking'); //turns it off
const npc2 = eNPC.create({name : 'Customer' });
eNPC.toggle('tracking'); //turns it back on
const npc3 = eNPC.create({name : 'Potion Master' });
console.log(eNPC.static.numOfInstances) //Prints out 2
```

### Creating a Singleton
Singletons are Classes that can create only one instance. Encage allows you to create singletons by setting the **singleton** property to true.
```js
const options = { singleton: true };
const Earth = { public:{ name: "Earth" } };
const eEarth = encage(Earth, options);
const earth = eEarth.create();  
console.log(earth) //Prints out { name: 'Earth' }
const earth2 = eEarth.create();
console.log(earth2) //Prints out null
const earth3 = eEarth.create();
console.log(earth3) //Prints out null
```
You can also toggle this feature on and off using the toggle function provied by the Encage Object.
```js
eEarth.toggle("singleton");
```
### Controlling Init
The methods you use inside of a Base Class's init property will also be used by inherited Classes by default. To turn this feature off, you can set the **allowInit** to false in your extend function.
```js
const eCircle = eShape.extend(Circle, { allowInits: false });
``` 
you can also control which init functions you want the inherited Class to use when creating instances!
```js
const Shape = {
    init: {
        countShapes() {},
        ignoredFunc() {}
        ...
}
const Square = {...}
const eShape = encage(Shape);
const eSquare = eShape.extend(Square, { allowInits: ["countShapes"] });
```

## License

This project is licensed under the MIT License.

## Thank Yous
Thank you to Eric Elliott for creating cuid. The automatic iding wouldn't be possible without his [cuid](https://github.com/ericelliott/cuid) library.
