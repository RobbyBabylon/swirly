#ifndef __SWIRLY__SOFTSTEP__INITIALIZE
#define __SWIRLY__SOFTSTEP__INITIALIZE

#include "swirly/softstep/softstep.js"

// Initialize the softstep, callback a function when it's done.
Softstep.Initialze = function(render, callback, interval) {
  function Initializer() {
    this.callback = callback;
    this.interval = interval || 300;
    this.render = render;
    this.commands = [
      ['appInitialized'],
      ['standalone', 'off'],
      ['tether', 'on']];

    this.Run = function() {
      this.execute(this.commands.shift());
      if (this.commands.length) {
        new Task(this.Run, this).schedule(this.interval);
      } else {
        post('Softstep initialized\n');
        this.callback && this.callback();
      }
    };

  new Initializer().Run();
};

#endif  // __SWIRLY__SOFTSTEP__INITIALIZE
