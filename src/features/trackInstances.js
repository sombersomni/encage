function trackInstances() {
    this.static.instances[this.instance.instanceID] = this.instance;
    this.static.numOfInstances++;
    return;
}
module.exports = trackInstances;