function mapRootToChild(tempChild, Root, allowInits) {
    //maps the Root properties to the child and adds initilization array to child
    for (let setting in Root) {
        if (setting != 'private' && setting != 'name') {
            if (allowInits === true) {
                //maps static properties from Root objects
                if (setting === 'static') {
                    if (tempChild['static'] && tempChild['static'] instanceof Array) {
                        if (Root['static'] instanceof Array) {
                            let staticArr = Root['static'].slice();
                            staticArr.unshift(tempChild['static'][0]);
                            tempChild['static'] = staticArr;
                        } else {
                            tempChild['static'].push(Root['static']);
                        }
                    } else {
                        if (Root['static'] instanceof Array) {
                            let staticArr = Root['static'].slice();
                            staticArr.unshift({});
                            tempChild['static'] = staticArr;
                        } else {
                            tempChild['static'] = [{}, Root['static']];
                        }
                    }
                }
                else {
                    //maps the initilization process from Root object
                    if (setting === 'init') {
                        if (tempChild['init'] && tempChild['init'] instanceof Array) {
                            if (Root['init'] instanceof Array) {
                                let initArr = Root['init'].slice();
                                initArr.unshift(tempChild['init'][0]);
                                tempChild['init'] = initArr;
                            } else {
                                tempChild['init'].push(Root['init']);
                            }
                        } else {
                            if (Root['init'] instanceof Array) {
                                let initArr = Root['init'].slice();
                                initArr.unshift({});
                                tempChild['init'] = initArr;
                            } else {
                                tempChild['init'] = [{}, Root['init']]
                            }
                        }
                    } else {
                        tempChild[setting] = Object.assign({}, Root[setting], tempChild[setting]);
                    }
                }
            } else if (allowInits instanceof Array) {
                if (setting === 'init') {
                    let allowed = {};
                    if (Root['init'] instanceof Array) {
                        allowed = Root['init'].map(inits => {
                            let tempAllowed = {};
                            allowInits.forEach(each => {
                                if (inits.hasOwnProperty(each)) {
                                    tempAllowed[each] = inits[each];
                                }
                            });
                            return tempAllowed;
                        });
                    } else {
                        allowInits.forEach(each => {
                            if (Root['init'].hasOwnProperty(each)) {
                                allowed[each] = Root['init'][each];
                            }
                        });
                    }

                    if (tempChild['init'] && tempChild['init'] instanceof Array) {
                        if (allowed instanceof Array) {
                            allowed.unshift(tempChild['static'][0]);
                            tempChild['init'] = allowed;
                        } else {
                            tempChild['init'].push(allowed);
                        }
                    } else {
                        tempChild['init'] = [{}, allowed]
                    }
                } else if (setting === 'static') {
                    if (tempChild['static'] && tempChild['static'] instanceof Array) {
                        if (Root['static'] instanceof Array) {
                            let staticArr = Root['static'].slice().unshift(tempChild['static'][0]);
                            tempChild['static'] = staticArr;
                        } else {
                            tempChild['static'].push(Root['static']);
                        }
                    } else {
                        tempChild['static'] = [{}, Root['static']];
                    }
                } else {
                    tempChild[setting] = Object.assign({}, Root[setting], tempChild[setting]);
                }
            } else {
                if (setting != 'init' && setting != 'static') {
                    if(setting === 'public' || setting === 'private' || setting === 'protected' || setting === 'name') {
                        tempChild[setting] = Object.assign({}, Root[setting], tempChild[setting]);
                    }
                }
            }
        }
    }
    return tempChild;
}

module.exports = mapRootToChild;