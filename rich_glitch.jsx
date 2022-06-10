/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+
  Name: rich_glitch.jsx;

  Copyright (c) 2019
  www.ladyginpro.ru

*/

$.errorMessage = function (err) {alert(err + '\n' + err.line);};
$.forEach = function (items, callback) { var l = items.length; for (var i = 0; i < l; i++) { callback(items[i], i, items); } return items; }
Object.prototype.extend = function (userObject, deep) {try {for (var key in userObject) {if (this.hasOwnProperty(key)) {if (deep&& this[key] instanceof Object&& !(this[key] instanceof Array)&& userObject[key] instanceof Object&& !(userObject[key] instanceof Array)) {this[key].extend(userObject[key], deep);}else this[key] = userObject[key];}}return this;}catch (e) {$.errorMessage('$.objectParser() - error: ' + e);}};
$.toArr = function (classCollection, callback) {var arr = [], l = classCollection.length;if (l > 0) {for (var i = 0; i < l; i++) {arr.push(classCollection[i]);}}if (callback instanceof Function) return callback(arr);return arr;}
Array.prototype.removeAll = function() { var i = this.length; if (i > 0) while (i--) this[i].remove(); return this; }

var scriptName = 'rich_glitch',
    copyright = ' \u00A9 www.ladyginpro.ru',
    settingFile = {
        name: scriptName + '__setting.json',
        folder: Folder.myDocuments + '/LA_AI_Scripts/'
    },
    isUndo = false,
    $items = selection;


function inputNumberEvents (ev, _input, min, max, callback){
    var step,
        round = false,
        _dir = (ev.keyName ? ev.keyName.toLowerCase().slice(0,1) : '#none#'),
        _value = parseFloat(_input.text),
        _valueOld = _value,
        units = (',px,pt,mm,cm,in,'.indexOf(_input.text.length > 2 ? (',' + _input.text.replace(/ /g, '').slice(-2) + ',') : ',!,') > -1 ? _input.text.replace(/ /g, '').slice(-2) : '');
    
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
    } else {
        if (round) {
            if (_dir === 'u') {
                _value = Math.ceil(_value / 10) * 10;
                if (_value === _valueOld) _value += step;
            } else if (_dir === 'd') {
                _value = Math.floor(_value / 10) * 10;
                if (_value === _valueOld) _value -= step;
            } else {
                _value = false;
            }
        } else {
            _value = ( (_dir === 'u') ? _value + step : ((_dir === 'd') ? _value - step : false) );
        }

        if (_value !== false) {
            _value = (_value <= min ? min : (_value >= max ? max : _value))
            _input.text = _value;

            if (callback instanceof Function) {
                callback(_value, _input, min, max, units);
            } else if (units) {
                _input.text = parseFloat(_input.text) + ' ' + units;
            }
        } else if (units) {
            _input.text = parseFloat(_input.text) + ' ' + units;
        }
    }
}

function rvbn (min, max) {
  // random value between numbers 
  return min + Math.floor(Math.random() * (max - min));
}

function ungroup (group) {
  var i = group.pageItems.length;
  if (i > 0) while (i--) group.pageItems[i].moveBefore(group);
  group.remove();
}

