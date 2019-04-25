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
        setDescriptions() {
            this.static.allDescriptions[this.public.type] = this.public.info.description;
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
        showPowers() {
            return this.public.powers;
        },
        attack(enemy) {
            enemy.takeDamage(this.powers[0].attack);
        },
        heal: function() {
            this.public.health += 5;
        },
        getHealth() {
            return this.public.health;
        },
        takeDamage(damage) {
            this.public.health -= damage;
        }, 
        deleteDescriptions() {
            this.static.allDescriptions = [];
        },
        testClearAll() {
            this.static.clearAll();
        },
        printAllDescriptions() {
            for (let type in this.static.allDescriptions) {
                console.log(type + " : " + this.static.allDescriptions[type] + "\n");
            }
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
        dialogue(choice) {
            choice = choice || Math.floor(Math.random() * this.protected.dialogueOptions.length - 1);
            return this.protected.dialogueOptions[choice];
        }
    }
}

const Player = {
    name: 'Player',
    public: {
        name: 'player',
        type: 'player',
        jump() {
            this.public.position.x += 10;
        }
    }
}
const NPC = {
    static: {
        numOfNPCs: 0
    },
    init: {
        countNPCs() {
            this.static.numOfNPCs++;
        }
    },
    public: {
        type: 'npc',
        id: 0,
        info: {
            description: "npc is default character"
        },
        talk() {
            return this.protected.dialogue();
        },
        testCount() {
            return this.private.decreaseCount();
        }
    },
    private: {
        decreaseCount() {
            this.static.numOfNPCs--;
            return this.static.numOfNPCs;
        }
    },
    protected: {
        dialogueOptions: ['You must be lost', 'the market is to the east', 'I lived here my whole life'],
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
            return this.public.position.x += 10 * 2;
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
const Villager = {
    public: {
        name: 'villager',
    },
    private: {
        secrets: {
            cheatCode: 0,
            password: 'holdoor'
        }
    }
}
module.exports = { Character, Player, Slime, Enemy, NPC, Villager };