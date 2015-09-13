#pragma once

#include "swirly/instrument/DMXOutput.js"
#include "swirly/util/ForEach.js"

/** A Bank is a named collection of instrument instances. */
Instrument.makeBank = function(show) {
    var bank = {},
        maxObjects = show.objects.maxclass,
        dmx = maxObjects.dmxusbpro,
        json = show.json.lights;

    if (! (json && json.definitions && json.instruments))
        throw 'No lighting instruments specified for show!';

    forEach(json.instruments, function(instrument, name) {
        var definitionName = instrument.definition || name.split('_')[0],
            definition = json.definitions[definitionName],
            multislider = maxObjects[instrument.multislider || name],
            output = Instrument.DMXOutput(instrument.offset, dmx, multislider);

        bank[name] = {definition: definition, output: output};
    });

    return bank;
};