function rich_glitch (items, userOptions) {
  var options = {
    fragments:        20,
    offsetX:          10,
    rotate:           10,
    offsetY:          1,
    direction:        'x',
    levels:           2, // max 5
    removeOriginal:   false // do not use with preview
  }.extend(userOptions || {});

  var itemsCollection = [];

  options.fragments = (options.fragments > 0 ? options.fragments : 5) + 1;
  options.direction = ((options.direction !== 'x' && options.direction !== 'y') ? 'x' : options.direction);

  function createGrid (item) {
    var rect,
      copyItem = item.duplicate(item, ElementPlacement.PLACEAFTER),
      bnds = copyItem.visibleBounds,
      $w = bnds[2] - bnds[0],
      $h = bnds[1] - bnds[3],
      gGroup = copyItem.parent.groupItems.add(),
      $fragmentSize = (options.direction === 'x' ? $h : $w) / options.fragments;

      gGroup.move(copyItem, ElementPlacement.PLACEAFTER);

      for (var i = 0; i < options.fragments; i++) {
        rect = gGroup.pathItems.rectangle(
          bnds[1] - (options.direction === 'x' ? $fragmentSize * i : 0),
          bnds[0] + (options.direction === 'x' ? 0 : $fragmentSize * i),
          (options.direction === 'x' ? $w : $fragmentSize),
          (options.direction === 'x' ? $fragmentSize : $h)
        );

        rect.filled = rect.stroked = false;
      }

      copyItem.move(gGroup, ElementPlacement.PLACEATEND);
      itemsCollection.push(gGroup);

      if (options.removeOriginal) item.remove();
        else item.hidden = true;
  }

  function setOffset (item) {
    item.left += rvbn(options.offsetX * -1, options.offsetX);
    item.top -= rvbn(options.offsetY * -1, options.offsetY);
    // item.rotate(options.rotate, true, true, true, true);
  }

  function createOffset (objs, isSetOffset) {
    var n = objs.length;
    for (var j = 0; j < n; j++) {
      if (isSetOffset) {
        setOffset(objs[j]);
      } else if (!objs[j].typename) {
        createOffset(objs[j]);
      } else {
        createOffset(objs[j].pageItems, true);
      }
    }
  }

  function getDuplicates (objs) {
    var arr = [], l = objs.length;
    for (var z = 0; z < l; z++) {
      arr.push(objs[z].duplicate(objs[i], ElementPlacement.PLACEAFTER));
    }
    return arr;
  }

  var l = items.length;
  for (var n = 0; n < l; n++) {
    createGrid(items[n]);
  }

  if (itemsCollection.length) {
    selection = itemsCollection;

    app.executeMenuCommand('Live Pathfinder Divide');
    app.executeMenuCommand('expandStyle');

    var levelsCollection = [selection];
    for (var x = 0; x < options.levels + 1; x++) {
      if (x) levelsCollection.push(getDuplicates(selection));
    }
    createOffset(levelsCollection);
    selection = null;
  }
}

var win = new Window('dialog', 'Rich Glitch' + copyright),
    sWidth = 120;

with (win.add('panel')) {
    alignChildren = 'fill';

    with (add('group')) {
        orientation = 'row';
        alignChildren = 'fill';

        add('statictext', undefined, 'Fragments:');
        var __fragmentsSlider = add('slider', [0, 0, sWidth, 15], 10, 1, 40);
        __fragmentsSlider.maximumSize = [1000, 15];
        __fragmentsSlider.onChanging = function (e) { __fragments.text = Math.round(this.value); }
        __fragmentsSlider.onChange = function (e) { previewStart(); }
        var __fragments = add('edittext', [0, 0, 50, 25], 10);
        __fragments.addEventListener('keydown', function (e) { this.text = Math.round(this.text); inputNumberEvents(e, this, 1, Infinity); __fragmentsSlider.value = Math.round(this.text); });
        __fragments.addEventListener('keyup', function (e) { previewStart(); });
    }
    // with (add('group')) {
    //     orientation = 'row';
    //     alignChildren = 'fill';

    //     add('statictext', undefined, 'Rotate:');
    //     var __rotateSlider = add('slider', [0, 0, sWidth + 24, 15], 0, 0, 360);
    //     __rotateSlider.maximumSize = [1000, 15];
    //     __rotateSlider.onChanging = function (e) { __rotate.text = Math.round(this.value); }
    //     __rotateSlider.onChange = function (e) { previewStart(); }
    //     var __rotate = add('edittext', [0, 0, 50, 25], 0);
    //     __rotate.addEventListener('keydown', function (e) { this.text = Math.round(this.text); inputNumberEvents(e, this, 0, 360); __rotateSlider.value = Math.round(this.text); });
    //     __rotate.addEventListener('keyup', function (e) { previewStart(); });
    // }
    with (add('group')) {
        orientation = 'row';
        alignChildren = 'fill';

        add('statictext', undefined, 'Offset X:');
        var __offsetXSlider = add('slider', [0, 0, sWidth + 15, 15], 0, -100, 100);
        __offsetXSlider.maximumSize = [1000, 15];
        __offsetXSlider.onChanging = function (e) { __offsetX.text = Math.round(this.value); }
        __offsetXSlider.onChange = function (e) { previewStart(); }
        var __offsetX = add('edittext', [0, 0, 50, 25], 0);
        __offsetX.addEventListener('keydown', function (e) { this.text = Math.round(this.text); inputNumberEvents(e, this, 100*-100, 100*100); __offsetXSlider.value = Math.round(this.text); });
        __offsetX.addEventListener('keyup', function (e) { previewStart(); });
    }
    with (add('group')) {
        orientation = 'row';
        alignChildren = 'fill';

        add('statictext', undefined, 'Offset Y:');
        var __offsetYSlider = add('slider', [0, 0, sWidth + 15, 15], 0, -100, 100);
        __offsetYSlider.maximumSize = [1000, 15];
        __offsetYSlider.onChanging = function (e) { __offsetY.text = Math.round(this.value); }
        __offsetYSlider.onChange = function (e) { previewStart(); }
        var __offsetY = add('edittext', [0, 0, 50, 25], 0);
        __offsetY.addEventListener('keydown', function (e) { this.text = Math.round(this.text); inputNumberEvents(e, this, 100*-100, 100*100); __offsetYSlider.value = Math.round(this.text); });
        __offsetY.addEventListener('keyup', function (e) { previewStart(); });
    }
    with (add('group')) {
        orientation = 'row';
        alignChildren = 'fill';

        add('statictext', undefined, 'Levels:');
        var __levels = add('edittext', [0, 0, 40, 25], 0);
        __levels.addEventListener('keydown', function (e) { this.text = Math.round(this.text); inputNumberEvents(e, this, 0, 5); });
        __levels.addEventListener('keyup', function (e) { previewStart(); });
        add('statictext', undefined, 'Direction:');
        var __container = add('dropdownlist', undefined, 'Horizontal,Vertical'.split(','));
        __container.onChange = function () { previewStart(); }
        __container.selection = 0;
    }
    with (add('group')) {
      orientation = 'row';
      alignChildren = 'fill';
    
      var preview = add('checkbox', undefined, 'Preview');
    }
}

