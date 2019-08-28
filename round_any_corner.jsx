// Round Any Corner

// rounds selected corners of PathItems.
// Especially for the corners at the intersection point of curves,
// this script may work better than "Round Corners" filter (but slower).

// ## How To Use

// ## Illustrator CS
//  1. Select the anchor(s) or whole path(es) to round.
//  2. Run this script. A prompt window appears to set the rounding radius.
//     Input the radius in point, then click OK.
//  #. You can choose a behavior like Illustrator10 by change the setting.
//     (-- see "setting" section below)

// ## Illustrator 10
//  1. Select the anchor(s) or whole path(es) to round
//     WITH a foreground path that specifies the rounding radius.
//     Half width of foreground path is used for the radius. (excluding stroke width)
//     Using a circle is most suitable for intuitive understanding and ease of use.
//     The script asks you to continue if there's a difference greater than 1 pt
//     between width and height of foreground path.
//  2. Run this script.  The foreground path is removed after rounding.
//  #. When the number of selected path is 1, predefined radius is used
//     for rounding. (-- see "setting" section below)

// ## Rounding Method
// Basically, the rounding method is compatible with the "Round Corners" filter.
// It is to add two anchors instead of the original anchor, at the points of
// specified line length from each selected corner.  So if there're too many
// anchors on original path, this script can not round nicely.

// ## Radius
// Actually, the specified "radius" is not for a radius of arcs which drawn.
// It is for the line length from each selected corner and is for the base
// to compute the length of handles.  The reason calling it "radius" is
// for compatibility with the "Round Corners" filter.


// This script does not round the corners which already rounded.
// (for example, select a circle and run this script does nothing)

// ### notice
// In the rounding process, the script merges anchors which nearly
// overlapped (when the distance between anchors is less than 0.05 points).

// This script does not work for some part of compound pathes.
// When this occurs, please select part of the compound path or release the compound path and
// select them, then run script again.
// I still have not figured out how to get properties from grouped pathes inside a compound path.


// JavaScript Script for Adobe Illustrator CS3
// Tested with Adobe Illustrator CS3 13.0.3, Windows XP SP2 (Japanese version).
// This script provided "as is" without warranty of any kind.
// Free to use and distribute.

// Copyright(c) 2005-2009 SATO Hiroyuki
// http://park12.wakwak.com/~shp/lc/et/en_aics_script.html

// Change Log
// 2005-09-18 release on the web
// ...
// 2009-04-28 modified input part to accept unit and operator
// 2009-05-23 some refinements

// Create UI interface: Alexander Ladygin
// http://ladygin.pro
// i@ladygin.pro

var ver10 = (version.indexOf('10') == 0);


