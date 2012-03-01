#include "swirly/softstep/controller.js"
#include "swirly/max/inlets.js"
#include "swirly/max/outlets.js"

autowatch = 1;

Max.SetOutlets(['midiout', 'Midi data to the softstep'],
               ['command', 'Commands from the softstep'],
               ['midiin', 'Commands to the midin or ctlin that receives softstep data']);

var _softstep = new Softstep.Controller(Max.Out);

Max.SetInlets(['midiin', _softstep.MidiIn,
               'Continuous controller data.'],

              ['command', _softstep.Command,
               'Commands to the softstep: ' + _softstep.commands]);

post('Compiled sofstep.js on ' + new Date().toString(), '\n');
post('Commands are:', _softstep.commands, '\n');