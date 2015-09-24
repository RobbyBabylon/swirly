#pragma once

#include "swirly/laser/Laser.js"

Laser.Lights = function(multislider, dmx, channelOffset) {
    var self = this,
        faders = new Array(9);

    function sendMultislider() {
        Logging.Log('multislider', faders);
        multislider.message(faders);
    };

    function setFader(fader, value) {
        faders[fader] = value;
        dmx.message(1 + channelOffset + fader, value);
        Logging.Log('dmx', channelOffset + fader, value, '\n');
    };

    function clear() {
        for (var i = 1; i < faders.length; ++i)
            setFader(i, 0);
        setFader(0, 0xFF);

        sendMultislider();
    };


    self.setFader = function(fader, value) {
        setFader(fader, value);
        sendMultislider();
    };

    clear();
    self.clear = clear;
    Logging.Log('multislider', channelOffset, faders, faders.length);
};