function roundAnyCorner(){
  // setting ----------------------------------------------

  // -- rr : rounding radius ( unit : point )
  // ## on IllustratorCS, this value is for default value in prompt window.
  
  var rr = 30;

  // -- use_foreground_shape_to_set_radius
  // set this "true" to use half width of foreground path as rounding radius
  // instead of set the radius with prompt window.
  // ## on Illustrator10, this value is always true.
  
  var use_foreground_shape_to_set_radius = false; // set true or false
  
  // -- check_circle
  // when use_foreground_shape_to_set_radius = true, 
  // setting this "true", the script asks you to continue if there's a difference
  // greater than 1 pt between width and height of foreground path.
  // it only checks difference between width and height.
  
  var check_circle = true;

  // ------------------------------------------------------
  if(ver10) use_foreground_shape_to_set_radius = true;

  var s = globalPathItems;
  // var s = [];
  // getPathItemsInSelection(1, s); // extract pathItems which pathpoints length is greater than 1
  if(s.length < 1) return;

  // When use half width of foreground path as rounding radius
  if(use_foreground_shape_to_set_radius){
    if(s.length < 2){
      // case : the number of selected path is 1
      // ver10 -- round by predefined value
      // CS -- ask radius by prompt window
      if(! ver10) use_foreground_shape_to_set_radius = false;
    } else {
      // case : the number of selected path > 1
      var pi = s.shift();      // remove foreground path from list of selection
      var rr2 = getRadius(pi, check_circle); // get half width of it
      
      if(rr2 < 0) return;
      
      if(rr2 > 0){
        rr = rr2;
        pi.remove();           // remove the path
      } else {
        // case : the width of foreground path is 0
        // ver10 -- round by predefined value.  the foreground path remains.
        // CS -- ask radius by prompt window  the foreground path remains.
        if(! ver10) use_foreground_shape_to_set_radius = false;
      }
    }
  }
  
  if(!use_foreground_shape_to_set_radius){
    rr = __sliderInput.text.replace(/ /g, ''); // input the radius;
    
    if(!rr) return;
    
    rr = rr.replace(/mm/ig, "*2.83464567");
    rr = rr.replace(/pt/ig, "");
    rr = rr.replace(/px/ig, "");
    rr = rr.replace(/in/ig, "*72");
    rr = rr.replace(/\s+/g,"");
    
    try{
      var eval_rr = eval(rr);
    } catch(e){
      alert("ERROR:\n" + e.description);
      return;
    }
    
    if(isNaN(eval_rr) || eval_rr <= 0){
      alert("\nERROR: fail to convert the expression to a positive number.");
      return;
    }

    rr = eval_rr;
  }

 // var tim = new Date();
  var p, op, pnts;
  var skipList, adjRdirAtEnd, redrawFlg;
  var i, nxi, pvi, q, d,ds, r, g, t, qb;
  var anc1, ldir1, rdir1, anc2, ldir2, rdir2;
  
  var hanLen = 4 * (Math.sqrt(2) - 1) / 3;
  var ptyp = PointType.SMOOTH;

  for(var j = 0; j < s.length; j++){
    p = s[j].pathPoints;
   if(readjustAnchors(p) < 2) continue; // reduce anchors
    op = !s[j].closed;
    pnts = op ? [getDat(p[0])] : [];
    redrawFlg = false;
    adjRdirAtEnd = 0;

    skipList = [(op || !isSelected(p[0]) || ! isCorner(p, 0))];
    for(i = 1; i < p.length; i++){
      skipList.push((! isSelected(p[i])
                     || ! isCorner(p,i)
                     || (op && i == p.length - 1)));
    }
    
    for(i = 0; i < p.length; i++){
      nxi = parseIdx(p, i + 1);
      if(nxi < 0) break;
      
      pvi = parseIdx(p, i - 1);

      q = [p[i].anchor,          p[i].rightDirection,
           p[nxi].leftDirection, p[nxi].anchor];

      ds = dist(q[0], q[3]) / 2;
      if(arrEq(q[0], q[1]) && arrEq(q[2], q[3])){  // straight side
        r = Math.min(ds, rr);
        g = getRad(q[0], q[3]);
        anc1 = getPnt(q[0], g, r);
        ldir1 = getPnt(anc1, g + Math.PI, r * hanLen);
        
        if(skipList[nxi]){
          if(!skipList[i]){
            pnts.push([anc1, anc1, ldir1, ptyp]);
            redrawFlg = true;
          }
          pnts.push(getDat(p[nxi]));
        } else {
          if(r<rr){  // when the length of the side is less than rr * 2
            pnts.push([anc1,
                       getPnt(anc1, getRad(ldir1, anc1), r * hanLen),
                       ldir1,
                       ptyp]);
          } else {
            if(!skipList[i]) pnts.push([anc1, anc1, ldir1, ptyp]);
            anc2 = getPnt(q[3], g+Math.PI, r);
            pnts.push([anc2,
                       getPnt(anc2, g, r * hanLen),
                       anc2,
                       ptyp]);
          }
          redrawFlg = true;
        }
      } else {  // not straight side
        d = getT4Len(q, 0) / 2;
        r = Math.min(d,rr);
        t = getT4Len(q, r);
        anc1 = bezier(q, t);
        rdir1 = defHan(t, q, 1);
        ldir1 = getPnt(anc1, getRad(rdir1, anc1), r * hanLen);

        if(skipList[nxi]){
          if(skipList[i]){
            pnts.push(getDat(p[nxi]));
          } else {
            pnts.push([anc1, rdir1, ldir1, ptyp]);
            with(p[nxi]) pnts.push([anchor,
                                    rightDirection,
                                    adjHan(anchor, leftDirection, 1 - t),
                                    ptyp]);
            redrawFlg = true;
          }
        } else { // skipList[nxi] = false
          if(r < rr){  // the length of the side is less than rr * 2
            if(skipList[i]){
              if(!op && i == 0){
                adjRdirAtEnd = t;
              } else {
                pnts[pnts.length-1][1] = adjHan(q[0], q[1], t);
              }
              pnts.push([anc1,
                         getPnt(anc1, getRad(ldir1, anc1), r * hanLen),
                         defHan(t, q, 0),
                         ptyp]);
            } else {
              pnts.push([anc1,
                         getPnt(anc1, getRad(ldir1, anc1), r * hanLen),
                         ldir1,
                         ptyp]);
            }
          } else {  // round the corner with the radius rr
            if(skipList[i]){
              t = getT4Len(q, -r);
              anc2 = bezier(q, t);
              
              if(!op && i==0) {
                adjRdirAtEnd = t;
              } else {
                pnts[pnts.length - 1][1] = adjHan(q[0], q[1], t);
              }

              ldir2 = defHan(t, q, 0);
              rdir2 = getPnt(anc2, getRad(ldir2, anc2), r * hanLen);

              pnts.push([anc2, rdir2, ldir2 , ptyp]);
            } else {
              qb = [anc1, rdir1, adjHan(q[3], q[2], 1 - t), q[3]];
              t = getT4Len(qb, -r);
              anc2 = bezier(qb, t);
              ldir2 = defHan(t,qb,0);
              rdir2 = getPnt(anc2, getRad(ldir2, anc2), r*hanLen);
              rdir1 = adjHan(anc1, rdir1, t);

              pnts.push([anc1, rdir1, ldir1, ptyp],
                        [anc2, rdir2, ldir2, ptyp]);
            }
          }
          redrawFlg = true;
        }
      }
    }
    if(adjRdirAtEnd > 0){
      pnts[pnts.length - 1][1] = adjHan(p[0].anchor, p[0].rightDirection, adjRdirAtEnd);
    }
    
    if(redrawFlg){
      // redraw
      for(i = p.length-1; i > 0; i--) p[i].remove();
      
      for(i = 0; i < pnts.length; i++){
        pt = i > 0 ? p.add() : p[0];
        with(pt){
          anchor         = pnts[i][0];
          rightDirection = pnts[i][1];
          leftDirection  = pnts[i][2];
          pointType      = pnts[i][3];
        }
      }
    }
  }
  activeDocument.selection = s;
  // alert(new Date() - tim);
}

