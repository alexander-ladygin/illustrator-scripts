/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+
  Name: long_shadow.jsx;

  Copyright (c) 2019
  www.ladyginpro.ru

*/

$.getUnits = function (val, def) {return 'px,pt,mm,cm,in,pc'.indexOf(val.slice(-2)) > -1 ? val.slice(-2) : def;};
$.convertUnits = function (obj, b) {if (obj === undefined) {return obj;}if (b === undefined) {b = 'px';}if (typeof obj === 'number') {obj = obj + 'px';}if (typeof obj === 'string') {var unit = $.getUnits(obj),val = parseFloat(obj);if (unit && !isNaN(val)) {obj = val;}else if (!isNaN(val)) {obj = val; unit = 'px';}}if (((unit === 'px') || (unit === 'pt')) && (b === 'mm')) {obj = parseFloat(obj) / 2.83464566929134;}else if (((unit === 'px') || (unit === 'pt')) && (b === 'cm')) {obj = parseFloat(obj) / (2.83464566929134 * 10);}else if (((unit === 'px') || (unit === 'pt')) && (b === 'in')) {obj = parseFloat(obj) / 72;}else if ((unit === 'mm') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 2.83464566929134;}else if ((unit === 'mm') && (b === 'cm')) {obj = parseFloat(obj) * 10;}else if ((unit === 'mm') && (b === 'in')) {obj = parseFloat(obj) / 25.4;}else if ((unit === 'cm') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 2.83464566929134 * 10;}else if ((unit === 'cm') && (b === 'mm')) {obj = parseFloat(obj) / 10;}else if ((unit === 'cm') && (b === 'in')) {obj = parseFloat(obj) * 2.54;}else if ((unit === 'in') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 72;}else if ((unit === 'in') && (b === 'mm')) {obj = parseFloat(obj) * 25.4;}else if ((unit === 'in') && (b === 'cm')) {obj = parseFloat(obj) * 25.4;}return parseFloat(obj);};


var scriptName = 'long_shadow',
    copyright = ' \u00A9 www.ladyginpro.ru',
    settingFile = {
        name: scriptName + '__setting.json',
        folder: Folder.myDocuments + '/LA_AI_Scripts/'
    }
    __items = (function () {
      var arr = [], l = selection.length;
      for (var n = 0; n < l; n++) {
        arr.push(selection[n]);
      }
      return arr;
    }());

