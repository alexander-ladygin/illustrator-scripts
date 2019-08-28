#target illustrator

var preview = {
    value: false
  },
  isUndo = false;


function randomDash (userOptions) {
  var values = userOptions || {
    mindash: 2,
    maxdash: 20,
    mingap: 2,
    maxgap: 10,
    minStroke: 1,
    maxStroke: 3
  };

  for (var i = 0; i < activeDocument.selection.length; i++) {
    var dash = [];
    for (var j = 0; j < 6; j += 2) {
      dash[j] = Math.random() * (values.maxdash - values.mindash) + values.mindash;
      dash[j + 1] = Math.random() * (values.maxgap - values.mingap) + values.mingap;
    }
    activeDocument.selection[i].strokeDashes = dash;
    activeDocument.selection[i].strokeWidth = values.minStroke + Math.random() * (values.maxStroke - values.minStroke);
  }
}



function inputNumberEvents (ev, _input, min, max, callback){
  var step,
      _dir = (ev.keyName ? ev.keyName.toLowerCase().slice(0,1) : '#none#'),
      _value = parseFloat(_input.text),
      units = (',px,pt,mm,cm,in,'.indexOf(_input.text.length > 2 ? (',' + _input.text.replace(/ /g, '').slice(-2) + ',') : ',!,') > -1 ? _input.text.replace(/ /g, '').slice(-2) : '');

  min = (min === undefined ? 0 : min);
  max = (max === undefined ? Infinity : max);
  step = (ev.shiftKey ? 10 : (ev.ctrlKey ? .1 : 1));

  if (isNaN(_value)) {
      _input.text = min;
  }
      else {
          _value = ( (_dir === 'u') ? _value + step : ((_dir === 'd') ? _value - step : false) );
          if (_value !== false) {
              _value = (_value <= min ? min : (_value >= max ? max : _value))
              _input.text = _value;
              if (callback instanceof Function) callback(_value, _input, min, max, units);
                  else if (units) _input.text = parseFloat(_input.text) + ' ' + units;
          }
              else if (units) _input.text = parseFloat(_input.text) + ' ' + units;
      }
}


win = new Window('dialog', 'Random dash \u00A9 UI (Alexander ladygin)');

win.alignChildren = 'fill';

with (win.add('panel', undefined, 'Dash:')) {
  alignChildren = ['fill', 'bottom'];

  with(add('group')) {
    with(add('group')) {
      var __minDashText = add('statictext', undefined, 'Min'),
        __minDashInput = add('edittext', [0, 0, 40, 25], '2'),
        __minDashSlider = add('slider', [0, 0, 80, 15], 1, 2, 100);
      __minDashInput.text = __minDashSlider.value;
  
      __minDashSlider.onChanging = function (e) { __minDashInput.text = Math.round(this.value); }
      // __minDashSlider.onChange = function (e) { previewStart(); }
      __minDashInput.addEventListener('keydown', function (e) { inputNumberEvents(e, this, __minDashSlider.minvalue, __minDashSlider.maxvalue); });
      __minDashInput.addEventListener('keyup', function (e) { __minDashSlider.value = Math.round(this.text);  });
      // __minDashInput.onChange = function (e) { previewStart(); };
    }
    with(add('group')) {
      var __maxDashSlider = add('slider', [0, 0, 80, 15], 20, 2, 100),
        __maxDashInput = add('edittext', [0, 0, 40, 25], '20'),
        __maxDashText = add('statictext', undefined, 'Max');
        __maxDashInput.text = __maxDashSlider.value;
  
      __maxDashSlider.onChanging = function (e) { __maxDashInput.text = Math.round(this.value); }
      // __maxDashSlider.onChange = function (e) { previewStart(); }
      __maxDashInput.addEventListener('keydown', function (e) { inputNumberEvents(e, this, __maxDashSlider.maxvalue, __maxDashSlider.maxvalue); });
      __maxDashInput.addEventListener('keyup', function (e) { __maxDashSlider.value = Math.round(this.text);  });
      // __maxDashInput.onChange = function (e) { previewStart(); };
    }
  }
}

