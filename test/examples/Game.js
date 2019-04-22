const Character = {
    name: 'Character',
    static: {
        numOfCharacters: 0,
        trackCharacters() {
            this.static.numOfCharacters++;
        },
        allDescriptions: {},
        clearAll() {
            this.static.numOfCharacters = 0;
            this.static.allDescriptions = {};
        }
    },
    init: {
        countCharacters: function () {
            this.static.trackCharacters();
        },
        getDescriptions() {
            this.static.allDescriptions[this.type] = this.info.description;
        }
    },
    public: {
        name: "Noname",
        health: 100,
        type: 'generic',
        position: {
            x: 0,
            y: 0
        },
        info: {
            description: "this is a character"
        },
        powers: [{ attack: 100 }, { attack: 100 }],
        attack(enemy) {
            enemy.takeDamage(this.powers[0].attack);
        },
        heal() {
            this.health += 5;
        },
        takeDamage(damage) {
            this.health -= damage;
        }
    },
    protected: {
        backpack: {
            potions: {
                amount: 5,
                power: 40
            }
        },
        collisionFlag: 0,
        dialogueOptions: ["You are very friendly"],
        dialogue() {
            return "hi, my name is " + this.name;
        }
    }
}

const Player = {
    name: 'Player',
    public: {
        type: 'player',
        jump() {
            this.position.x += 10;
        }
    }
}

const Enemy = {
    name: 'Enemy',
    static: {
        enemyCount: 0,
        allEnemies: [],
        clearAll() {
            this.static.enemyCount = 0;
            this.static.allEnemies = [];
        }
    },
    init: {
        trackEnemies() {
            this.static.enemyCount++;
            this.static.allEnemies.push(this.instance);
        }
    },
    public: {
        info: {
            description: "this is an enemy"
        }
    },
    protected: {
        calculatePath() {
            return this.position.x += 10 * 2;
        }
    }
}

const Slime = {
    static: {
        numOfSlimes: 0,
        trackSlimes: [],
        clearAll() {
            this.static.numOfSlimes = 0;
            this.static.trackSlimes = [];
        }
    },
    init: {
        trackSlimes() {
            this.static.numOfSlimes++;
            this.static.trackSlimes.push(this.instance);
        }
    },
    public: {
        color: "green",
        type: "slime",
        info: { description: 'Slime is a gelatinous creature from the sewer' }
    },
    protected: {
        dialogueOptions: ["blraaaaahhh", "*Squish*"],
    }
}

module.exports = { Character, Player, Slime, Enemy };