// ------------------------------------------------
function getRadius(pi, check_circle){
  with(pi){
    var gb = geometricBounds;
    var w = (gb[2] - gb[0]);
    var h = (gb[1] - gb[3]);
    if(check_circle && Math.abs(w - h) > 1
       && !confirm("There's a difference between width and\n"
                   + "height of foreground path. Continue?")){
      return -1;
    }
    return w / 2;
  }
}

// ------------------------------------------------
// return [x,y] of the distance "len" and the angle "rad"(in radian)
// from "pt"=[x,y]
function getPnt(pt, rad, len){
  return [pt[0] + Math.cos(rad) * len,
          pt[1] + Math.sin(rad) * len];
}

// ------------------------------------------------
// return the [x, y] coordinate of the handle of the point on the bezier curve
// that corresponds to the parameter "t"
// n=0:leftDir, n=1:rightDir
function defHan(t, q, n){
  return [t * (t * (q[n][0] - 2 * q[n+1][0] + q[n+2][0]) + 2 * (q[n+1][0] - q[n][0])) + q[n][0],
          t * (t * (q[n][1] - 2 * q[n+1][1] + q[n+2][1]) + 2 * (q[n+1][1] - q[n][1])) + q[n][1]];
}

// -----------------------------------------------
// return the [x, y] coordinate on the bezier curve
// that corresponds to the paramter "t"
function bezier(q, t) {
  var u = 1 - t;
  return [u*u*u * q[0][0] + 3*u*t*(u* q[1][0] + t* q[2][0]) + t*t*t * q[3][0],
          u*u*u * q[0][1] + 3*u*t*(u* q[1][1] + t* q[2][1]) + t*t*t * q[3][1]];
}

