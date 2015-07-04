#pragma once

#include "swirly/util/print.js"

#define ERROR_MESSAGE(MSG, VALUE) \
    ('Error at ' + __FILE__ + ':' + __LINE__ + ':' + MSG + ' ' + \
    Print(VALUE))

#define ERROR(MSG, VALUE) post(ERROR_MESSAGE(MSG, VALUE), '\n')
#define THROW(MSG, VALUE) throw ERROR_MESSAGE(MSG, VALUE)
