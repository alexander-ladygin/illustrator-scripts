/* 

  Author: A Jongware Script (Circle fill)
  Program version: Adobe Illustrator CC+
  Name: fillinger.jsx;

  Modify and refactoring: Alexander Ladygin
  www.ladygin.pro

  Copyright (c) 2018

*/
if (app.documents.length && app.selection.length < 2) {
	alert('Please select 2 or more objects');
}
else {
	function inputNumberEvents (ev, _input, min, max, callback){
		var step,
			_dir = ev.keyName.toLowerCase().slice(0,1),
			_value = parseFloat(_input.text),
			units = (',px,pt,mm,cm,in,'.indexOf(_input.text.length > 2 ? (',' + _input.text.replace(/ /g, '').slice(-2) + ',') : ',!,') > -1 ? _input.text.replace(/ /g, '').slice(-2) : '');
	
		min = (min === undefined ? 0 : min);
		max = (max === undefined ? Infinity : max);
		step = (ev.shiftKey ? 10 : (ev.ctrlKey ? .1 : 1));
	
		if (isNaN(_value)) {
			_input.text = min;
		}
			else {
				_value = ( ((_dir === 'u') || (_dir === 'r')) ? _value + step : (((_dir === 'd') || (_dir === 'l')) ? _value - step : false) );
				if (_value !== false) {
					_value = (_value <= min ? min : (_value >= max ? max : _value))
					_input.text = _value;
					if (callback instanceof Function) callback(_value, _input, min, max, units);
				}
			}
	}

	var win = new Window('dialog', 'Fillinger \u00A9 www.ladygin.pro');
	win.orientation = 'column';
	win.alignChildren = ['fill', 'fill'];

	var sizePanel = win.add('panel', undefined, 'Items size in % of total size'),
		sizeGroup = sizePanel.add('group');
	sizePanel.alignChildren = 'fill';
	sizeGroup.orientation = 'row';
	sizeGroup.alignChildren = ['fill', 'fill'];

	var maxValueGroup = sizeGroup.add('group');
		maxValueGroup.orientation = 'row';
		maxValueGroup.alignChildren = 'fill';
	var maxValueLabel = maxValueGroup.add('statictext', undefined, 'Max:'),
		maxValue = maxValueGroup.add('edittext', [0, 0, 50, 25], '10');
		maxValueLabel.justify = 'center';

	var minValueGroup = sizeGroup.add('group');
		minValueGroup.orientation = 'row';
		minValueGroup.alignChildren = 'fill';
	var minValueLabel = minValueGroup.add('statictext', undefined, 'Min:'),
		minValue = minValueGroup.add('edittext', [0, 0, 50, 25], '4');
		minValueLabel.justify = 'center';

	function checkMnMaxSize (val, item, min, max) {
		if (item === minValue) {
			if (val > parseFloat(maxValue.text)) { maxValue.text = (val >= max ? max : val); }
		}
			else if (item === maxValue) {
				if (val < parseFloat(minValue.text)) { minValue.text = (val < min ? min : val); }
			}

	}
	maxValue.addEventListener('keydown', function (e) {
		if (e.ctrlKey && e.keyName === 'Right') minValue.text = this.text;
			else inputNumberEvents(e, maxValue, 1, Infinity, checkMnMaxSize);
	});
	minValue.addEventListener('keydown', function (e) {
		if (e.ctrlKey && e.keyName === 'Left') maxValue.text = this.text;
			else inputNumberEvents(e, minValue, 1, Infinity, checkMnMaxSize);
	});

	var guttersResizeGroup = sizePanel.add('group');
		guttersResizeGroup.orientation = 'row';
		guttersResizeGroup.alignChildren = ['fill', 'fill'];

	var guttersGroup = guttersResizeGroup.add('group');
		guttersGroup.orientation = 'column';
		guttersGroup.alignChildren = 'fill';
	var guttersLabel = guttersGroup.add('statictext', undefined, 'Min distance')
		guttersValue = guttersGroup.add('edittext', undefined, '0');
		guttersValue.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0, Infinity); });

	var resizeGroup = guttersResizeGroup.add('group');
		resizeGroup.orientation = 'column';
		resizeGroup.alignChildren = 'fill';
	var resizeLabel = resizeGroup.add('statictext', undefined, 'Resize value')
		resizeValue = resizeGroup.add('edittext', undefined, '70');
		resizeValue.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 10, Infinity); });

	var rotatePositionGroup = win.add('group');
		rotatePositionGroup.orientation = 'row';
		rotatePositionGroup.alignChildren = ['fill', 'fill'];

	var rotatePanel = rotatePositionGroup.add('panel', undefined, 'Rotate items:');
		rotatePanel.alignChildren = 'fill';
	var randomRadioGroup = rotatePanel.add('group');
		randomRadioGroup.orientation = 'column';
	var randomRotate = randomRadioGroup.add('radiobutton', undefined, 'Random'),
		rotateByValue = randomRadioGroup.add('radiobutton', undefined, 'By value'),
		rotateValue = rotatePanel.add('edittext', undefined, '0');
	randomRotate.value = true;
	rotateValue.enabled = false;
	randomRotate.onClick = function() { rotateValue.enabled = false; }
	rotateByValue.onClick = function() { rotateValue.enabled = true; }

	var objectPositionPanel = rotatePositionGroup.add('panel', undefined, 'The item to fill is:'),
		objectPositionGroup = objectPositionPanel.add('group');
		objectPositionGroup.orientation = 'column';
		objectPositionGroup.alignChildren = ['fill', 'fill'];
	var objectPosTop = objectPositionGroup.add('radiobutton', undefined, 'On top'),
		objectPosBottom = objectPositionGroup.add('radiobutton', undefined, 'Below'),
		objectPosLayers = objectPositionGroup.add('checkbox', undefined, 'As in [Layers]');
		objectPosTop.value = true;
	var randomItems = win.add('checkbox', undefined, 'Random items (if items in the group)'),
		removeTopElement = win.add('checkbox', undefined, 'Remove the item to fill after executing');
	
	var winButtons = win.add('group');
		winButtons.orientation = 'row';
		winButtons.alignChildren = ['fill', 'fill'];
		winButtons.margins = 0;

	var cancel = winButtons.add('button', undefined, 'Cancel');
		cancel.helpTip = 'Press Esc to Close';
		cancel.onClick = function () { win.close(); }

	var ok = winButtons.add('button', undefined, 'OK');
		ok.helpTip = 'Press Enter to Run';
		ok.onClick = function (e) {
			startAction();
			win.close();
		};
		ok.active = true;

