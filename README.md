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
You can use npm to install this package. To view test you will need to download [mocha](https://mochajs.org/#installation) and [chai](https://www.chaijs.com/guide/installation/) for you devDependancies!
```
npm install encage
```
##Creating a Encage Object
In javascript, you would typically use a constructor to create a Class. However, javascript Classes create instances that expose your variables publically, allowing for progammers or users to tamper with the code in unforseeable ways. To fix this problem, you can create an Encage Object which mimics a Class and gives you extra features for easier variable management. 
```js
const eObject = encage({});
console.log(eObject) //Prints { static: {} }
```
It's as simple as that. Encage takes a javascript object as an argument. 
###Setting Up Object
Below is a basic example of How to set up your Base Object.
```js
const Account = {
  name: "Account" //sets name for Base Object so Encage can keep references for inheritance
  public: { //sets all your public variables
    name: "customer", 
    id: 0,
    getBalance(){ return this.protected.balance }, // use functions internally to retrieve your information
    setBalance(balance){ this.protected.balance = balance }
  },
  private: { sensitiveData : {}, weeklyReports : [] }, //sets private variables for this Class only
  protected: { accountNumber: 1112223333, password: "test", balance: 0 }, //sets private variables for this and inherited Objects
  static: { numOfAccounts: 0, customerIDs : [], premiumMembers: 0 }, //sets variables used by Encaged Object for tracking instances
  init: { //allows you to initialize functions immediately when instance is created similar to constructors
    trackAccounts() {
      this.static.numOfAccounts++;
      this.static.customerIDs.push(this.instance.id);
  }
```
### And coding style tests

Explain what these tests test and why

```
Give an example
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
