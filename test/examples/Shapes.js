const Shape = {
    public: {
        width: 10,
        height: 10,
        name: '',
        position: { x: 0, y: 0 },
        move: function () {
            this.position.x++;
        },
        checkID: function () {
            return this.private.id;
        },
        getMatrix: function () {
            return this.protected.matrix;
        },
        setMatrix: function (number) {
            this.protected.matrix.push(number);
        }
    },
    init: {
        countShapes: function () {
            this.static.numOfShapes++;
        },
        addShape: function () {
            this.static.shapes.push(this.instance);
        }
    },
    static: {
        numOfShapes: 0,
        shapes: []
    },
    private: {
        id: 201232131
    },
    protected: {
        matrix: [0, 0, 2],
        checkCollision: function (shape) {
            if (this.position.x === shape.position.x)
                return 1;
            else return 0;
        }
    }
}

const Square = {
    public: {
        width: 15,
        height: 15,
        sides: 4,
        flat: true,
        area() {
            return this.height * this.width;
        },
        hit(shape) {
            return this.protected.checkCollision(shape);
        }
    }, 
    static: {
        numOfSquares: 0
    }, 
    init: {
        countSquares: function () {
            this.static.numOfSquares++;
        }
    }
}

const Circle = {
    public: {
        radius: 10,
        area() {
            return Math.pow(this.radius, 2) * Math.PI;
        }
    }, 
    static: {
        circleCount: 0
    }, 
    init: {
        countCircle: function () {
            this.static.circleCount++;
        }
    }
}

const Ellipse = {
    public: {
        epsilon: 1,
        width: 24,
        height: 99,
        area() {
            return Math.pow(this.radius, 2) * this.width;
        }
    },
    static: {
        ellipseCount: 0
    },
    init: {
        countEllipse: function () {
            this.static.ellipseCount++;
        }
    },
    private: {
        test: 2
    }
}

module.exports = { Shape, Square, Circle, Ellipse };