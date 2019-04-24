var chai = require('chai');
var encage = require('../src/index.js');
var expect = chai.expect;

//test objects and constructors
const { Character, Player, Slime, Enemy, NPC, Villager } = require('./examples/Game');
let eCharacter, eEnemy, ePlayer, eSlime;
describe('#encageInst', function () {
    before(function () {
        eCharacter = encage(Character);
        eEnemy = eCharacter.extend(Enemy);
        ePlayer = eCharacter.extend(Player);
        eSlime = eEnemy.extend(Slime);
    });
    afterEach(function () {
        eCharacter.static.clearAll();
        eEnemy.static.clearAll();
        eSlime.static.clearAll();
    })
    it('can check if its in the Root objects hierarchy', function () {
        const character = eCharacter.create({ name: "Perter Venkmen" });
        const enemy = eEnemy.create({ name: 'Gozer' });
        const player = ePlayer.create({ name: 'Egon' });
        const slimer = eSlime.create({ name: 'Slimer' });
        expect(eEnemy.name).to.equal("Enemy");
        expect(ePlayer.name).to.equal("Player")
        expect(character.instanceOf(eCharacter)).to.be.true;
        expect(enemy.instanceOf(eCharacter)).to.be.true;
        expect(enemy.instanceOf(eEnemy)).to.be.true;
        expect(player.instanceOf(eCharacter)).to.be.true;
        expect(player.instanceOf(eEnemy)).to.be.false;
        expect(slimer.instanceOf(eCharacter)).to.be.true;
        expect(slimer.instanceOf(eEnemy)).to.be.true;
        expect(slimer.instanceOf(eSlime)).to.be.true;
        expect(slimer.instanceOf(ePlayer)).to.be.false;
    });
    it('can use static to keep track of inherited variables', function () {
        const hero = ePlayer.create({ name: 'Hero', info: { description: 'The main character' } });
        const silverSlime = eSlime.create({ name: 'Silver Slime' });
        expect(eCharacter.static.allDescriptions['slime']).to.equal(silverSlime.info.description);
        expect(eCharacter.static.allDescriptions['player']).to.equal(hero.info.description);
    });
    it('can add functions to encage object for more functionality', function () {
        //create helper functions
        eEnemy.intializeEnemy = function () {
            let enemies = [];
            for (let i = 0; i <= 2; i++) {
                const randomHealth = Math.floor(Math.random() * 100 + 50);
                enemies.push(this.create({ name: "generic enemy", health: randomHealth }));
            }
            return enemies;
        }
        const enemies = eEnemy.intializeEnemy();
        expect(enemies.length).to.equal(3);
        expect(enemies[0].name).to.equal('generic enemy');
    });
    it('can create single player using singleton', function () {
        const SinglePlayer = encage(Player, { singleton: true });
        const readyPlayer = SinglePlayer.create({ name: "Pacman" });
        expect(readyPlayer).to.be.an('object');
        expect(readyPlayer.name).to.equal('Pacman');
        const newPlayer = SinglePlayer.create({ name: "Mrs. Pacman" });
        const newPlayer2 = SinglePlayer.create({ name: "Ghost" });
        expect(newPlayer).to.be.null;
        expect(newPlayer2).to.be.null;
        SinglePlayer.toggle('singleton');
        const newPlayer3 = SinglePlayer.create({ name: 'Added Player' });
        expect(newPlayer3).to.be.an('object');
        expect(newPlayer3.name).to.equal('Added Player');
    });
    it('can turn tracking on and off for individual objects', function () {
        const eNPC = ePlayer.extend(NPC, { tracking: true });
        eNPC.createTownsPeople = function (num) {
            for (let i = 0; i < num; i++) {
                this.create({ name: "towney", id: i });
            }
        }
        eNPC.createTownsPeople(5);
        eNPC.toggle('tracking');
        eNPC.createTownsPeople(5);
        expect(eNPC.static.numOfInstances).to.equal(5);
        eNPC.toggle('tracking');
        eNPC.createTownsPeople(5);
        expect(eNPC.static.numOfInstances).to.equal(10);
        const eVillager = eNPC.extend(Villager);
        const villager = eVillager.create({ name: 'Sandy' });
        expect(villager.instanceOf(eVillager)).to.be.true;
        expect(villager.instanceOf(eNPC)).to.be.true;
        expect(villager.instanceOf(ePlayer)).to.be.true;
        expect(eNPC.static.numOfInstances).to.equal(11);
        eVillager.toggle('tracking');
        const villager2 = eVillager.create({ name: 'Blazer' });
        expect(eVillager.static.numOfInstances).to.equal(1);
        expect(eVillager.static.instances[villager.instanceID].instanceID).to.equal(villager.instanceID);
        expect(eNPC.static.numOfInstances).to.equal(12);
        expect(eNPC.static.instances[villager2.instanceID]).to.deep.equal(villager2);
    });
    it('can change functions from create and cant change functions after', function () {
        let ghost = eCharacter.create({
            name: "ghost", type: "ghost", health: 200, heal: function () {
                this.public.health += 10 + this.protected.backpack.potions.power;
            }
        })
        ghost.heal();
        expect(ghost.health).to.equal(250);
        ghost.heal = function () {
            this.public.health += 2 * this.protected.backpack.potions.power;
        }
        expect(ghost.heal).to.throw(TypeError);
        ghost.heal = function () {
            this.health -= 20;
        }
        ghost.heal();
        expect(ghost.health).to.equal(230);
    });
    it('create a simple User example', function () {
        const User = {
            public: { name: "placeholder", showPassword() { return this.private.secret } },
            private: { secret: "*" },
        }
        const eUser = encage(User, {tracking: true});
        const dash = eUser.create({ name: "Dash", secret: "test"});
        expect(dash.private).to.be.undefined;
        expect(dash.showPassword()).to.equal("test") //Prints "test"!      
    });
})