function shadow (items, options, originalItem, compoundGroup) {
  options = options || {};

  function setShadow (item) {
    var shadowPath,
      parent = (originalItem || item).parent;

    var group = (compoundGroup || parent.groupItems.add()),
      p = item.pathPoints,
      n = p.length;


    for (var i = 0, j = 1; i < n; i++, j++) {
      shadowPath = group.pathItems.add();

      if (i === n - 1) {
          if (n === 2) break;
          j = 0;
      }

      shadowPath.setEntirePath([
        // 1 line
        [
          p[i].anchor[0],
          p[i].anchor[1]
        ],
        [
          p[j].anchor[0],
          p[j].anchor[1]
        ],
        // 2 line
        [
          p[j].anchor[0],
          p[j].anchor[1]
        ],
        [
          (p[j].anchor[0] - p[j].anchor[0]) * Math.cos(angle) - (p[j].anchor[1] + options.size - p[j].anchor[1]) * Math.sin(angle) + p[j].anchor[0],
          (p[j].anchor[0] - p[j].anchor[0]) * Math.sin(angle) + (p[j].anchor[1] + options.size - p[j].anchor[1]) * Math.cos(angle) + p[j].anchor[1]
        ],
        // 3 line
        [
          (p[i].anchor[0] - p[i].anchor[0]) * Math.cos(angle) - (p[i].anchor[1] + options.size - p[i].anchor[1]) * Math.sin(angle) + p[i].anchor[0],
          (p[i].anchor[0] - p[i].anchor[0]) * Math.sin(angle) + (p[i].anchor[1] + options.size - p[i].anchor[1]) * Math.cos(angle) + p[i].anchor[1]
        ]
      ])

      shadowPath.closed = true;
    }

    // var copy = (originalItem || item).duplicate();
    // if (copy.typename === 'CompoundPathItem') {
    //   copy.moveToBeginning(group);
    // }
    // copy.selected = false;
    // copy.position = [
    //   (copy.position[0] - copy.position[0]) * Math.cos(angle) - (copy.position[1] + options.size - copy.position[1]) * Math.sin(angle) + copy.position[0],
    //   (copy.position[0] - copy.position[0]) * Math.sin(angle) + (copy.position[1] + options.size - copy.position[1]) * Math.cos(angle) + copy.position[1]
    // ];
    // copy.moveToBeginning(group);

    group.move((originalItem || item), ElementPlacement.PLACEAFTER);
    group.opacity = 50;
  }

  if (items.typename && items.typename.slice(-1) !== 's') {
    items = [items];
  }

  options.size  = (typeof options.size === 'number' ? options.size : 600);
  options.angle = (typeof options.angle === 'number' ? options.angle : 45);

  var l = items.length,
    angle = (180 + options.angle) * Math.PI / 180;

  for (var x = 0; x < l; x++) {
    if (items[x].typename === 'PathItem') {
      setShadow(items[x]);
      if (options.removeItem) {
        items[x].remove();
      }
    } else if (items[x].typename === 'CompoundPathItem') {
      var __compoundGroup = items[x].parent.groupItems.add();
      __compoundGroup.move(items[x], ElementPlacement.PLACEAFTER);
      shadow(items[x].pathItems, options, originalItem || items[x], __compoundGroup);
    } else if (items[x].typename === 'GroupItem') {
      shadow(items[x].pageItems, options);
    } else if (items[x].typename === 'TextFrame') {
      options.removeItem = true;
      shadow(items[x].duplicate(items[x], ElementPlacement.PLACEAFTER).createOutline(), options);
      options.removeItem = false;
    }
  }
}

function inputNumberEvents (ev, _input, min, max, callback){
  var step,
      round = false,
      _dir = (ev.keyName ? ev.keyName.toLowerCase().slice(0,1) : '#none#'),
      _value = parseFloat(_input.text),
      _valueOld = _value,
      units = (',px,pt,mm,cm,in,eg,'.indexOf(_input.text.length > 2 ? (',' + _input.text.replace(/ /g, '').slice(-2) + ',') : ',!,') > -1 ? _input.text.replace(/ /g, '').slice(-2) : '');

  if (units === 'eg') units = 'd' + units;

  min = (min === undefined ? 0 : min);
  max = (max === undefined ? Infinity : max);
  step = (ev.shiftKey && ev.ctrlKey ? 10
    : (ev.ctrlKey && !ev.altKey ? .1
      : (ev.ctrlKey && ev.altKey ? .5
        : (ev.altKey ? .2 : 1)
        )
      )
    );
  if (ev.shiftKey && !ev.ctrlKey) {
    round = true;
    step = 10;
  }

  if (isNaN(_value)) {
      _input.text = min;
  }
      else {
          if (round) {
            if (_dir === 'u') {
              _value = Math.ceil(_value / 10) * 10;
              if (_value === _valueOld) {
                _value += step;
              }
            } else if (_dir === 'd') {
              _value = Math.floor(_value / 10) * 10;
              if (_value === _valueOld) {
                _value -= step;
              }
            } else {
              _value = false;
            }
          }
            else {
              _value = ( (_dir === 'u') ? _value + step : ((_dir === 'd') ? _value - step : false) );
            }

          if (_value !== false) {
              _value = (_value <= min ? min : (_value >= max ? max : _value))
              _input.text = _value;
              if (callback instanceof Function) callback(_value, _input, min, max, units);
                  else if (units) _input.text = parseFloat(_input.text) + ' ' + units;
          }
              else if (units) _input.text = parseFloat(_input.text) + ' ' + units;
      }
}