with (win.add('group')) {
    orientation = 'row';
    alignChildren = ['fill', 'fill'];

    var cancelBtn = add('button', undefined, 'Cancel'),
      copyButton = add('button', undefined, 'Apply Copy'),
      applyBtn = add('button', undefined, 'OK');

    preview.onClick = function() { previewStart(); }
    cancelBtn.onClick = function() { win.close(); }
    copyButton.onClick = function() {
      if (preview.value && isUndo) {
          isUndo = false;
          $.forEach($items, function (item) {
            item.hidden = false;
          });
          win.close();
      }
          else {
              app.undo();
              startAction();
              isUndo = false;
              $.forEach($items, function (item) {
                item.hidden = false;
              });
              win.close();
          }
    }
    applyBtn.onClick = function() {
      if (preview.value && isUndo) {
          isUndo = false;
          $items.removeAll();
          win.close();
      }
          else {
              app.undo();
              startAction();
              isUndo = false;
              $items.removeAll();
              win.close();
          }
    }
}

function getData() {
  return {
      fragments: isNaN(Math.round(__fragments.text)) ? 10 : Math.round(__fragments.text),
      // rotate:    isNaN(Math.round(__rotate.text)) ? 0 : Math.round(__rotate.text),
      offsetX:   isNaN(Math.round(__offsetX.text)) ? 0 : Math.round(__offsetX.text),
      offsetY:   isNaN(Math.round(__offsetY.text)) ? 0 : Math.round(__offsetY.text),
      levels:    isNaN(Math.round(__levels.text)) ? 0 : Math.round(__levels.text),
      direction: (__container.selection.text.toLowerCase().slice(0,1) === 'h' ? 'x' : 'y')
  };
}

function startAction() {
  rich_glitch($items, getData());
}

function previewStart() {
  if (preview.value) {
      if (isUndo) app.undo();
          else isUndo = true;

      app.redraw();
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
  if (isUndo) {
      app.undo();
      app.redraw();
      isUndo = false;
  }

  saveSettings();
  return true;
}

function saveSettings() {
  try{
  var $file = new File(settingFile.folder + settingFile.name),
      data = [
          __fragments.text,
          // __rotate.text,
          __offsetX.text,
          __offsetY.text,
          __container.selection.index,
          __levels.text
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
          __fragments.text = __fragmentsSlider.value = parseInt($main[0]);
          // __rotate.text = __rotateSlider.value = parseInt($main[1]);
          __offsetX.text = __offsetXSlider.value = parseInt($main[1]);
          __offsetY.text = __offsetYSlider.value = parseInt($main[2]);
          __container.selection = parseInt($main[3]);
          __levels.text = parseInt($main[4]) || 0;
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

selection = null;
win.center();
win.show();