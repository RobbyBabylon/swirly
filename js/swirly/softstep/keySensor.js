#ifndef __SWIRLY__SOFTSTEP__KEYSENSOR
#define __SWIRLY__SOFTSTEP__KEYSENSOR

#include "swirly/softstep/softstep.js"

Softstep.sensorsPerPad = 4;
Softstep.firstSensor = 40;
Softstep.lastSensor = 86;
Softstep.keyList = [6, 1, 7, 2, 8, 3, 9, 4, 10, 5, 'Nav', 'Pedal'];

Softstep.CCToKeySensor = function(cc) {
  if (cc < Softstep.firstSensor || cc > Softstep.lastSensor) {
    post('ERROR: Bad softstep cc', cc, '\n');
    return ['bad', 0];
  }

  var index = Math.floor((cc - Softstep.firstSensor) / Softstep.sensorsPerPad);
  var key = "" + Softstep.keyList[index];
  var sensor = cc % 4;
  return [key, sensor];
};

#endif  // __SWIRLY__SOFTSTEP__KEYSENSOR