/*

	random rotate
	rotate from value

*/

	function startAction(){
		var __rotateValue = Number(rotateValue.text);
		maxCircleSize = Number(maxValue.text);
		if (maxCircleSize < 0.01 || maxCircleSize > 100){maxCircleSize = 20;}
		minCircleSize = Number(minValue.text);
		if (minCircleSize < 0.01 || minCircleSize > maxCircleSize){minCircleSize = maxCircleSize/2;}
		maxCircleSize /= 100;
		minCircleSize /= 100;
		maxCircleSize /= 2;
		minCircleSize /= 2;
		minDistanceToOtherCircles = Number(guttersValue.text);
		var items = selection.concat();
		if (!objectPosLayers.value) items.sort(function (a, b) {
			return a.geometricBounds[1] <= b.geometricBounds[1];
		});

		if (objectPosBottom.value) items.reverse();

		var object = items[0];
		if (object.typename !== 'PathItem' && object.typename !== 'CompoundPathItem') {
			return alert('The filling object must be PathItem or CompoundPathItem! [' + object.typename + ']');
		}
		items.splice(0,1);
		var placeObject = (items.length === 1 ? (items[0].typename === 'GroupItem' ? items[0].pageItems : items[0]) : (!items.length ? [] : items));
		if (!placeObject.length) {
			return alert('No items to fill!');
		}
		var placeObjectResizeValue = (isNaN(parseFloat(resizeValue.text)) ? parseFloat(resizeValue.text) : 70),
			innerpaths = [],
			outerPath = null;

		function getNode() {
			return ((!randomItems.value) ? placeObject[0] : placeObject[ Math.floor(Math.random() * placeObject.length) ]);
		}

		if (object.constructor.name == "CompoundPathItem"){
			for (p=0; p<object.pathItems.length; p++){
				innerpaths.push(flattenPath(object.pathItems[p]));
			}
			if (innerpaths.length == 1 && outerPath == null){
				outerPath = innerpaths[0];
				innerpaths = [];
			}
			else {
				var minx = innerpaths[0][0][0], outer = 0;
				for (p=0; p<innerpaths.length; p++){
					for (q=0; q<innerpaths[p].length; q++){
						if (innerpaths[p][q][0] < minx){
							minx = innerpaths[p][q][0];
							outer = p;
						}
					}
				}
				outerPath = innerpaths[outer];
				innerpaths.splice (outer,1);
			}
		}
		else {outerPath = flattenPath(object);}
		if (outerPath == null){alert ("Got a bad path. What's going on?");}
		else{
			minx = object.geometricBounds[0];
			miny = object.geometricBounds[1];
			maxx = object.geometricBounds[2];
			maxy = object.geometricBounds[3];
			if (minx > maxx){x = minx;minx = maxx;maxx = x;}
			if (miny > maxy){y = miny;miny = maxy;maxy = y;}
			maxwide = maxx - minx;
			maxhigh = maxy - miny;
			totalArea = Math.abs(object.area);
			filledArea = 0;
			Math_Epsilon = 0.0001;
			joinedPath = outerPath;
			triangleIndexList = Triangulate (joinedPath, innerpaths);
			triangleList = [];
			for (p=0; p<triangleIndexList.length; p+=3){
				triangleList.push([joinedPath[triangleIndexList[p]],joinedPath[triangleIndexList[p+1]],joinedPath[triangleIndexList[p+2]] ] );
			}
			edgeList = [ [outerPath[outerPath.length-1], outerPath[0]] ];
			for (i=0; i<outerPath.length-1; i++){edgeList.push ( [ outerPath[i], outerPath[i+1] ] );}
			for (i=0; i<innerpaths.length; i++){
				edgeList.push ( [ innerpaths[i][innerpaths.length-1], innerpaths[i][0] ] );
				for (i2=0; i2<innerpaths[i].length-1; i2++){edgeList.push ( [ innerpaths[i][i2], innerpaths[i][i2+1] ] );}
			}
			areaList = [];
			triArea = 0;
			for (p=0; p<triangleList.length; p++){
				triArea += Math.abs (Area([
					triangleList[p][0], triangleList[p][1],
					triangleList[p][1], triangleList[p][2],
					triangleList[p][2], triangleList[p][0] ] ) );
				areaList.push(triArea);
			}

			pointList = [];
			circleList = [];
			radiiList = [ ];
			maxsize = Math.sqrt(maxwide * maxhigh);
			size = maxCircleSize;
			while (1){
				radiiList.push (size*maxsize);
				size *= .667;
				if (size < minCircleSize){break;}
			}
			for (rad=0; rad<radiiList.length; rad++){
				for (p=0; p<1000; p++){
					a_rnd = Math.random() * triArea;
					for (q=0; q<triangleList.length; q++) {
						if (areaList[q] > a_rnd) {break;}
					}
				
					pt = getRandomPoint (triangleList[q]);
					d = distanceToClosestEdge (pt, edgeList);
					if (d >= radiiList[rad]){
						for (c=0; c<pointList.length; c++){
							xd = Math.abs (pt[0]-pointList[c][0]);
							yd = Math.abs (pt[1]-pointList[c][1]);
							if (xd <= radiiList[rad]+circleList[c]+minDistanceToOtherCircles &&
								yd <= radiiList[rad]+circleList[c]+minDistanceToOtherCircles){
								d = distanceFromPointToPoint (pt, pointList[c])-minDistanceToOtherCircles;
								if (d < radiiList[rad]+circleList[c])
									break;
							}
						}
						if (c == pointList.length){
							nrad = radiiList[rad];
							pointList.push ( pt );
							circleList.push (nrad);
						}
					} 
				}
			}
			for (p=0; p<pointList.length; p++){
				pt = pointList[p];
				nrad = distanceToClosestEdge (pt, edgeList);
				for (c=0; c<pointList.length; c++){
					if (c == p)
						continue;
					xd = Math.abs (pt[0]-pointList[c][0]);
					yd = Math.abs (pt[1]-pointList[c][1]);
					if (xd <= nrad+circleList[c]+minDistanceToOtherCircles &&
						yd <= nrad+circleList[c]+minDistanceToOtherCircles)
					{
						nd = distanceFromPointToPoint (pt, pointList[c])-circleList[c]-minDistanceToOtherCircles;
						if (nd < nrad)
							nrad = nd;
					}
				}
				circleList[p] = nrad;
				var __placeObject = getNode().duplicate(),
					placeObjectSize = (__placeObject.width >= __placeObject.height ? 'width' : 'height'),
					placeObjectSizeReverse = (placeObjectSize === 'width' ? 'height' : 'width'),
					__radius = 2 * nrad,
					__size = __radius * (placeObjectResizeValue / 100);
					__ratio = __size * 100 / __placeObject[placeObjectSize] / 100;

				__placeObject.move(object, ElementPlacement.PLACEBEFORE);
				__placeObject[placeObjectSize] = __size;
				__placeObject[placeObjectSizeReverse] *= __ratio;
				__placeObject.position = [pt[0]-nrad + ((__radius - __placeObject.width) / 2), pt[1]+nrad - ((__radius - __placeObject.height) / 2)];
				if (randomRotate.value) __placeObject.rotate(Math.floor(Math.random() * 360));
					else if (rotateByValue.value && __rotateValue) __placeObject.rotate(__rotateValue);
			}
		}

		if (removeTopElement.value) object.remove();
	}
	function drawLine (a,b){var p = app.activeDocument.pathItems.add();try {p.setEntirePath ([ a,b ]);p.strokeWidth = 0.1;} catch (e){alert ("Bad line:\ra="+a+"\rb="+b);}return p;}
	function distanceFromPointToPoint(A, B){return Math.sqrt ( ((A[0]-B[0]) * (A[0]-B[0])) + ((A[1]-B[1]) * (A[1]-B[1])) );}
	function flattenPath(obj){var newpath = new Array(),curveList,pt, nextpt,isFlattened = false;if (!obj.hasOwnProperty ("pathPoints")){return null;}for (pt=0; pt<obj.pathPoints.length; pt++){nextpt = pt+1;if (nextpt == obj.pathPoints.length){nextpt = 0;}if (obj.pathPoints[pt].anchor[0] == obj.pathPoints[pt].rightDirection[0] && obj.pathPoints[pt].anchor[1] == obj.pathPoints[pt].rightDirection[1] &&obj.pathPoints[nextpt].anchor[0] == obj.pathPoints[nextpt].leftDirection[0] && obj.pathPoints[nextpt].anchor[1] == obj.pathPoints[nextpt].leftDirection[1]){newpath.push (obj.pathPoints[pt].anchor);} else{isFlattened = true;curveList = curve4(obj.pathPoints[pt].anchor[0],obj.pathPoints[pt].anchor[1],obj.pathPoints[pt].rightDirection[0],obj.pathPoints[pt].rightDirection[1],obj.pathPoints[nextpt].leftDirection[0],obj.pathPoints[nextpt].leftDirection[1],obj.pathPoints[nextpt].anchor[0],obj.pathPoints[nextpt].anchor[1],4);newpath = newpath.concat(curveList);}}return newpath;}
	function pointInsidePoly(pt, poly){for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i){((poly[i][1] <= pt[1] && pt[1] < poly[j][1]) || (poly[j][1] <= pt[1] && pt[1] < poly[i][1]))&& (pt[0] < (poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])&& (c = !c);}return c;}
	function getWinding(path){var i,next;var accum = 0;for (i=0; i<path.length-1; i++){next = i+1;accum += path[next][0] * path[i][1] - path[i][0] * path[next][1];}next = 0;accum += path[next][0] * path[i][1] - path[i][0] * path[next][1];return accum / 2;}
	function curve4(x1, y1,x2, y2,x3, y3,x4, y4,nSteps){var pointList = new Array(),dx1 = x2 - x1,dy1 = y2 - y1,dx2 = x3 - x2,dy2 = y3 - y2,dx3 = x4 - x3,dy3 = y4 - y3,subdiv_step  = 1.0 / (nSteps + 1),subdiv_step2 = subdiv_step*subdiv_step,subdiv_step3 = subdiv_step*subdiv_step*subdiv_step,pre1 = 3.0 * subdiv_step,pre2 = 3.0 * subdiv_step2,pre4 = 6.0 * subdiv_step2,pre5 = 6.0 * subdiv_step3,tmp1x = x1 - x2 * 2.0 + x3,tmp1y = y1 - y2 * 2.0 + y3,tmp2x = (x2 - x3)*3.0 - x1 + x4,tmp2y = (y2 - y3)*3.0 - y1 + y4,fx = x1,fy = y1,dfx = (x2 - x1)*pre1 + tmp1x*pre2 + tmp2x*subdiv_step3,dfy = (y2 - y1)*pre1 + tmp1y*pre2 + tmp2y*subdiv_step3,ddfx = tmp1x*pre4 + tmp2x*pre5,ddfy = tmp1y*pre4 + tmp2y*pre5,dddfx = tmp2x*pre5,dddfy = tmp2y*pre5,step = nSteps;pointList.push ([x1, y1]);while(step--){fx += dfx;fy += dfy;dfx += ddfx;dfy += ddfy;ddfx += dddfx;ddfy += dddfy;pointList.push ([fx, fy]);}return pointList;}
	function Triangulate(m_points, holes){var indices = new Array();if (holes.length){for (hh=0; hh<holes.length; hh++){var h = holes[hh],miny = 0;for (var i=1; i<h.length; i++)if (h[i][1] < h[miny][1]){miny = i;}var closestpt = 0,closestd = distanceFromPointToPoint (h[miny], m_points[closestpt]);for (var i=1; i<m_points.length; i++){var d= distanceFromPointToPoint (h[miny], m_points[i]);if (d < closestd){closestd = d;closestpt = i;}}m_points.splice (closestpt, 0, [ m_points[closestpt][0],m_points[closestpt][1]+0.05 ]);closestpt++;h.splice (miny, 0, [ h[miny][0],h[miny][1] ]);h[miny][1] += 0.05;for (var i=miny; i >=0; i--){m_points.splice (closestpt, 0, h[i]);}for (var i=h.length-1; i > miny; i--){m_points.splice (closestpt, 0, h[i]);}}}var n = m_points.length;if (n < 3) {return indices;}var V = new Array(n);if (Area(m_points) > 0){for (var v = 0; v < n; v++)V[v] = v;}else{for (var v = 0; v < n; v++){V[v] = (n - 1) - v;}}
	var nv = n,count = 2 * nv;for (var m = 0, v = nv - 1; nv > 2;){if ((count--) <= 0){return indices;}var u = v;if (nv <= u){u = 0;}v = u + 1;if (nv <= v){v = 0;}var w = v + 1;if (nv <= w){w = 0;}if (Snip(u, v, w, nv, V, m_points)){var a, b, c, s, t;a = V[u];b = V[v];c = V[w];indices.push(a);indices.push(b);indices.push(c);m++;for (s = v, t = v + 1; t < nv; s++, t++){V[s] = V[t];}nv--;count = 2 * nv;}}indices.reverse();return indices;}
	function Area(m_points){var n = m_points.length,A = 0.0;for (var p = n - 1, q = 0; q < n; p = q++){var pval = m_points[p],qval = m_points[q];A += pval[0] * qval[1] - qval[0] * pval[1];}return (A * 0.5);}
	function Snip(u, v, w, n, V, m_points){var p,A = m_points[V[u]],B = m_points[V[v]],C = m_points[V[w]];if (Math_Epsilon > (((B[0] - A[0]) * (C[1] - A[1])) - ((B[1] - A[1]) * (C[0] - A[0])))){return false;}for (p = 0; p < n; p++) {if ((p == u) || (p == v) || (p == w)){continue;}var P = m_points[V[p]];if (InsideTriangle(A, B, C, P)){return false;}}return true;}
	function InsideTriangle(A, B, C, P){var ax, ay, bx, by, cx, cy, apx, apy, bpx, bpy, cpx, cpy,cCROSSap, bCROSScp, aCROSSbp;ax = C[0] - B[0]; ay = C[1] - B[1];bx = A[0] - C[0]; by = A[1] - C[1];cx = B[0] - A[0]; cy = B[1] - A[1];apx = P[0] - A[0]; apy = P[1] - A[1];bpx = P[0] - B[0]; bpy = P[1] - B[1];cpx = P[0] - C[0]; cpy = P[1] - C[1];aCROSSbp = ax * bpy - ay * bpx;cCROSSap = cx * apy - cy * apx;bCROSScp = bx * cpy - by * cpx;return ((aCROSSbp >= 0.0) && (bCROSScp >= 0.0) && (cCROSSap >= 0.0));}
	function plotRandomPoint(triangle){var Ax,Ay,Bx,By,Cx,Cy, a,b,c, Px,Py;Ax = triangle[0][0];Ay = triangle[0][1];Bx = triangle[1][0];By = triangle[1][1];Cx = triangle[2][0];Cy = triangle[2][1];a = Math.random();b = Math.random()*(1-a);c = 1-a-b;Px = a*Ax + b*Bx + c*Cx;Py = a*Ay + b*By + c*Cy;app.activeDocument.pathItems.ellipse (Py+1,Px-1,2,2);}
	function getRandomPoint(triangle){var Ax,Ay,Bx,By,Cx,Cy, a,b,c, Px,Py;Ax = triangle[0][0];Ay = triangle[0][1];Bx = triangle[1][0];By = triangle[1][1];Cx = triangle[2][0];Cy = triangle[2][1];do{a = Math.random();b = Math.random();} while (a + b >= 1);c = 1-a-b;Px = a*Ax + b*Bx + c*Cx;Py = a*Ay + b*By + c*Cy;return [Px,Py];}
	function getCircleThru(v1, v2, v3){var x1 = v1[0],y1 = v1[1],x2 = v2[0],y2 = v2[1],x3 = v3[0],y3 = v3[1],s = 0.5*((x2 - x3)*(x1 - x3) - (y2 - y3)*(y3 - y1)),sUnder = (x1 - x2)*(y3 - y1) - (y2 - y1)*(x1 - x3);if (Math.abs(sUnder) < 0.001){return null;}s /= sUnder;var xc = 0.5*(x1 + x2) + s*(y2 - y1),yc = 0.5*(y1 + y2) + s*(x1 - x2);var radius = Math.sqrt((xc-x1)*(xc-x1)+(yc-y1)*(yc-y1));return [ xc, yc, radius ];}
	function distanceToClosestEdge(pt, edgelist){var d,p, d2;d = ClosestPointOnLine (pt, [ edgelist[0][0], edgelist[0][1] ]);d = d[1];for (p=1; p<edgelist.length; p++){d2 = ClosestPointOnLine (pt, [ edgelist[p][0], edgelist[p][1] ]);if (d2[1] < d){d = d2[1];}}return d;}
	function ClosestPointOnLine(pt, line){var X1 = line[0][0], Y1 = line[0][1],X2 = line[1][0], Y2 = line[1][1],px = pt[0], py = pt[1],dx = X2 - X1,dy = Y2 - Y1,nx,ny;if (dx == 0 && dy == 0){nx = X1;ny = Y1;}else{var t = ((px - X1) * dx + (py - Y1) * dy) / (dx * dx + dy * dy);if (t <= 0){nx = X1;ny = Y1;}else if (t >= 1){nx = X2;ny = Y2;} else{nx = X1 + t * dx;ny = Y1 + t * dy;}}dx = px - nx;dy = py - ny;return [ [nx, ny], Math.sqrt (dx * dx + dy * dy) ]}
	function point(arr){this.x = arr[0];this.y = arr[1];this.distance = function (pt) { return Math.sqrt ( (this.x-pt.x)*(this.x-pt.x) + (this.y-pt.y)*(this.y-pt.y) ) }}

	win.center();
	win.show();
}