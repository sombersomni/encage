function Shape() {
    this.width = 10;
    this.height = 10;
    this.name = '';
    this.position = { x: 0, y: 0 };
    this.init = {
        countShapes: function () {
            console.log("Add Shapes", this.static)
            this.static.numOfShapes++;
        },
        addShape: function () {
            this.static.shapes.push(this._instance);
        }
    }
    this.static = {
        numOfShapes: 0,
        shapes: []
    }
    this.private = {
        id: 201232131
    }
    this.protected = {
        checkCollision: function (shape) {
            if (this.position.x === shape.position.x)
                return 1;
            else return 0;
        }
    }
}

Shape.prototype = {
    move: function () {
        this.position.x++;
    }
}

function Square() {
    this.sides = 4;
    this.flat = true;
    this.static = {
        numOfSquares: 0
    }
    this.init = {
        countSquares: function () {
            this.static.numOfSquares++;
        }
    }
}
Square.prototype = {
    area() {
        return this.height * this.width;
    },
    hit(shape) {
        return this.protected.checkCollision(shape);
    }
}

function Circle() {
    this.radius = 10;
    this.static = {
        circleCount: 0
    }
    this.init = {
        countCircle: function () {
            this.static.circleCount++;
        }
    }
}
Circle.prototype = {
    area() {
        return Math.pow(this.radius, 2) * Math.PI;
    }
}

module.exports = { Shape, Square, Circle };