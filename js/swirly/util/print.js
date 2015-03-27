#pragma once

#include "swirly/array/is.js"

var MAX_DEPTH = 10;

function Print(item, depth) {
  depth = depth || 0;
  if (depth > MAX_DEPTH)
    return 'MAX_DEPTH';

  if (item == null)
    return 'null';

  if (item == 'undefined')
    return 'undefined';

  var t = typeof(item);
  if (t == 'string')
    return '"' + item + '"';

  if (t == 'function')
    return (item.name || 'unknown') + '()';

  if (t != 'object')
    return item + '';

  var is_array = Array.Is(item);
  var result = [is_array ? '[' : '{'];

  for (var index in item) {
    if (result.length > 1)
      result[result.length - 1] += ', ';
    var value = Print(item[index], depth + 1);
    result.push(is_array ? value : '"' + index + '": ' + value);
  }
  result.push(is_array ? ']' : '}');
  return result.join('');
};

function PrintJoin(_) {
  var res = [];
  for (var i = 0; i < arguments.length; ++i)
    res.push(Print(arguments[i]));
  return res.join(' ');
};

// This is a VERY useful function - it converts Javascript objects into a
// human-readable form, prints them on one line and then adds a trailing \n.
function Postln(_) {
  for (var i = 0; i < arguments.length; ++i)
    post(Print(arguments[i]));

  post('\n');
};