// ------------------------------------------------
// adjust the length of the handle "dir"
// by the magnification ratio "m",
// returns the modified [x, y] coordinate of the handle
// "anc" is the anchor [x, y]
function adjHan(anc, dir, m){
  return [anc[0] + (dir[0] - anc[0]) * m,
          anc[1] + (dir[1] - anc[1]) * m];
}

// ------------------------------------------------
// return true if the pathPoints "p[idx]" is a corner
function isCorner(p, idx){
  var pnt0 = getAnglePnt(p, idx, -1);
  var pnt1 = getAnglePnt(p, idx,  1);
  if(! pnt0 || ! pnt1) return false;                    // at the end of a open-path
  if(pnt0.length < 1 || pnt1.length<1) return false;   // anchor is overlapping, so cannot determine the angle
  var rad = getRad2(pnt0, p[idx].anchor, pnt1, true);
  if(rad > Math.PI - 0.1) return false;   // set the angle tolerance here
  return true;
}
// ------------------------------------------------
// "p"=pathPoints, "idx1"=index of pathpoint
// "dir" = -1, returns previous point [x,y] to get the angle of tangent at pathpoints[idx1]
// "dir" =  1, returns next ...
function getAnglePnt(p, idx1, dir){
  if(!dir) dir = -1;
  var idx2 = parseIdx(p, idx1 + dir);
  if(idx2 < 0) return null;  // at the end of a open-path
  var p2 = p[idx2];
  with(p[idx1]){
    if(dir<0){
      if(arrEq(leftDirection, anchor)){
        if(arrEq(p2.anchor, anchor)) return [];
        if(arrEq(p2.anchor, p2.rightDirection)
           || arrEq(p2.rightDirection, anchor)) return p2.anchor;
        else return p2.rightDirection;
      } else {
        return leftDirection;
      }
    } else {
      if(arrEq(anchor, rightDirection)){
        if(arrEq(anchor, p2.anchor)) return [];
        if(arrEq(p2.anchor, p2.leftDirection)
           || arrEq(anchor, p2.leftDirection)) return p2.anchor;
        else return p2.leftDirection;
      } else {
        return rightDirection;
      }
    }
  }
}
// --------------------------------------
// if the contents of both arrays are equal, return true (lengthes must be same)
function arrEq(arr1, arr2) {
  for(var i = 0; i < arr1.length; i++){
    if (arr1[i] != arr2[i]) return false;
  }
  return true;
}

// ------------------------------------------------
// return the distance between p1=[x,y] and p2=[x,y]
function dist(p1, p2) {
  return Math.sqrt(Math.pow(p1[0] - p2[0], 2)
                   + Math.pow(p1[1] - p2[1], 2));
}
// ------------------------------------------------
// return the squared distance between p1=[x,y] and p2=[x,y]
function dist2(p1, p2) {
  return Math.pow(p1[0] - p2[0],2)
       + Math.pow(p1[1] - p2[1],2);
}
// --------------------------------------
// return the angle in radian
// of the line drawn from p1=[x,y] from p2
function getRad(p1,p2) {
  return Math.atan2(p2[1] - p1[1],
                    p2[0] - p1[0]);
}

