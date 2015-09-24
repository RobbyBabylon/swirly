#pragma once

#include "swirly/show/Show.js"
#include "swirly/util/Dict.js"
#include "swirly/util/ForEach.js"

Show.makeInputs = function(show) {
    var callbackTable = show.callbackTable;

    return applyEachObj(show.json.inputs, function(desc) {
        var name = desc.name,
            help = name + ': ' + desc.help,
            ratio = Range.MIDI.fromJson(desc.range).ratio;

        function callback(value) {
            var cb = callbackTable[name];
            cb && cb(ratio(value));
        };

        return {name: name, help: help, callback: callback};
    });
};

Show.printInputs = function(inputs) {
    print('Inputs');
    forEachObj(inputs, function(input) {
        print('  ', input.help);
    });
    print();
};