var chai = require('chai');
var encage = require('../src/index.js');
var expect = chai.expect;

//test objects and constructors
const { Character, Player, Slime, Enemy } = require('./examples/Game');
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
        eEnemy.intializeEnemy = function ( ) {
            let enemies = [];
            for(let i = 0; i <= 2; i++) {
                const randomHealth = Math.floor(Math.random() * 100 + 50);
                enemies.push(this.create({ name: "generic enemy", health: randomHealth }));
            }
            return enemies;
        }
        console.log(eEnemy.intializeEnemy());
    });
})