// --------------------------------------
// return the angle between two line segments
// o-p1 and o-p2 ( 0 - Math.PI)
function getRad2(p1, o, p2){
  var v1 = normalize(p1, o);
  var v2 = normalize(p2, o);
  return Math.acos(v1[0] * v2[0] + v1[1] * v2[1]);
}
// ------------------------------------------------
function normalize(p, o){
  var d = dist(p, o);
  return d == 0 ? [0, 0] : [(p[0] - o[0]) / d,
                            (p[1] - o[1]) / d];
}

// ------------------------------------------------
// return the bezier curve parameter "t"
// at the point which the length of the bezier curve segment
// (from the point start drawing) is "len"
// when "len" is 0, return the length of whole this segment.
function getT4Len(q, len){
  var m = [ q[3][0] - q[0][0] + 3 * (q[1][0] - q[2][0]),
            q[0][0] - 2 * q[1][0] + q[2][0],
            q[1][0] - q[0][0] ];
  var n = [ q[3][1] - q[0][1] + 3 * (q[1][1] - q[2][1]),
            q[0][1] - 2 * q[1][1] + q[2][1],
            q[1][1] - q[0][1] ];
  var k = [ m[0] * m[0] + n[0] * n[0],
            4 * (m[0] * m[1] + n[0] * n[1]),
            2 * ((m[0] * m[2] + n[0] * n[2]) + 2 * (m[1] * m[1] + n[1] * n[1])),
            4 * (m[1] * m[2] + n[1] * n[2]),
            m[2] * m[2] + n[2] * n[2] ];
  
   var fullLen = getLength(k, 1);

  if(len == 0){
    return fullLen;
    
  } else if(len < 0){
    len += fullLen;
    if(len < 0) return 0;

  } else if(len > fullLen){
    return 1;
  }
  
  var t, d;
  var t0 = 0;
  var t1 = 1;
  var torelance = 0.001;
  
  for(var h = 1; h < 30; h++){
    t = t0 + (t1 - t0) / 2;
    d = len - getLength(k, t);
    if(Math.abs(d) < torelance) break;
    else if(d < 0) t1 = t;
    else t0 = t;
  }
  return t;
}

// ------------------------------------------------
// return the length of bezier curve segment
// in range of parameter from 0 to "t"
function getLength(k, t){
  var h = t / 128;
  var hh = h * 2;
  var fc = function(t, k){
    return Math.sqrt(t * (t * (t * (t * k[0] + k[1]) + k[2]) + k[3]) + k[4]) || 0 };
  var total = (fc(0, k) - fc(t, k)) / 2;
  for(var i = h; i < t; i += hh) total += 2 * fc(i, k) + fc(i + h, k);
  return total * hh;
}

// ------------------------------------------------
// extract PathItems from the selection which length of PathPoints
// is greater than "n"
function getPathItemsInSelection(n, pathes){
  if(documents.length < 1) return;
  
  var s = activeDocument.selection;
  
  if (!(s instanceof Array) || s.length < 1) return;

  extractPathes(s, n, pathes);
}

// --------------------------------------
// extract PathItems from "s" (Array of PageItems -- ex. selection),
// and put them into an Array "pathes".  If "pp_length_limit" is specified,
// this function extracts PathItems which PathPoints length is greater
// than this number.
function extractPathes(s, pp_length_limit, pathes){
  for(var i = 0; i < s.length; i++){
    if(s[i].typename == "PathItem"){
      if(pp_length_limit
         && s[i].pathPoints.length <= pp_length_limit){
        continue;
      }
      pathes.push(s[i]);
      
    } else if(s[i].typename == "GroupItem"){
      // search for PathItems in GroupItem, recursively
      extractPathes(s[i].pageItems, pp_length_limit, pathes);
      
    } else if(s[i].typename == "CompoundPathItem"){
      // searches for pathitems in CompoundPathItem, recursively
      // ( ### Grouped PathItems in CompoundPathItem are ignored ### )
      extractPathes(s[i].pathItems, pp_length_limit , pathes);
    }
  }
}

