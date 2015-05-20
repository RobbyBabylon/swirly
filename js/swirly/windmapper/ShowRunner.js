#pragma once

#include "swirly/max/findObjects.js"
#include "swirly/util/Error.js"
#include "swirly/util/FileReader.js"
#include "swirly/util/print.js"

function ShowRunner() {
    var self = this;
    this._methods = [
        // These methods can be overridden on the "wind" object.
        ['note', 'MIDI note on and off'],
        ['breath', 'breath control'],
        ['program', 'program change'],
        ['pitchbend', 'pitchbend'],

        // ['level', 'audio level'], // This is disabled.

        // These methods can be overriden on the "sequence" object.
        ['phasor', 'The phasor value between 0 and 1'],
        ['transport', 'A list representing the transport number.'],
        ['timer', 'Result of some incoming time'],

        // These ones are hard-coded.
        ['sequence', 'Cues for the sequencer.'],
        ['mapper', 'Cues for the mapper.'],
        ['dmxusbpro', 'Menu output from the dmx USB pro'],

        // Debugging only.
        // ['envelope', 'test for envelope'],
    ];

    var objects = Max.findAll(),
        dmxusbpro = objects.maxclass.dmxusbpro,
        head = objects.
        dmx_cache = [],
        cuesToRun = [],
        mapper = {},
        sequence = {},
        scene = {'mapper': {}, 'sequence' : {}},
        cues = {'mapper': [], 'sequence': []},
        multisliders = [
            objects.varname.laser_1,
            objects.varname.laser_2,
            objects.varname.laser_3,
            objects.varname.laser_4,
            objects.varname.moving_head],
        multislider_sizes = [9, 9, 9, 9, 14],
        bank_size = 16,
        bank_count = 5;

    function canRun() {
        return self._time && self._time[1] == 1;
    }

    function runCues() {
        if (cuesToRun.length && canRun()) {
            cuesToRun.forEach(function(c) { c(); } );
            cuesToRun = [];
        }
    };

    function sendBank(bank) {
        var multislider = multisliders[bank],
            bankStart = bank * 16 + 1,
            bankEnd = bankStart + multislider_sizes[bank];
        multislider.message('setlist', dmx_cache.slice(bankStart, bankEnd));
    };

    function clear() {
        dmx_cache = [0];  // We never use instrument 0.
        for (var c = 1; c <= bank_count * bank_size; ++c) {
            dmx_cache.push(0);
            dmxusbpro.message(c, 0);
        }
        for (var i = 0; i < bank_count; ++i)
            sendBank(i);
    };

    clear();

    this._dmxratio = function(channel, value) {
        self._dmxoutput(channel, Ranges.dmx.select(value));
    };

    this._dmxoutput = function(channel, value) {
        if (channel <= 0 || channel > 255) {
            post('ERROR: channel', channel, '\n');
            return;
        }

        // Avoid sending the same value twice.
        if (value === dmx_cache[channel])
            return;

        dmx_cache[channel] = value;
        dmxusbpro.message(channel, value);

        sendBank(Math.floor(channel / 16));
    };

    this.transport = function() {
        self._time = arrayfromargs(arguments);
        runCues();
        // scene.sequence.transport && scene.sequence.transport();
    };

    this.dmxusbpro = function(command, device) {
        if (command === 'append' && device != 'None')
            dmxusbpro.message(device);
    };

    function doCue(cueType, note) {
        var cue = cues[cueType][note];
        if (!cue) {
            post('ERROR: didn\'t understand cue', cueType, note, '\n');
            return;
        }
        function run() {
            var name = cue[0], sceneMaker = cue[1];
            post('Cue runs:', cueType + '.' + name, '\n');
            scene[cueType] = sceneMaker(self);
        }
        if (canRun())
            run();
        else
            cuesToRun.push(run);
    };

    this.sequence = function(note) {
        doCue('sequence', note);
    };

    this.mapper = function(note) {
        doCue('mapper', note);
    };

    function delegate(cueType, method) {
        self[method] = function(_) {
            var fn = scene[cueType][method];
            if (fn)
                fn.apply(self, arguments);
        };
    }

    delegate('mapper', 'note');
    delegate('mapper', 'breath');
    delegate('mapper', 'program');
    delegate('mapper', 'pitchbend');

    delegate('sequence', 'phasor');
    delegate('sequence', 'timer');

    this.addCue = function(cueType, name, sceneMaker) {
        var cuesForType = cues[cueType]
        methodIndex = cuesForType.length.toString();
        name = name || methodIndex;
        cuesForType.push([name, sceneMaker]);
        post('New cue', cueType + '.' + name, '(' + methodIndex + ')\n');
    };
};
