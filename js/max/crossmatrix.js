inlets = 1;
autowatch = 1;

#include "swirly/max/outlets.js"
#include "swirly/util/logging.js"
#include "swirly/util/forEach.js"

Max.SetOutlets(
    ['router', 'Commands to router object.'],
    ['selection', 'A two-element list with the in/out selection names.']
);

function Matrix(config) {
    this.setConfig(config || this.default_config);
}

Matrix.prototype.setConfig = function(config) {
    for (var name in config)
        this[name] = config[name];

    this.columns = (this.column_names && this.column_names.length)
        || this.columns;
    this.rows = (this.row_names && this.row_names.length)
        || this.rows;
    this.colors = [
        this.color.disabled,
        this.color.enabled,
        this.color.clicked_for_enable,
        this.color.clicked_for_disable,
        this.color.will_be_disabled];

    this.matrix = new Array(this.columns);
    this.selection = undefined;

    for (var c = 0; c < this.columns; ++c) {
        this.matrix[c] = new Array(this.rows);
        for (var r = 0; r < this.rows; ++r)
            this.matrix[c][r] = Matrix.DISABLED;
    }

    this.resize();
};

Matrix.prototype.resize = function() {
    /** Reminder: width is measured in columns, height in rows.

        In the jsui world, all canvases are normalized as follows:
        aspect = width / height

        and laid out like this:

          top left hand corner:     [-aspect,  1]
          top right hand corner:    [ aspect,  1]
          bottom left hand corner:  [-aspect, -1]
          bottom right hand corner: [ aspect, -1]

        so coordinates increase from left to right, and from bottom to top.

        Concrete example: a 5x4 matrix.  Natural aspect ratio is 1.25.  If the
        actual aspect ratio is less than 1.25, then we fill the columns and have
        space below the rows.  If it's greater than 1.25, we fill the rows and
        have space to the right of the columns.
    */
	var width = (box.rect[2] - box.rect[0]),
        height = (box.rect[3] - box.rect[1]);
    this.aspect = width / height;

    var columnLinesWidth = this.column_lines.length * this.lineRatio,
        rowLinesHeight = this.row_lines.length * this.lineRatio,
        columnCount = this.columns + columnLinesWidth + this.padding,
        rowCount = this.rows + rowLinesHeight + this.padding,
        columnSize = this.aspect / columnCount,
        rowSize = 1.0 / rowCount;

    this.cellSize = 2.0 * Math.min(columnSize, rowSize);
    this.lineWidth = this.cellSize * this.lineRatio;
    this.padWidth = this.cellSize * this.padding;
    //post('cellSize', this.cellSize, this.aspect, this.lineWidth,
    //     columnSize, rowSize, this.padWidth, '\n');
    var self = this;

    function offset(count, lines, off) {
        var result = [],
            frontIndex = 0;
        off += self.lineWidth + self.padWidth;

        for (var i = 0; i <= count; ++i) {
            result.push(off);
            var front = lines && lines[frontIndex];
            if (front !== undefined && front <= count) {
                off += self.lineWidth;
                ++frontIndex;
            }
            off += self.cellSize;
        }
        result[count] += self.padWidth;
        return result;
    };

    this.column_offsets = offset(this.columns, this.column_lines, -this.aspect);
    this.row_offsets = offset(this.rows, this.row_lines, -1.0);
    for (var row = 0; row <= this.rows; ++row)
        this.row_offsets[row] = -this.row_offsets[row];

    // post('row_offsets', this.row_offsets, '\n');
    // post('column_offsets', this.column_offsets, '\n');
};

Matrix.prototype.default_config = {
    rows: 4,
    columns: 4,
    color: {
        background: [1.0, 1.0, 1.0, 0.5],
        disabled: [0.9, 0.9, 0.9, 0.75],
        enabled: [0.0, 0.0, 0.0, 1.0],
        clicked_for_enable: [1.0, 0.7, 0.7, 1.0],
        clicked_for_disable: [0.5, 0.5, 0.5, 1.0],
        will_be_disabled: [0.5, 0.5, 0.5],
        selection: [1.0, 0.0, 0.0, 1.0],
        line_color: [0.5, 0.5, 0.5, 1.0],
    },
    circle_radius: 0.85,
    defer: true,
    merge_rows: [],

    column_names: ['a', 'b', 'c', 'd', 'e'],
    row_names: ['1', '2', '3', '4', '5'],

    //*
    column_lines: [0, 1, 2],
    row_lines: [3, 4],
    //*/

    /*
    column_lines: [],
    row_lines: [],
    //*/

    lineRatio: 0.01,
    padding: 0.2,
};

