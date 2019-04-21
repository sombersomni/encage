const Character = {
    static: {
        numOfCharacters: 0
    },
    init : {
        countCharacters: function () {
            this.static.numOfCharacters++;
        }
    },
    public: {
        name: "Noname",
        health: 100,
        position: {
            x: 0,
            y: 0
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
        backpack:{ 
            potions: {
                amount: 5,
                power: 40
            }
        },
        collisionFlag: 0
    }
}

const Player = {
    public: {
        jump() {
            this.position.x += 10;
        }
    }
}

const Enemy = {
    static: {
        enemyCount: 0,
        allEnemies: [],
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
           return this.position.x+= 10 * 2;
       }
    }
}

const Slime = {
    static: {
        numOfSlimes: 0,
        trackSlimes: [],
    },
    init: {
        trackSlimes() {
            this.static.numOfSlimes++;
            this.static.trackSlimes.push(this.instance);
        }
    },
    public: {
        color: "green"
    }
}

module.exports = { Character, Player, Slime, Enemy };