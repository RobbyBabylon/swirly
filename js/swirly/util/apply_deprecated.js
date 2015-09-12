#ifndef __SWIRLY_FUNCTIONAL_APPLY
#define __SWIRLY_FUNCTIONAL_APPLY

var Functional = {};

// Apply(f, x, dflt) returns f(x) if f is a function, f[x] if f is a non-null
// object, or dflt otherwise.
Functional.Apply = function(f, x, dflt) {
  var t = typeof(f);
  if (t == 'function')
    return f(x);

  if (f && (t == 'object'))
    return f[x];

  return dflt;
};

Functional.ApplyList = function(f, list) {
  for (var i = 0; i < list.length; ++i)
    list[i] = Functional.Apply(f, list[i], list[i]);
  return list;
};

Functional.ApplyAll = function(f) {
  while (typeof(f) == 'function')
    f = f();
  return f;
};

Functional.Applier = function(f) {
  return function(x) { return f.apply(this, x); }
};

#endif  // __SWIRLY_FUNCTIONAL_APPLY