if (jsarguments.length > 1) {
    var config = Matrix.prototype.default_config;
    config.rows = Number(jsarguments[1]);
    config.columns = Number(jsarguments[2] || 0) || config.rows;
    config.column_names = config.row_names = undefined;
}

Matrix.DISABLED = 0;
Matrix.ENABLED = 1;
Matrix.CLICKED_FOR_ENABLE = 2;
Matrix.CLICKED_FOR_DISABLE = 3;
Matrix.WILL_BE_DISABLED = 4;

Matrix.CLICK_TRANSITION = [
    Matrix.CLICKED_FOR_ENABLE,
    Matrix.CLICKED_FOR_DISABLE,
    Matrix.DISABLED,
    Matrix.ENABLED,
    Matrix.ENABLED,
];

Matrix.CLEAR_TRANSITION = [
    Matrix.DISABLED,
    Matrix.ENABLED,
    Matrix.DISABLED,
    Matrix.ENABLED,
    Matrix.ENABLED
];

Matrix.RELEASE_TRANSITION = [
    Matrix.DISABLED,
    Matrix.ENABLED,
    Matrix.ENABLED,
    Matrix.DISABLED,
    Matrix.DISABLED
];

Matrix.prototype.reset = function() {
	for (var c = 0; c < this.columns; c++)
		for (var r = 0; r < this.rows; r++)
            this.setState(c, r, Matrix.DISABLED);
};

Matrix.prototype.clear = function() {
    this.forEach(Matrix.CLEAR_TRANSITION);
};

Matrix.prototype.setColor = function(color) {
    sketch.glcolor(color[0], color[1], color[2], color[3]);
};

Matrix.prototype.setState = function(column, row, state) {
    var previousState = this.matrix[column][row]
    if (state !== undefined && previousState !== state) {
        this.matrix[column][row] = state;
        Max.Out.router(column, row, state);
    }
};

Matrix.prototype.forEach = function(func, dontDraw) {
	for (var c = 0; c < this.columns; c++)
		for (var r = 0; r < this.rows; r++)
            this.setState(c, r, func[this.matrix[c][r]]);
    this.draw();
};

Matrix.prototype.clearScreen = function() {
    var back = this.color.background;
	sketch.glclearcolor(back[0], back[1], back[2], back[3]);
	sketch.glclear();
};

Matrix.prototype.draw = function() {
    this.clearScreen();
    // Draw the guidelines.
    this.setColor(this.color.line_color);

    if (this.column_lines.length) {
        var begin = this.row_offsets[0],
            end = this.row_offsets[this.row_offsets.length - 1];
        for (var i = 0; i < this.column_lines.length; ++i) {
            sketch.moveto(this.column_offsets[this.column_lines[i]], end, 0);
            sketch.line(0, begin - end, 0);
        }
    }

    if (this.row_lines.length) {
        var begin = this.column_offsets[0],
            end = this.column_offsets[this.column_offsets.length - 1];
        for (var i = 0; i < this.row_lines.length; ++i) {
            sketch.moveto(begin, this.row_offsets[this.row_lines[i]], 0);
            sketch.line(end - begin, 0, 0);
        }
    }

    var self = this,
        halfCell = this.cellSize / 2;

    for (var c = 0; c < this.columns; c++) {
		for (var r = 0; r < this.rows; r++) {
            var state = this.matrix[c][r];
	        sketch.moveto(self.column_offsets[c] + halfCell,
                          self.row_offsets[r] - halfCell, 0);
            self.setColor(self.colors[state]);
		    sketch.circle(self.circle_radius * halfCell);
        }
    }

    // Draw the selection.
    if (this.selection) {
	    sketch.moveto(this.column_offsets[this.selection[0]],
                      this.row_offsets[this.selection[1]], 0);
        this.setColor(this.color.selection);
        sketch.line(this.cellSize, 0, 0.0);
        sketch.line(0, -this.cellSize, 0.0);
        sketch.line(-this.cellSize, 0, 0.0);
        sketch.line(0, this.cellSize, 0.0);
    }
    refresh();
};