with (win.add('panel', undefined, 'Gap:')) {
  alignChildren = ['fill', 'bottom'];

  with(add('group')) {
    with(add('group')) {
      var __minGapText = add('statictext', undefined, 'Min'),
        __minGapInput = add('edittext', [0, 0, 40, 25], '1'),
        __minGapSlider = add('slider', [0, 0, 80, 15], 1, 1, 100);
      __minGapInput.text = __minGapSlider.value;
  
      __minGapSlider.onChanging = function (e) { __minGapInput.text = Math.round(this.value); }
      // __minGapSlider.onChange = function (e) { previewStart(); }
      __minGapInput.addEventListener('keydown', function (e) { inputNumberEvents(e, this, __minGapSlider.minvalue, __minGapSlider.maxvalue); });
      __minGapInput.addEventListener('keyup', function (e) { __minGapSlider.value = Math.round(this.text);  });
      // __minGapInput.onChange = function (e) { previewStart(); };
    }
    with(add('group')) {
      var __maxGapSlider = add('slider', [0, 0, 80, 15], 10, 2, 100),
        __maxGapInput = add('edittext', [0, 0, 40, 25], '10'),
        __maxGapText = add('statictext', undefined, 'Max');
        __maxGapInput.text = __maxGapSlider.value;
  
      __maxGapSlider.onChanging = function (e) { __maxGapInput.text = Math.round(this.value); }
      // __maxGapSlider.onChange = function (e) { previewStart(); }
      __maxGapInput.addEventListener('keydown', function (e) { inputNumberEvents(e, this, __maxGapSlider.maxvalue, __maxGapSlider.maxvalue); });
      __maxGapInput.addEventListener('keyup', function (e) { __maxGapSlider.value = Math.round(this.text);  });
      // __maxGapInput.onChange = function (e) { previewStart(); };
    }
  }
}

with (win.add('panel', undefined, 'Stroke:')) {
  alignChildren = ['fill', 'bottom'];

  with(add('group')) {
    with(add('group')) {
      var __minStrokeText = add('statictext', undefined, 'Min'),
        __minStrokeInput = add('edittext', [0, 0, 40, 25], '1'),
        __minStrokeSlider = add('slider', [0, 0, 80, 15], 1, 1, 100);
      __minStrokeInput.text = __minStrokeSlider.value;
  
      __minStrokeSlider.onChanging = function (e) { __minStrokeInput.text = Math.round(this.value); }
      // __minStrokeSlider.onChange = function (e) { previewStart(); }
      __minStrokeInput.addEventListener('keydown', function (e) { inputNumberEvents(e, this, __minStrokeSlider.minvalue, __minStrokeSlider.maxvalue); });
      __minStrokeInput.addEventListener('keyup', function (e) { __minStrokeSlider.value = Math.round(this.text);  });
      // __minStrokeInput.onChange = function (e) { previewStart(); };
    }
    with(add('group')) {
      var __maxStrokeSlider = add('slider', [0, 0, 80, 15], 3, 2, 100),
        __maxStrokeInput = add('edittext', [0, 0, 40, 25], '3'),
        __maxStrokeText = add('statictext', undefined, 'Max');
        __maxStrokeInput.text = __maxStrokeSlider.value;
  
      __maxStrokeSlider.onChanging = function (e) { __maxStrokeInput.text = Math.round(this.value); }
      // __maxStrokeSlider.onChange = function (e) { previewStart(); }
      __maxStrokeInput.addEventListener('keydown', function (e) { inputNumberEvents(e, this, __maxStrokeSlider.maxvalue, __maxStrokeSlider.maxvalue); });
      __maxStrokeInput.addEventListener('keyup', function (e) { __maxStrokeSlider.value = Math.round(this.text);  });
      // __maxStrokeInput.onChange = function (e) { previewStart(); };
    }
  }
}

with (win.add('group')) {
  orientation = 'row';
  alignChildren = ['fill', 'fill'];

  var previewBtn = add('button', undefined, 'Preview'),
      cancelBtn = add('button', undefined, 'Cancel'),
      applyBtn = add('button', undefined, 'Ok', { name: 'ok' });

  previewBtn.onClick = function() { preview.value = true; previewStart(); }
  cancelBtn.onClick = function() { win.close(); }
  applyBtn.onClick = function() {
      if (preview.value && isUndo) {
          isUndo = false;
          win.close();
      }
          else {
              app.undo();
              startAction();
              isUndo = false;
              win.close();
          }
  }
}

// }

function startAction() {
  randomDash({
    mindash: +(__minDashInput.text),
    maxdash: +(__maxDashInput.text),
    mingap: +(__minGapInput.text),
    maxgap: +(__maxGapInput.text),
    minStroke: +(__minStrokeInput.text),
    maxStroke: +(__maxStrokeInput.text)
  });
}

function previewStart() {
  if (preview.value) {
      if (isUndo) app.undo();
          else isUndo = true;

      startAction();
      app.redraw();
  }
      else if (isUndo) {
          app.undo();
          app.redraw();
          isUndo = false;
      }
}


win.onClose = function () {
  try {
    if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
    }
  } catch (e) {}
}

function checkItems() {
  var s = activeDocument.selection, i = s.length;
  if (i > 0) while (i--) {
    if (s[i].stroked || s[i].strokeWidth) return true;
  }
}

if (checkItems()) {
  win.center();
  win.show();
} else {
  alert('Please select items that contain a stroke!');
}