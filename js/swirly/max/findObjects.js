#ifndef __FINDOBJECTS
#define __FINDOBJECTS

#include "swirly/max/max.js"

Max.foreach = function(f) {
    for (var i = Max.patcher.firstobject; i; i = i.nextobject)
        f(i);
};

Max.findObjects = function(name, value) {
    var result = [];
    Max.foreach(function(i) { if (i[name] == value) result.push(i); });
    return result;
};

Max.findName = function(name) {
  return Max.findObjects('varname', name);
};

Max.findSubpatcher = function(name) {
  return Max.findName(name, container)[0].subpatcher();
};

Max.findClass = function(name) {
    return Max.findObjects('maxclass', name);
};

Max.findAllObjects = function(name, unique) {
    var result = {};
    Max.foreach(function(max_object) {
        var value = max_object[name];
        if (value !== undefined && value != '') {
            if (value in result) {
                var instances = result[value];
                if (unique) {
                    print('ERROR: duplicate value for :' +
                          name + ':' + value + ':');
                } else {
                    instances.push(max_object);
                }
            } else {
                result[value] = unique ? max_object : [max_object];
            }
        }
    });
    return result;
};

Max.findFirstObject = function(name) {
    var result = {};
    Max.foreach(function(max_object) {
        var value = max_object[name];
        if (value !== undefined && value != '')
            result[value] = max_object;
    });
    return result;
};

Max.findAll = function() {
    return {
        'maxclass': Max.findFirstObject('maxclass'),
        'varname': Max.findFirstObject('varname'),
    };
};

#endif  // __FINDOBJECTS
