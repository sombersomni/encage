function Earth() {
    this.population = 21424214;
    this.size = 35353035;
}
Earth.prototype = {
    description() {
        return "Big blue ball floating in space"
    }
}

module.exports = Earth;