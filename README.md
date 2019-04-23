# Encage

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
Below is a basic example of How to set up your Base Class. You can conly use objects to create you configuration for Class. DO NOT USE CONSTRUCTORS, CONSTRUCTOR INSTANCES OR CLASSES!
```js
const Account = {
    public: { //sets all your public variables
        name: "customer",
        id: 0,
        getBalance() { return this.protected.balance }, // use functions internally to retrieve your information
        setBalance(balance) { this.protected.balance = balance },
        setName(name) { this.public.name = name },
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
###Object Properties
* Public
  This holds all your variables and functions that you want to be publically accessable for every instance object you create. This is similar to creating normal variables, however we use this naming convention to keep the code more manageable. 

* Private
  This holds all your vairables you want to remain hidden and safe. No one can access this variable, not even you, unless you create a public function to retreive the variables value.
```js
const User = {
    public: { getPrivateAddress() { return this.private.address } },
    private: { address: '555 Fake Dr' }
}
```
  Private variables can not be passed down to inherited Classes! You may want to use the Protected property if you want this feature.

* Protected
  Protected variables work just like private variables, except they can be passed down to Classes that inherit from this Encage Object. 

* Static
  These variables are used to keep track of your instances from your Base Class (Encage Object). They are publically available from the Base Class, but can not be tampered with by instances. Instances can only read the data from static variables but cannot write to the variables. Here's an example below.
```js
const Shape = {
    static: { numOfShapes: 0, countShapes() { this.static.numOfShapes++ } },
    public: { shapeCounter() { this.static.numOfShapes++ } }
}
const eShape = encage(Shape);
const shape = eShape.create();
eShape.static.countShapes(); //this will work!
//notice that we dont need to use .public when dealing with functions for instance
shape.shapeCounter(); //this will not work!
console.log(eShape); //Prints out { static:{ numOfShapes: 1, countShapes: [Function: bound countShapes] } }
```
    In the example above, we increase the count after an instance is made. However, we would have to run countShapes() every time we want to increment our numOfShapes. There is a better way to do this. 

* Init
...This property allows you to add methods that you can deploy every time an instance is create. This is great for keeping track of how many instances you've created, do quick alterations to variables or do async calls to a server to receive data to assign to your instances or private/protected variables. Below is a better approach to creating a counter for objects created using the Shapes example. 
```js
const Shape = {
    static: { numOfShapes: 0 },
    init: { countShapes() { this.static.numOfShapes++ } }
    const eShape = encage(Shape);
    const shape = eShape.create();
    console.log(eShape.static.numOfShapes) //prints out 1
}
```
The code is now easier to manage. Once the init functions are completed, they are no longer used until the next instance is created. Keep this in mind if you need to use this function throughout your code. 

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
The create method takes an object containing the values that will overwrite the defaults set in our Account object. This allows you to enter your property values withou regarding the order, allowing for easier intergration with databases and apis that use jsons. The properties must exist in your Base object or the values will not be read! Make sure to also keep your property names unique across your public and private vairables, or it will cause overlap in value assignment.
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
```
## Deployment

Add additional notes about how to deploy this on a live system

## Built With

* [Dropwizard](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
* [Maven](https://maven.apache.org/) - Dependency Management
* [ROME](https://rometools.github.io/rome/) - Used to generate RSS Feeds

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Billie Thompson** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone whose code was used
* Inspiration
* etc