// --------------------------------------
// merge nearly overlapped anchor points 
// return the length of pathpoints after merging
function readjustAnchors(p){
  // Settings ==========================

  // merge the anchor points when the distance between
  // 2 points is within ### square root ### of this value (in point)
  var minDist = 0.0025; 
  
  // ===================================
  if(p.length < 2) return 1;
  var i;

  if(p.parent.closed){
    for(i = p.length - 1; i >= 1; i--){
      if(dist2(p[0].anchor, p[i].anchor) < minDist){
        p[0].leftDirection = p[i].leftDirection;
        p[i].remove();
      } else {
        break;
      }
    }
  }
  
  for(i = p.length - 1; i >= 1; i--){
    if(dist2(p[i].anchor, p[i - 1].anchor) < minDist){
      p[i - 1].rightDirection = p[i].rightDirection;
      p[i].remove();
    }
  }
  
  return p.length;
}
// -----------------------------------------------
// return pathpoint's index. when the argument is out of bounds,
// fixes it if the path is closed (ex. next of last index is 0),
// or return -1 if the path is not closed.
function parseIdx(p, n){ // PathPoints, number for index
  var len = p.length;
  if(p.parent.closed){
    return n >= 0 ? n % len : len - Math.abs(n % len);
  } else {
    return (n < 0 || n > len - 1) ? -1 : n;
  }
}
// -----------------------------------------------
function getDat(p){ // pathPoint
  with(p) return [anchor, rightDirection, leftDirection, pointType];
}
// -----------------------------------------------
function isSelected(p){ // PathPoint
  return p.selected == PathPointSelection.ANCHORPOINT;
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


var isUndo = false,
  win = new Window('dialog', 'Round Any Corner \u00A9 SATO Hiroyuki (UI: Alexander Ladygin)');

win.alignChildren = 'fill';

with (panel = win.add('panel')) {
  alignChildren = ['fill', 'bottom'];

  with (add('group')) {
    var __sliderInput = add('edittext', [0, 0, 50, 25], '50 px');
    var __slider = add('slider', [0, 0, 200, 15], 50, 1, 200);

    __slider.onChanging = function (e) { __sliderInput.text = Math.round(this.value); }
    __slider.onChange = function (e) { previewStart(); }
    __sliderInput.addEventListener('keydown', function (e) { inputNumberEvents(e, this, __slider.minvalue, __slider.maxvalue); });
    __sliderInput.addEventListener('keyup', function (e) { __slider.value = Math.round(this.text); previewStart(); });
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
  roundAnyCorner();
}

function previewStart() {
  try  {
    if (preview.value) {
        if (isUndo) {
          app.undo();
          resetSelectedPathPoints(globalPathItems, globalPathsSelectedPoints);
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
  } catch (e) {
    alert(e);
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
  // return true;
}

function getSelectedPathPoints (items) {
  var arr = [], l = items.length;

  for (var i = 0; i < l; i++) {
    arr.push([]);
    for (var j = 0; j < items[i].pathPoints.length; j++) {
      arr[i].push(items[i].pathPoints[j].selected);
    }
  }

  return arr;
}

function resetSelectedPathPoints (items, pointsSelected) {
  var l = items.length;
  for (var i = 0; i < l; i++) {
    for (var j = 0; j < items[i].pathPoints.length; j++) {
      items[i].pathPoints[j].selected = pointsSelected[i][j];
    }
  }

  return items;
}

var globalPathItems = [];
getPathItemsInSelection(1, globalPathItems);
var globalPathsSelectedPoints = getSelectedPathPoints(globalPathItems);
if (globalPathItems.length) {
  previewStart();
  isUndo = preview.value;

  win.center();
  win.show();
} else {
  alert('Please select PathItem or CompoundPathItem!');
}