Matrix.prototype.outputSelection = function() {
    var selection = ['', ''];
    if (this.selection) {
        var c = this.selection[0], r = this.selection[1];
        selection = [
            (this.column_names && this.column_names[c]) || c.toString(),
            (this.row_names && this.row_names[r]) || r.toString()];
    }
    Max.Out.selection(selection[0], selection[1]);
};

Matrix.prototype.onclick = function(x, y) {
	var world = sketch.screentoworld(x, y);

    // TODO: needs to be fixed to take into account separator lines!

	var column = Math.floor((world[0] + this.aspect) / this.cellSize);
	var row = Math.floor((1.0 - world[1]) / this.cellSize);
    this.clickSquare(column, row);
};

Matrix.prototype.clickSquare = function(column, row) {
    var col = this.matrix[column],
        state = col && col[row],
        mustDisable = (this.merge_rows.indexOf(row) == -1),
        self = this;

    if (state === undefined)
        return;

    function change(before, after, output) {
        if (mustDisable)
            for (var c = 0; c < self.columns; ++c)
                if (c != column && self.matrix[c][row] == before)
                    self.setState(c, row, after);
    };

    this.selection = [column, row];
    this.outputSelection();

    if (this.defer) {
        if (state == Matrix.DISABLED) {
            change(Matrix.ENABLED, Matrix.WILL_BE_DISABLED);
            change(Matrix.CLICKED_FOR_ENABLE, Matrix.DISABLED);
        } else if (state == Matrix.CLICKED_FOR_ENABLE) {
            change(Matrix.WILL_BE_DISABLED, Matrix.ENABLED);
        } else if (state == Matrix.WILL_BE_DISABLED) {
            change(Matrix.CLICKED_FOR_ENABLE, Matrix.DISABLE);
        }
        this.setState(column, row, Matrix.CLICK_TRANSITION[state]);
    } else {
        this.setState(column, row, 1 - state);
        if (state == Matrix.DISABLED)
            change(Matrix.ENABLED, Matrix.DISABLED, true);
    }
	this.draw();
};

Matrix.prototype.setDefer = function(def) {
    if (this.defer && !def) {
        this.clear();
        this.draw();
    }
    this.defer = def;
};

Matrix.prototype.release = function() {
    if (!this.defer) {
        post('ERROR: not in defer mode\n');
        return;
    }
    this.forEach(Matrix.RELEASE_TRANSITION);
};

Matrix.prototype.move = function(dx, dy) {
    if (!this.selection) {
        if (dx > 0 || dy > 0)
            this.selection = [0, 0];
        else if (dx < 0)
            this.selection = [this.columns - 1, 0];
        else
            this.selection = [0, this.rows - 1];
    } else {
        this.selection[0] += dx;
        this.selection[1] += dy;
        if (this.selection[0] < 0)
            this.selection[0] += this.columns;
        if (this.selection[1] < 0)
            this.selection[1] += this.rows;

        if (this.selection[0] >= this.columns)
            this.selection[0] -= this.columns;
        if (this.selection[1] >= this.rows)
            this.selection[1] -= this.rows;
    }
    this.outputSelection();
    this.draw();
};

Matrix.prototype.toggle = function() {
    if (this.selection)
        this.clickSquare(this.selection[0], this.selection[1]);
};

var matrix = new Matrix();

sketch.default2d();
matrix.draw();

function onresize(w, h)
{
	matrix.resize();
	matrix.draw();
};

function onclick(x, y)
{
    matrix.onclick(x, y);
};

function ondblclick(x, y)
{
	onclick(x, y);
};

// Make functions private to prevent triggering from Max.
onclick.local = 1;
ondblclick.local = 1;
onresize.local = 1;

function defer(def) {
    matrix.setDefer(!!def);
};

function release() {
    matrix.release();
};

function left() {
    matrix.move(-1, 0);
};

function right() {
    matrix.move(1, 0);
};

function up() {
    matrix.move(0, -1);
};

function down() {
    matrix.move(0, 1);
};

function toggle() {
    matrix.toggle();
};

function clear() {
    matrix.clear();
};

function reset() {
    matrix.reset();
    matrix.draw();
};

function clear_selection() {
    matrix.selection = undefined;
    matrix.outputSelection();
    matrix.draw();
};

function onresize() {
    matrix.resize();
    matrix.draw();
}

LOADED();