var isUndo = false,
  win = new Window('dialog',  'Long shadow \u00A9 www.ladyginpro.ru');

win.alignChildren = 'fill';

with (panel = win.add('panel')) {
  alignChildren = ['fill', 'bottom'];

  with (add('group')) {
    add('statictext', undefined, 'Angle:');
    var __sliderInput = add('edittext', [0, 0, 65, 25], '45 deg');
    var __slider = add('slider', [0, 0, 200, 15], 45, 0, 360);

    __sliderInput.active = true;
    __slider.onChanging = function (e) { __sliderInput.text = Math.round(this.value) + ' deg'; }
    __slider.onChange = function (e) { previewStart(); }
    __sliderInput.addEventListener('keydown', function (e) { inputNumberEvents(e, this, __slider.minvalue, __slider.maxvalue); });
    __sliderInput.addEventListener('keyup', function (e) { __slider.value = Math.round(this.text); previewStart(); });
  }

  with (add('group')) {
    add('statictext', undefined, 'Size:');
    var __sliderInputSize = add('edittext', [0, 0, 75, 25], '300 px');
    var __sliderSize = add('slider', [0, 0, 200, 15], 300, 0, 1000);

    __sliderInputSize.active = true;
    __sliderSize.onChanging = function (e) { __sliderInputSize.text = Math.round(this.value) + ' px'; }
    __sliderSize.onChange = function (e) { previewStart(); }
    __sliderInputSize.addEventListener('keydown', function (e) { inputNumberEvents(e, this, __sliderSize.minvalue, __sliderSize.maxvalue * 5); });
    __sliderInputSize.addEventListener('keyup', function (e) { __sliderSize.value = Math.round(this.text); previewStart(); });
  }

  with (win.add('group')) {
    orientation = 'row';
    alignChildren = ['fill', 'fill'];

    var preview = add('checkbox', undefined, 'Preview'),
        cancelBtn = add('button', undefined, 'Cancel'),
        applyBtn = add('button', undefined, 'Ok', { name: 'ok' });

    preview.value = true;

    preview.onClick = function() { previewStart(); }
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

}

function startAction() {
  shadow(__items, {
    angle: __slider.value,
    size: $.convertUnits(__sliderInputSize.text, 'px')
  });
}

function previewStart() {
  try  {
    if (preview.value) {
        if (isUndo) {
          app.undo();
        }
            else isUndo = true;

        startAction();
        app.redraw();
    }
        else if (isUndo) {
            app.undo();
            app.redraw();
            isUndo = false;
        }
  } catch (err) {
    alert(err + '\n' + err.line);
  }
}


win.onClose = function () {
  try {
    if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
        items = null;
    }
  } catch (e) {}
  saveSettings();
}


function saveSettings() {
    try{
    var $file = new File(settingFile.folder + settingFile.name),
        data = [
          __sliderInput.text,
          __sliderInputSize.text,
          preview.value
        ].toString();

    $file.open('w');
    $file.write(data);
    $file.close();
    }catch(e){$.errorMessage(e);}
}

function loadSettings() {
    var $file = File(settingFile.folder + settingFile.name);
    if ($file.exists) {
        try {
            $file.open('r');
            var data = $file.read().split('\n'),
                $main = data[0].split(',');
          __sliderInput.text = $main[0];
          __sliderInputSize.text = $main[1];
          preview.value = ($main[2] === 'true');

          __slider.value = parseInt($main[0]);
          __sliderSize.value = parseInt($main[1]);
        } catch (e) {}
        $file.close();
    }
}

function checkSettingFolder() {
    var $folder = new Folder(settingFile.folder);
    if (!$folder.exists) $folder.create();
}

checkSettingFolder();
loadSettings();



if (__items.length) {
  if (preview.value) {
    previewStart();
    isUndo = preview.value;
  }
  
  win.center();
  win.show();
}