#pragma once

#include "swirly/instrument/Instrument.js"
#include "swirly/util/Color.js"
#include "swirly/util/ForEach.js"
#include "swirly/util/Range.js"

Instrument.listenerMakers = {
    rgb: function(output) {
        return function(value, offset) {
            var rgb = Util.hsvToRgbRaw(value, 1.0, 1.0);
            output(rgb[0], offset);
            output(rgb[1], offset + 1);
            output(rgb[2], offset + 2);
        };
    },
};

Instrument.makeOutput = function(desc, lights) {
    var address = desc.light.split('.', 2),
        name = address[0],
        channel = address[1],
        instrument = lights[name],
        output = instrument.output,
        unscale = Range.DMX.fromJson(desc.range).select;

    return function(value, offset) {
        return output(channel + (offset || 0), unscale(value));
    };
};

Instrument.makeListeners = function(desc, lights) {
    if (!(desc instanceof Array))
        desc = [desc];
    return applyEach(desc, function(listener) {
        if (listener.constructor === String)
            listener = {light: listener};
        var output = Instrument.makeOutput(listener, lights);
        if (!desc.listener)
            return output;

        var maker = Instrument.listenerMakers[desc.listener];
        return maker(output, desc, lights);
    });
};

Instrument.makeProcessors = function(show) {
    if (!show.json.processors)
        throw 'No processors found!';

    return applyEach(show.json.processors, function(processor) {
        return applyEach(processor, function(desc) {
            var listeners = Instrument.makeListeners(desc, show.lights);
            return function(value, offset) {
                forEach(listeners, function(listener) {
                    listener(value, offset);
                });
            };
        });
    });
};
