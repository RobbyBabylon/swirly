#ifndef __LISTENTOPROPERTY
#define __LISTENTOPROPERTY

#include "swirly/live/live.js"

Live.this_track = 'this_device canonical_parent';

// Map names to path, propname pairs.
Live.propertyDictionary = {
  trackname: [Live.this_track, 'name'],
  clipslot: [Live.this_track, 'playing_slot_index'],
  firedslot: [Live.this_track, 'fired_slot_index'],
  clipname: [function(slot) {
    return Live.this_track + ' clip_slots ' + slot + ' clip';
  }, 'name'],
};

Live.GetPropertyPath = function(property, arg) {
  var p = Live.propertyDictionary[property];
  if (p) {
    var path = p[0], name = p[1];
    return [(typeof(path) == 'function') ? path(arg) : path, name];
  }
};

Live.ListenToProperty = function(property, callback, arg) {
  var p = Live.GetPropertyPath(property, arg);
  if (p)
    Live.ListenToPropertyRaw(p[0], p[1], callback);
  else
    post("ERROR: Couldn't understand property '" + property + "'\n");
};

Live.ListenToPropertyRaw = function(path, propname, callback) {
  function localCallback(args) {
    if (args[0] == propname)
      callback(args[1]);
  };

  new LiveAPI(localCallback, path).property = propname;
};

Live.GetProperty = function(property, arg) {
  var p = Live.GetPropertyPath(property, arg);
  return p && new LiveAPI(p[0]).get(p[1]);
};

#endif  // __LISTENTOPROPERTY
