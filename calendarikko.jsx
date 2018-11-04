/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+ (presumably in Adobe Illustrator CS6 - did not test)
  Name: calendarikko.jsx;

  Copyright (c) 2018
  www.ladygin.pro

*/

$.errorMessage = function (err) {alert(err + '\n' + err.line);};
$.appName = {indesign: (BridgeTalk.appName.toLowerCase() === 'indesign'),photoshop: (BridgeTalk.appName.toLowerCase() === 'photoshop'),illustrator: (BridgeTalk.appName.toLowerCase() === 'illustrator')};
$.color = function (a, v) {if (a) {if (typeof a === 'string') {a = a.toLocaleLowerCase();}}else {return undefined;}if ((a === 'hex') && $.appName.illustrator) {if (!v) {return new RGBColor();}else {if (v === 'random') return $.color('rgb', v);else return $.hexToColor(v, 'RGB');}}else if ((a === 'cmyk') || (a === 'cmykcolor')) {var c = new CMYKColor(), b = [];if (v) {b = b.concat(v);if (typeof v === 'string' && v.toLocaleLowerCase() === 'random') {b = [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100), Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)];}else {for (var i = 0; i < b.length; i++) {if (b[i] === 'random') {b[i] = Math.floor(Math.random() * 100);}}}c.cyan = parseInt(b[0]);c.magenta = parseInt(b[1]);c.yellow = parseInt(b[2]);c.black = parseInt(b[3]);}return c;}else if ((a === 'rgb') || (a === 'rgbcolor') || ((a === 'hex') && $.appName.photoshop)) {var c = new RGBColor(), b = [];if (v) {b = b.concat(v);if (typeof v === 'string' && v.toLocaleLowerCase() === 'random') {b = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];}else {for (var i = 0; i < b.length; i++) {if (b[i] === 'random') {b[i] = Math.floor(Math.random() * 100);}}}if ($.appName.photoshop) {if (a !== 'hex' || (typeof v === 'string' && v.toLocaleLowerCase() === 'random')) {c.red = parseInt(b[0]);c.green = parseInt(b[1]);c.blue = parseInt(b[2]);}else {c.hexValue = b[0];}}else if ($.appName.illustrator) {c.red = parseInt(b[0]);c.green = parseInt(b[1]);c.blue = parseInt(b[2]);}}return c;}else if ((a === 'gray') || (a === 'grayscale') || (a === 'grayscale') || (a === 'graycolor')) {var c = new GrayColor(), b = [];if (v) {b = b.concat(v);if (typeof v === 'string' && v.toLocaleLowerCase() === 'random') {b = Math.floor(Math.random() * 100);}c.gray = parseInt(b[0] || b);}return c;}else if ((a === 'lab') || (a === 'labcolor')) {var c = new LabColor(), value, b = [];if (v) {b = b.concat(v);if (typeof v === 'string' && v.toLocaleLowerCase() === 'random') {b = [Math.floor(Math.random() * 100), Math.floor(-128 + Math.random() * 256), Math.floor(-128 + Math.random() * 256)];}else {for (var i = 0; i < b.length; i++) {if (i === 0) {if (b[i] === 'random') {b[i] = Math.floor(Math.random() * 100);}}else {if (b[i] === 'random') {b[i] = Math.floor(-128 + Math.random() * 256);}}}}c.l = parseInt(b[0]);c.a = parseInt(b[1]);c.b = parseInt(b[2]);}return c;}else if ((a === 'spot') || (a === 'spotcolor')) {var c = new SpotColor(), b = [];if (v) {b = b.concat(v);c.tint = parseInt(b[1]);}return c;}else if ((a === 'gradient') || (a === 'Gradient') || (a === 'GradientColor')) {var c = app.activeDocument.gradients.add(), g = new GradientColor(), b = [];if (v) {b = b.concat(v);for (var i = 0; i < b.length; i++) {c.gradientStops[i].color = $.color(b[i][0], b[i][1]);}g.gradient = c;}return g;}else if ((a === 'no') || (a === 'nocolor')) {return new NoColor();}};
$.toHex = function (color, hash) {if (color.typename !== 'RGBColor' && $.appName.illustrator) {color = $.convertColor(color, 'RGB');}return (hash ? '#' : '') + to(color.red) + to(color.green) + to(color.blue);function to(val) {var hex = val.toString(16);return hex.length === 1 ? '0' + hex : hex;}};
$.hexToColor = function (color, type) {color = color.toLocaleLowerCase();color = correct(color);function correct(a) {var l, b = '000000';if (a[0] === '#') {a = a.slice(1);}l = a.length;a = a + b.slice(l);return a;}return $.convertColor($.color('rgb', [parseInt((gc(color)).slice(0, 2), 16), parseInt((gc(color)).slice(2, 4), 16), parseInt((gc(color)).slice(4, 6), 16)]), type || 'rgb');function gc(h) {return (h.slice(0, 1) === '#') ? h.slice(1, 7) : h;}};
$.isColor = function (color) {if ((color.typename === 'GradientColor')|| (color.typename === 'PatternColor')|| (color.typename === 'CMYKColor')|| (color.typename === 'SpotColor')|| (color.typename === 'GrayColor')|| (color.typename === 'LabColor')|| (color.typename === 'RGBColor')|| (color.typename === 'NoColor')) {return true;}else {return false;}};
$.getColorValues = function (color) {if (color === undefined) {return undefined;}else if (color.typename === 'CMYKColor') {return [color.cyan, color.magenta, color.yellow, color.black];}else if (color.typename === 'RGBColor') {return [color.red, color.green, color.blue];}else if (color.typename === 'LabColor') {return [color.l, color.a, color.b];}else if (color.typename === 'SpotColor') {return [color.spotl, color.tint];}else if (color.typename === 'GrayColor') {return [color.gray];}else if (color.typename === 'NoColor') {return undefined;}else if (color.typename === 'GradientColor') {var colors = [], gradients = color.gradient.gradientStops;for (var i = 0; i < gradients.length; i++) {colors = colors.concat(gradients[i].color.getColorValues());}return colors;}};
CMYKColor.prototype.getColorValues = function () {return $.getColorValues(this);};
RGBColor.prototype.getColorValues = function () {return $.getColorValues(this);};
GrayColor.prototype.getColorValues = function () {return $.getColorValues(this);};
LabColor.prototype.getColorValues = function () {return $.getColorValues(this);};
NoColor.prototype.getColorValues = function () {return $.getColorValues(this);};
$.getUnits = function (val, def) {try {return 'px,pt,mm,cm,in,pc'.indexOf(val.slice(-2)) > -1 ? val.slice(-2) : def;}catch (e) {$.errorMessage('check units: " ' + e + ' "');}};
$.convertUnits = function (obj, b) {if (obj === undefined) {return obj;}if (b === undefined) {b = 'px';}if (typeof obj === 'number') {obj = obj + 'px';}if (typeof obj === 'string') {var unit = $.getUnits(obj),val = parseFloat(obj);if (unit && !isNaN(val)) {obj = val;}else if (!isNaN(val)) {obj = val; unit = 'px';}}if ($.appName.illustrator) {if (((unit === 'px') || (unit === 'pt')) && (b === 'mm')) {obj = parseFloat(obj) / 2.83464566929134;}else if (((unit === 'px') || (unit === 'pt')) && (b === 'cm')) {obj = parseFloat(obj) / (2.83464566929134 * 10);}else if (((unit === 'px') || (unit === 'pt')) && (b === 'in')) {obj = parseFloat(obj) / 72;}else if ((unit === 'mm') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 2.83464566929134;}else if ((unit === 'mm') && (b === 'cm')) {obj = parseFloat(obj) * 10;}else if ((unit === 'mm') && (b === 'in')) {obj = parseFloat(obj) / 25.4;}else if ((unit === 'cm') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 2.83464566929134 * 10;}else if ((unit === 'cm') && (b === 'mm')) {obj = parseFloat(obj) / 10;}else if ((unit === 'cm') && (b === 'in')) {obj = parseFloat(obj) * 2.54;}else if ((unit === 'in') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 72;}else if ((unit === 'in') && (b === 'mm')) {obj = parseFloat(obj) * 25.4;}else if ((unit === 'in') && (b === 'cm')) {obj = parseFloat(obj) * 25.4;}return parseFloat(obj);}else if ($.appName.photoshop) {return parseFloat(obj);}};
String.prototype.getUnits = function () {try {var str = this.slice(-2),u = ['px', 'pt', 'mm', 'cm', 'in', 'pc'];for (var i = 0; i < u.length; i++) {if (str === u[i]) {return u[i];}}return false;}catch (e) {$.errorMessage('check units: " ' + e + ' "');}};
String.prototype.convertUnits = function (b) {return $.convertUnits(this.toString(), b);};
String.prototype.hexEncode = function () {var s = unescape(encodeURIComponent(this)), h = '';for (var i = 0; i < s.length; i++) h += s.charCodeAt(i).toString(16);return h;};
String.prototype.hexDecode = function () {var s = '';for (var i = 0; i < this.length; i += 2) s += String.fromCharCode(parseInt(this.substr(i, 2), 16));return decodeURIComponent(escape(s));};
Object.prototype.extend = function (userObject, deep) {try {for (var key in userObject) {if (this.hasOwnProperty(key)) {if (deep&& this[key] instanceof Object&& !(this[key] instanceof Array)&& userObject[key] instanceof Object&& !(userObject[key] instanceof Array)) {this[key].extend(userObject[key], deep);}else this[key] = userObject[key];}}return this;}catch (e) {$.errorMessage('$.objectParser() - error: ' + e);}};
Object.prototype.getNearby = function (prevOrNext) {var parent = this.parent,items = parent.pageItems,l = items.length;prevOrNext = prevOrNext || 'next';for (var i = 0; i < l; i++) {if (items[i] === this) {return (((prevOrNext === 'next') && (i + 1 < l)) ? items[i + 1] : (((prevOrNext === 'prev') && (i - 1 >= 0)) ? items[i - 1] : undefined));}}}
function parseMargin (value, ifErrReturnValue) {value = (typeof value === 'string' ? value.split(' ') : (value instanceof Array ? value : ''));if (!value.length) return ifErrReturnValue !== undefined ? ifErrReturnValue : [0, 0, 0, 0];if (value.length === 2) {value[2] = value[0];value[3] = value[1];}else if (value.length < 4) {var val = value[value.length - 1];for (var i = value.length; i < 4; i++) {value[i] = val;}}for (var i = 0; i < value.length; i++) {value[i] = $.convertUnits(value[i], 'px');}return value;}

var scriptName = 'Calendarikko',
    copyright = ' \u00A9 www.ladygin.pro',
    settingFile = {
        name: scriptName + '__setting.json',
        folder: Folder.myDocuments + '/'
    };

function calendarikko(userOptions) {
    var $date = new Date(),
        options = {
            startYear: $date.getFullYear(),
            endYear: $date.getFullYear(),
            startMonth: 1,
            endMonth: 12,
            frameWidth: 500,
            frameHeight: 500,
            columns_gutter: 0,
            rows_gutter: 0,
            gutter_x: 20,
            gutter_y: 20,
            fontSize: 0.7,
            standart: 'us',
            /*
                eu: European
                us: American
            */
            linkFrames: false,
            otherDays: 'fill',
            enableFrames: {
                day: true,
                week: true,
                month: true,
                yearInMonth: true,
            },
            margin: '0',
            fontColor: {
                body: {
                    type: 'cmyk',
                    values: [0, 0, 0, 100]
                },
                bodyEmpty: {
                    type: 'cmyk',
                    values: [0, 0, 0, 20]
                },
                weekends: {
                    type: 'cmyk',
                    values: [0, 100, 100, 0]
                },
                weekNumbers: {
                    type: 'cmyk',
                    values: [0, 0, 0, 40]
                },
            },
            weekends: [6, 7],
            holidays: [
                // '[day].[month]'
                '01.01',
                '07.01',
                '23.02',
                '08.03',
                '01.05',
                '09.05',
                '12.06',
                '04.11'
            ],
            template: '3x4',
            /*
                3x4
                4x3
                6x2-top
                6x2-bottom
                6|6
                left-bottom
                top-right
                full-top
                full-bottom
                circle
                circle-compact
            */
            preset: 'days-title-top, week-numbers-left',
            /* 
                presets:
                days-title-top
                days-title-bottom
                week-numbers-left
                week-numbers-right
            */
            language: 'ru',
            daysFormat: 'shortForm',
            systemNames: {
                prefix: 'calendarikko__',
                layer: 'calendar',
                frame: 'frame',
                month: 'month',
                body: 'body',
                weekNames: 'weekNames',
                weekNumbers: 'weekNumbers',
                weekFrames: 'weekFrame',
            },
            names: {
                ru: {
                    oneLetter: [
                        'П',
                        'В',
                        'С',
                        'Ч',
                        'П',
                        'С',
                        'В'
                    ],
                    shortForm: [
                        'Пн',
                        'Вт',
                        'Ср',
                        'Чт',
                        'Пт',
                        'Сб',
                        'Вс'
                    ],
                    fullWord: [
                        'Понедельник',
                        'Вторник',
                        'Среда',
                        'Четверг',
                        'Пятница',
                        'Суббота',
                        'Воскресенье'
                    ],
                    weeks: {
                        oneLetter: 'Н',
                        shortForm: 'Нед',
                        fullWord:  'Недели',
                    },
                    months: [
                        'Январь',
                        'Февраль',
                        'Март',
                        'Апрель',
                        'Май',
                        'Июнь',
                        'Июль',
                        'Август',
                        'Сентябрь',
                        'Октябрь',
                        'Ноябрь',
                        'Декабрь'
                    ]
                },
                en: {
                    oneLetter: [
                        'M',
                        'T',
                        'W',
                        'T',
                        'F',
                        'S',
                        'S'
                    ],
                    shortForm: [
                        'Mon',
                        'Tue',
                        'Wed',
                        'Thu',
                        'Fri',
                        'Sat',
                        'Sun'
                    ],
                    fullWord: [
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                        'Friday',
                        'Saturday',
                        'Sunday'
                    ],
                    weeks: {
                        oneLetter: 'W',
                        shortForm: 'Wee',
                        fullWord:  'Weeks',
                    },
                    months: [
                        'January',
                        'February',
                        'March',
                        'April',
                        'May',
                        'June',
                        'July',
                        'August',
                        'September',
                        'October',
                        'November',
                        'December'
                    ]
                },
                de: {
                    oneLetter: [
                        'S',
                        'M',
                        'D',
                        'M',
                        'D',
                        'F',
                        'S'
                    ],
                    shortForm: [
                        'So',
                        'Mo',
                        'Di',
                        'Mi',
                        'Do',
                        'Fr',
                        'Sa'
                    ],
                    fullWord: [
                        'Sonntag',
                        'Montag',
                        'Dienstag',
                        'Mittwoch',
                        'Donnerstag',
                        'Freitag',
                        'Samstag'
                    ],
                    weeks: {
                        oneLetter: 'W',
                        shortForm: 'Woc',
                        fullWord:  'Woche',
                    },
                    months: [
                        'Januar',
                        'Februar',
                        'Mдrz',
                        'April',
                        'Mai',
                        'Juni',
                        'Juli',
                        'August',
                        'September',
                        'Oktober',
                        'November',
                        'Dezember'
                    ]
                },
                fr: {
                    oneLetter: [
                        'D',
                        'T',
                        'W',
                        'T',
                        'F',
                        'S',
                        'S'
                    ],
                    shortForm: [
                        'Dim',
                        'Lun',
                        'Mar',
                        'Mer',
                        'Jeu',
                        'Ven',
                        'Sam'
                    ],
                    fullWord: [
                        'Dimanche',
                        'Lundi',
                        'Mardi',
                        'Mercredi',
                        'Jeudi',
                        'Vendredi',
                        'Samedi'
                    ],
                    weeks: {
                        oneLetter: 'S',
                        shortForm: 'Sem',
                        fullWord:  'Semaine',
                    },
                    months: [
                        'Janvier',
                        'Fйvrier',
                        'Mars',
                        'Avril',
                        'Mai',
                        'Juin',
                        'Juillet',
                        'Aoыt',
                        'Septembre',
                        'Octobre',
                        'Novembre',
                        'Dйcembre'
                    ]
                },
                es: {
                    oneLetter: [
                        'D',
                        'L',
                        'M',
                        'M',
                        'J',
                        'V',
                        'S'
                    ],
                    shortForm: [
                        'Dom',
                        'Lun',
                        'Mar',
                        'Mer',
                        'Jeu',
                        'Ven',
                        'Sam'
                    ],
                    fullWord: [
                        'Domingo',
                        'Lunes',
                        'Mardi',
                        'Mercredi',
                        'Jeudi',
                        'Vendredi',
                        'Samedi'
                    ],
                    weeks: {
                        oneLetter: 'S',
                        shortForm: 'Sem',
                        fullWord:  'Semana',
                    },
                    months: [
                        'Enero',
                        'Febrero',
                        'Marzo',
                        'Abril',
                        'Mayo',
                        'Junio',
                        'Julio',
                        'Agosto',
                        'Septiembre',
                        'Octubre',
                        'Noviembre',
                        'Diciembre'
                    ]
                },
                it: {
                    oneLetter: [
                        'D',
                        'L',
                        'M',
                        'M',
                        'G',
                        'V',
                        'S'
                    ],
                    shortForm: [
                        'Dom',
                        'Lun',
                        'Mar',
                        'Mer',
                        'Gio',
                        'Ven',
                        'Sab'
                    ],
                    fullWord: [
                        'Domenica',
                        'Lunedм',
                        'Martedм',
                        'Mercoledм',
                        'Giovedм',
                        'Venerdм',
                        'Sabato'
                    ],
                    weeks: {
                        oneLetter: 'S',
                        shortForm: 'Set',
                        fullWord:  'Settimana',
                    },
                    months: [
                        'Gennaio',
                        'Febbraio',
                        'Marzo',
                        'Aprile',
                        'Maggio',
                        'Giugno',
                        'Luglio',
                        'Agosto',
                        'Settembre',
                        'Ottobre',
                        'Novembre',
                        'Dicembre'
                    ]
                },
                dt: {
                    oneLetter: [
                        'D',
                        'M',
                        'D',
                        'W',
                        'D',
                        'V',
                        'Z'
                    ],
                    shortForm: [
                        'Zo',
                        'Ma',
                        'Di',
                        'Wo',
                        'Do',
                        'Vr',
                        'Za'
                    ],
                    fullWord: [
                        'Zondag',
                        'Maandag',
                        'Dinsdag',
                        'Woensdag',
                        'Donderdag',
                        'Vrijdag',
                        'Zaterdag'
                    ],
                    weeks: {
                        oneLetter: 'W',
                        shortForm: 'Wee',
                        fullWord:  'Weeks',
                    },
                    months: [
                        'Januari',
                        'Februari',
                        'Maart',
                        'April',
                        'Mei',
                        'Juni',
                        'Juli',
                        'Augustus',
                        'September',
                        'Oktober',
                        'November',
                        'December'
                    ]
                },
                uk: {
                    oneLetter: [
                        'н',
                        'п',
                        'в',
                        'с',
                        'ч',
                        'п',
                        'с'
                    ],
                    shortForm: [
                        'нд',
                        'пн',
                        'вт',
                        'ср',
                        'чт',
                        'пт',
                        'сб'
                    ],
                    fullWord: [
                        'Неділля',
                        'Понеділок',
                        'Вівторок',
                        'Середа',
                        'Четвер',
                        'П\'ятниця',
                        'Субота'
                    ],
                    weeks: {
                        oneLetter: 'Т',
                        shortForm: 'Тиж',
                        fullWord:  'Тижні',
                    },
                    months: [
                        'Січень',
                        'Лютий',
                        'Березень',
                        'Квітень',
                        'Травень',
                        'Червень',
                        'Липень',
                        'Серпень',
                        'Вересень',
                        'Жовтень',
                        'Листопад',
                        'Грудень'
                    ]
                },
            }
        }.extend(userOptions || {}, true);

    // convert units
        options.frameWidth = $.getUnits(options.frameWidth, false) ? $.convertUnits(options.frameWidth, 'px') : options.frameWidth;
        options.frameHeight = $.getUnits(options.frameHeight, false) ? $.convertUnits(options.frameHeight, 'px') : options.frameHeight;
        options.gutter_x = $.convertUnits(options.gutter_x, 'px');
        options.gutter_y = $.convertUnits(options.gutter_y, 'px');
        options.columns_gutter = $.convertUnits(options.columns_gutter, 'px');
        options.rows_gutter = $.convertUnits(options.rows_gutter, 'px');

    // global
    var frameColumns = 7,
        frameRows = 5,
        totalCeils = frameColumns * frameRows;
        daysFormatCorrectHeight = false;

    // styles
    var fontSize = false,
        lastYear = options.endYear,
        lastMonth = options.endMonth,
        framesCollection = [],
        stylesName = {
            months:       'calendarikko_months',
            dayName:      'calendarikko_days-of-week',
            weekends:     'calendarikko_weekends',
            body:         'calendarikko_body',
            bodyEmpty:    'calendarikko_body_prev-next-days',
            weekNumbers:  'calendarikko_week_numbers',
            doubleDays:   'calendarikko_double-days',
        };

    // set standart
    var isUS = (options.standart === 'us'), __DTFLast;
    if (isUS) {
        __DTFLast = [options.names[options.language][options.daysFormat].pop()];
        options.names[options.language][options.daysFormat] = __DTFLast.concat(options.names[options.language][options.daysFormat]);
    }

    var bodyStyle = bodyEmptyStyle = phStyleMonth = phStyleDayName = phStyleWeekNumbers = charStyleWeekends = doubleDays = false;

    function createStyles (__replace) {
        try { bodyStyle = activeDocument.paragraphStyles.getByName(stylesName.body); }catch(e){}
        try { bodyEmptyStyle = activeDocument.characterStyles.getByName(stylesName.bodyEmpty); }catch(e){}
        try { phStyleMonth = activeDocument.paragraphStyles.getByName(stylesName.months); }catch(e){}
        try { phStyleDayName = activeDocument.paragraphStyles.getByName(stylesName.dayName); }catch(e){}
        try { phStyleWeekNumbers = activeDocument.paragraphStyles.getByName(stylesName.weekNumbers); }catch(e){}
        try { charStyleWeekends = activeDocument.characterStyles.getByName(stylesName.weekends); }catch(e){}
        try { doubleDays = activeDocument.characterStyles.getByName(stylesName.doubleDays); }catch(e){}
    
        bodyStyle = bodyStyle || activeDocument.paragraphStyles.add(stylesName.body);
        bodyEmptyStyle = bodyEmptyStyle || activeDocument.characterStyles.add(stylesName.bodyEmpty);
        phStyleMonth = phStyleMonth || activeDocument.paragraphStyles.add(stylesName.months);
        phStyleDayName = phStyleDayName || activeDocument.paragraphStyles.add(stylesName.dayName);
        phStyleWeekNumbers = phStyleWeekNumbers || activeDocument.paragraphStyles.add(stylesName.weekNumbers);
        charStyleWeekends = charStyleWeekends || activeDocument.characterStyles.add(stylesName.weekends);
        doubleDays = doubleDays || activeDocument.characterStyles.add(stylesName.doubleDays);

        // font color
        options.fontColor = {
            body: $.color(options.fontColor.body.type, options.fontColor.body.values),
            bodyEmpty: $.color(options.fontColor.bodyEmpty.type, options.fontColor.bodyEmpty.values),
            weekends: $.color(options.fontColor.weekends.type, options.fontColor.weekends.values),
            weekNumbers: $.color(options.fontColor.weekNumbers.type, options.fontColor.weekNumbers.values),
        };


        // body
        bodyStyle.paragraphAttributes.justification = Justification.CENTER;

        // months
        phStyleMonth.paragraphAttributes.justification = Justification.CENTER;

        // dayName
        phStyleDayName.paragraphAttributes.justification = Justification.CENTER;

        // body
        bodyStyle.characterAttributes.fillColor = options.fontColor.body;
        bodyEmptyStyle.characterAttributes.fillColor = options.fontColor.bodyEmpty;

        // week numbers
        phStyleWeekNumbers.paragraphAttributes.justification = Justification.CENTER;
        phStyleWeekNumbers.characterAttributes.fillColor = options.fontColor.weekNumbers;

        // weekends
        charStyleWeekends.characterAttributes.fillColor = options.fontColor.weekends;

        // holidays
        holidaysMask = ',' + options.holidays.toString().replace(/ /g, '') + ',';

        // doubleDays
        doubleDays.characterAttributes.horizontalScale = doubleDays.characterAttributes.verticalScale = 100;
    }

    function getDaysBefore() {
        var str = '', isFill = options.otherDays === 'fill',
            __date = new Date($date.getFullYear(), $date.getMonth()),
            n = __date.getDay() - 1;

        if (n < 0) {
            n = new Date($date.getFullYear(), $date.getMonth(), n + 1).getDay();
        }

        while (n--) {
            __date.setDate(__date.getDate() - 1);
            str = (isFill ? __date.getDate() : ' ') + '\n' + str;
        };

        return (isUS ? ((isFill ? (__date.getDate() - 1 === 0 ? new Date(__date.getFullYear(), __date.getMonth(), __date.getDate() - 1).getDate() : __date.getDate() - 1) : ' ') + '\n') : '') + str;
    }

    function getDaysAfter(x) {
        var str = '', isFill = options.otherDays === 'fill',
            __date = new Date($date.getFullYear(), $date.getMonth() + 1);

        for (var n = 0; n < x; n++) {
            str += (isFill ? __date.getDate() : ' ') + '\n';
            __date.setDate(__date.getDate() + 1);
        };

        return str;
    }

    function getContent() {
        var localDate = $date,
            currentYear = localDate.getFullYear(),
            currentMonth = localDate.getMonth(),
            str = getDaysBefore(), maxDays = 32,
            allCeils = totalCeils;
        str = str === '\n' ? '' : str;
        var emptyCells = allCeils - (str.split('\n').length - 1);

        for (var j = 0; j < maxDays; j++) {
            localDate.setDate(j + 1);
            if (localDate.getMonth() !== currentMonth) {
                localDate.setMonth(currentMonth);
                localDate.setFullYear(currentYear);
                break;
            }
            str += (j + 1) + (j < maxDays - 1 ? '\n' : '');
            emptyCells--;
        }
        str += getDaysAfter(emptyCells);
        return str.slice(0, -1);
    }

    function setWeekends(frame) {
        var j = options.weekends.length,
            color = charStyleWeekends.characterAttributes.fillColor;

        function process(day) {
            var lines = frame.lines,
                length = lines.length;

            for (var i = 0; i < length; i++) {
                !i ? i += day : i += day + (6 - day);
                if (i < length) charStyleWeekends.applyTo(lines[i]);
            }
        }

        while (j--) process(parseInt(options.weekends[j]) - 1);
    }

    function setHolidays(frame) {
        var localDate = $date,
            lines = frame.lines,
            j = lines.length,
            month = localDate.getMonth() + 1;

        while (j--) {
            if (holidaysMask.indexOf(',' + ('0' + lines[j].contents.replace(/\n/g, '')).slice(-2) + '.' + ('0' + month).slice(-2) + ',') > -1) {
                charStyleWeekends.applyTo(lines[j]);
            }
        }
    }

    function setEmptyDays(frame) {
        if (options.otherDays === 'fill') {
            var words = frame.words,
                l = words.length,
                month = $date.getMonth(),
                breakFirst = breakLast = false,
                lastDay = new Date($date.getFullYear(), $date.getMonth() + 1, 0).getDate();
    
            for (var j = 0; j < l; j++) {
                if (parseInt(words[j].contents) === 1 && !breakFirst && !breakLast) breakFirst = true;
                if (parseInt(words[j].contents) === lastDay && breakFirst) {
                    breakFirst = false;
                    breakLast = true;
                    continue;
                }
                if (!breakFirst) bodyEmptyStyle.applyTo(words[j]);
            }
        }
    }

    function getWeekNumber() {
        var d = new Date(Date.UTC($date.getFullYear(), $date.getMonth(), $date.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));

        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    function getWeeksContent(weekNum) {
        var weekStart = weekNum || getWeekNumber(),
            length = weekStart + frameRows,
            str = '';

        for (var i = weekStart; i < length; i++) {
            str += (('0' + i.toString()).slice(-2)) + '\n';
        }

        return str.slice(0, -1);
    }

    function normalizeRows (__frame) {
        var separator = '',
            strArr = __frame.contents.split('\r'),
            words = __frame.words;
        if (strArr.length > totalCeils) {
            var l = strArr.length;
            for (var i = j = totalCeils, x = 0; j < l; j++, x++) {
                words[frameColumns * (frameRows - 1) + x].contents = (x ? separator : '') + words[frameColumns * (frameRows - 1) + x].contents + '/' + strArr[i + x];
                doubleDays.applyTo(words[frameColumns * (frameRows - 1) + x]);
                words[frameColumns * (frameRows - 1) + x].characterAttributes.size = doubleDays.characterAttributes.size;
                words[frameColumns * (frameRows - 1) + x].characterAttributes.baselineShift = doubleDays.characterAttributes.baselineShift;
                try { words[i].remove(); } catch (e) {}
            }
            if (__frame.textRanges[__frame.textRanges.length - 1].contents === '\r') __frame.textRanges[__frame.textRanges.length - 1].remove();
        }
    }

    function isPreset (__preset) {
        return options.preset.indexOf(__preset) > -1;
    }

    function createMonth ($layer, x, y, anchor_x, anchor_y, $frame) {
        var monthGroup = $frame ? $frame : $layer.groupItems.add(),
            rectDirection = anchor_y < 0 ? -1 : 1,
            heightDayTitle = !options.enableFrames.day ? 0 : options.frameHeight / frameColumns / 2,
            offsetDayTitle = !options.enableFrames.day ? 0 : 0,
            heightMonthTitle = !options.enableFrames.month ? 0 : options.frameHeight / frameColumns - offsetDayTitle,
            heightArea = options.frameHeight - heightMonthTitle - heightDayTitle - offsetDayTitle * 2,
            widthWeeks = !options.enableFrames.week ? 0 : options.frameWidth / 7 / 2,
            area, frame,
            monthTitle, monthTitleFrame, dayTitle, dayTitleFrame, doubleDayTitleFrame,
            weeksTitle, weeksTitleFrame, doubleWeeksTitleFrame,
            weeksNumbersTitle, weeksNumbersTitleFrame, doubleWeeksNumbersTitleFrame,
            props = {
                monthTitle: {
                    x: (anchor_x + options.margin[3]) + ((options.frameWidth + options.gutter_x) * x),
                    y: ((anchor_y - options.margin[0] * rectDirection)) + ((options.frameHeight + options.gutter_y) * y),
                    w: options.frameWidth,
                    h: heightMonthTitle,
                },
                dayTitle: {
                    x: (anchor_x + options.margin[3] + widthWeeks) + ((options.frameWidth + options.gutter_x) * x),
                    y: ((anchor_y - options.margin[0] * rectDirection) - heightMonthTitle - offsetDayTitle) + ((options.frameHeight + options.gutter_y) * y),
                    w: options.frameWidth - widthWeeks,
                    h: heightDayTitle,
                },
                weeksNumbersTitle: {
                    x: (anchor_x + options.margin[3]) + ((options.frameWidth + options.gutter_x) * x),
                    y: ((anchor_y - options.margin[0] * rectDirection) - heightMonthTitle - offsetDayTitle) + ((options.frameHeight + options.gutter_y) * y),
                    w: widthWeeks,
                    h: heightDayTitle,
                },
                weeksTitle: {
                    x: (anchor_x + options.margin[3]) + ((options.frameWidth + options.gutter_x) * x),
                    y: ((anchor_y - options.margin[0] * rectDirection) - heightMonthTitle - heightDayTitle - offsetDayTitle * 2) + ((options.frameHeight + options.gutter_y) * y),
                    w: widthWeeks,
                    h: heightArea,
                },
                body: {
                    x: (anchor_x + options.margin[3] + widthWeeks) + ((options.frameWidth + options.gutter_x) * x),
                    y: ((anchor_y - options.margin[0] * rectDirection) - heightMonthTitle - heightDayTitle - offsetDayTitle * 2) + ((options.frameHeight + options.gutter_y) * y),
                    w: options.frameWidth - widthWeeks,
                    h: heightArea,
                }
            };

        if (isPreset('week-numbers-right') && !isPreset('week-numbers-left')) {
            props.weeksTitle.x += options.frameWidth - widthWeeks;
            props.body.x -= widthWeeks;
            props.dayTitle.x -= widthWeeks;
            props.weeksNumbersTitle.x += options.frameWidth - widthWeeks;
        }
            else if (isPreset('week-numbers-right') && isPreset('week-numbers-left')) {
                props.body.w -= widthWeeks;
                props.dayTitle.w -= widthWeeks;
            }

        if (isPreset('days-title-bottom') && !isPreset('days-title-top')) {
            props.weeksTitle.y += (heightDayTitle + offsetDayTitle * 2);
            props.body.y += (heightDayTitle + offsetDayTitle * 2);
            props.dayTitle.y -= heightArea;
            props.weeksNumbersTitle.y -= heightArea;
        }
            else if (isPreset('days-title-bottom') && isPreset('days-title-top')) {
                props.body.h -= (heightDayTitle + offsetDayTitle * 2);
                props.weeksTitle.h -= (heightDayTitle + offsetDayTitle * 2);
            }

        // set name for month group
            monthGroup.name = options.systemNames.prefix + options.systemNames.frame;

        // month title
        if (options.enableFrames.month) {
            if (!$frame) {
                monthTitle = monthGroup.pathItems.rectangle(props.monthTitle.y, props.monthTitle.x, props.monthTitle.w, props.monthTitle.h),
                monthTitleFrame = monthGroup.textFrames.areaText(monthTitle);
                monthTitleFrame.name = options.systemNames.prefix + options.systemNames.month;
            }
                else {
                    monthTitleFrame = $frame.pageItems.getByName(options.systemNames.prefix + options.systemNames.month);
                }

            // set content & font size
            monthTitleFrame.contents = options.names[options.language].months[$date.getMonth()];
            if (options.enableFrames.yearInMonth) {
                monthTitleFrame.contents += ' / ' + $date.getFullYear();
            }
                else monthTitleFrame.contents = monthTitleFrame.contents.replace(/{year}/g, $date.getFullYear());
        }


        // days title
        if (options.enableFrames.day) {
            if (!$frame) {
                dayTitle = monthGroup.pathItems.rectangle(props.dayTitle.y, props.dayTitle.x, props.dayTitle.w, props.dayTitle.h),
                dayTitleFrame = monthGroup.textFrames.areaText(dayTitle);
                dayTitleFrame.name = options.systemNames.prefix + options.systemNames.weekNames;
            }
                else {
                    dayTitleFrame = $frame.pageItems.getByName(options.systemNames.prefix + options.systemNames.weekNames);
                }

            // set grid
            dayTitleFrame.columnCount = frameColumns;
            dayTitleFrame.columnGutter = options.columns_gutter;

            // set content & font size
            dayTitleFrame.contents = options.names[options.language][options.daysFormat].toString().replace(/,/g, '\n');

            if (options.enableFrames.week) {
                if (!$frame) {
                    weeksNumbersTitle = monthGroup.pathItems.rectangle(props.weeksNumbersTitle.y, props.weeksNumbersTitle.x, props.weeksNumbersTitle.w, props.weeksNumbersTitle.h),
                    weeksNumbersTitleFrame = monthGroup.textFrames.areaText(weeksNumbersTitle);
                    weeksNumbersTitleFrame.name = options.systemNames.prefix + options.systemNames.weekFrames;
                }
                    else {
                        weeksNumbersTitleFrame = $frame.pageItems.getByName(options.systemNames.prefix + options.systemNames.weekFrames);
                    }

                weeksNumbersTitleFrame.contents = options.names[options.language].weeks[options.daysFormat].toString().replace(/,/g, '\n');
            }
        }


        // all days
        if (!$frame) {
            area = monthGroup.pathItems.rectangle(props.body.y, props.body.x, props.body.w, props.body.h);
            frame = monthGroup.textFrames.areaText(area, TextOrientation.HORIZONTAL);
            frame.name = options.systemNames.prefix + options.systemNames.body;
        }
            else {
                frame = $frame.pageItems.getByName(options.systemNames.prefix + options.systemNames.body);
            }

        // frame push to collection
        framesCollection.push(frame);

        // body
        if ($frame) {
            activeDocument.characterStyles[0].applyTo(frame.textRange);
            activeDocument.paragraphStyles[0].applyTo(frame.textRange);
        }
        bodyStyle.applyTo(frame.textRange);

        // set days
        frame.contents = getContent();

        // set grid
        frame.columnCount = frameColumns;
        frame.rowCount = frameRows;
        frame.columnGutter = options.columns_gutter;
        frame.rowGutter = options.rows_gutter;


        // weeks numbers
        if (options.enableFrames.week) {

            var weekNumbers = getWeekNumber();
            if (!$frame) {
                weeksTitle = monthGroup.pathItems.rectangle(props.weeksTitle.y, props.weeksTitle.x, props.weeksTitle.w, props.weeksTitle.h),
                weeksTitleFrame = monthGroup.textFrames.areaText(weeksTitle);
                weeksTitleFrame.name = options.systemNames.prefix + options.systemNames.weekNumbers;
            }
                else {
                    weeksTitleFrame = $frame.pageItems.getByName(options.systemNames.prefix + options.systemNames.weekNumbers);
                }

            // set grid
            weeksTitleFrame.rowCount = frameRows;
            weeksTitleFrame.rowGutter = options.rows_gutter;

            // set content & font size
            weeksTitleFrame.contents = getWeeksContent(weekNumbers);

            // check empty weeks
            weeksTitleFrame.contents = isNaN(parseInt(frame.contents.slice(-8))) ? weeksTitleFrame.contents.slice(0, -2) : weeksTitleFrame.contents;
        }


        // set styles
        var autoFontSize = ((options.frameHeight < (options.frameWidth - widthWeeks)) ? options.frameHeight / (frameColumns + options.columns_gutter / 2) : (options.frameWidth - widthWeeks) / (frameRows + options.rows_gutter / 2));

        // set font size
        if (fontSize === false) {
            fontSize = (options.fontSize === 'auto' ? autoFontSize : (options.fontSize < 2.5 ? autoFontSize * options.fontSize : options.fontSize));

            // paragraphStyles
            bodyStyle.paragraphAttributes.spaceBefore = heightArea / frameRows;
            phStyleDayName.paragraphAttributes.spaceBefore = heightDayTitle;
            bodyStyle.characterAttributes.size = fontSize;
            doubleDays.characterAttributes.size = fontSize * 0.6;
            bodyStyle.characterAttributes.baselineShift = fontSize * -0.35;
            doubleDays.characterAttributes.baselineShift = fontSize * -(0.5);
        }

        // months
        if (options.enableFrames.month) {
            phStyleMonth.characterAttributes.size = heightMonthTitle;
            phStyleMonth.applyTo(monthTitleFrame.textRange);
        }

        // days
        if (options.enableFrames.day) {
            var monthsNames = options.names[options.language][options.daysFormat];
            phStyleDayName.characterAttributes.size = options.daysFormat !== 'fullWord' ? heightDayTitle : (options.frameWidth - widthWeeks) / frameColumns / (monthsNames.toString().replace(/,/g, '').length / monthsNames.length);
            phStyleDayName.applyTo(dayTitleFrame.textRange);

            if (daysFormatCorrectHeight === false) {
                var dayTitleFrameOutline = dayTitleFrame.duplicate();
                dayTitleFrameOutline.textRange.contents = 'Oy';
                dayTitleFrameOutline = dayTitleFrameOutline.createOutline();
                daysFormatCorrectHeight = dayTitleFrameOutline.height;
                dayTitleFrameOutline.remove();
                phStyleDayName.characterAttributes.baselineShift = (heightDayTitle - daysFormatCorrectHeight) / -2;
            }

            if (options.enableFrames.week) {
                phStyleDayName.applyTo(weeksNumbersTitleFrame.textRange);
                weeksNumbersTitleFrame.textRange.characterAttributes.size = phStyleDayName.characterAttributes.size * 0.7;
                weeksNumbersTitleFrame.textRange.characterAttributes.baselineShift = phStyleDayName.characterAttributes.baselineShift * 1.15;
            }

            if (isPreset('days-title-bottom') && isPreset('days-title-top')) {
                if ($frame){
                    var prevItem = dayTitleFrame.getNearby('next');
                    if (prevItem && prevItem.name === options.systemNames.prefix + options.systemNames.weekNames) prevItem.remove();
                }
                doubleDayTitleFrame = dayTitleFrame.duplicate();
                doubleDayTitleFrame.top -= heightArea * ($frame ? -1 : 1);

                if (options.enableFrames.week) {
                    if ($frame){
                        var prevItem = weeksNumbersTitleFrame.getNearby('next');
                        if (prevItem && prevItem.name === options.systemNames.prefix + options.systemNames.weekFrames) prevItem.remove();
                    }
                    doubleWeeksNumbersTitleFrame = weeksNumbersTitleFrame.duplicate();
                    doubleWeeksNumbersTitleFrame.top -= heightArea * ($frame ? -1 : 1);
                }
            }
        }

        // weeksTitleFrame
        if (options.enableFrames.week) {
            phStyleWeekNumbers.characterAttributes.size = ((widthWeeks < heightArea / frameRows) ? widthWeeks * 0.6 : fontSize);
            phStyleWeekNumbers.paragraphAttributes.spaceBefore = heightArea / frameRows;
            phStyleWeekNumbers.characterAttributes.baselineShift = ((widthWeeks < heightArea / frameRows) ? fontSize * -0.55 : fontSize * -0.35);
            bodyStyle.applyTo(weeksTitleFrame.textRange);
            phStyleWeekNumbers.applyTo(weeksTitleFrame.textRange);

            if (isPreset('week-numbers-right') && isPreset('week-numbers-left')) {
                if ($frame){
                    var prevItem = weeksTitleFrame.getNearby('next');
                    if (prevItem && prevItem.name === options.systemNames.prefix + options.systemNames.weekNumbers) prevItem.remove();
                }
                doubleWeeksTitleFrame = weeksTitleFrame.duplicate();
                doubleWeeksTitleFrame.left += (props.body.w + widthWeeks) * ($frame ? -1 : 1);

                if ($frame){
                    var prevItem = weeksNumbersTitleFrame.getNearby('next');
                    if (prevItem && prevItem.name === options.systemNames.prefix + options.systemNames.weekFrames) prevItem.remove();
                }
                weeksNumbersTitleFrame = weeksNumbersTitleFrame.duplicate();
                weeksNumbersTitleFrame.left += (props.body.w + widthWeeks) * ($frame ? -1 : 1);

                if (doubleWeeksNumbersTitleFrame) {
                    if ($frame){
                        var prevItem = doubleWeeksNumbersTitleFrame.getNearby('next').getNearby('next').getNearby('next');
                        if (prevItem && prevItem.name === options.systemNames.prefix + options.systemNames.weekFrames) prevItem.remove();
                    }
                    doubleWeeksNumbersTitleFrame = doubleWeeksNumbersTitleFrame.duplicate();
                    doubleWeeksNumbersTitleFrame.left += (props.body.w + widthWeeks) * ($frame ? -1 : 1);
                }
            }
        }

        // set weekends
        setWeekends(frame);

        // set holidays
        setHolidays(frame);

        // set empty days
        setEmptyDays(frame);

        // normalize rows, example: 26/31
        normalizeRows(frame);
    }

    function reverseOrder (items, callback) {
        var i = items.length;
        while (i--) items[i].zOrder(ZOrderMethod.SENDTOBACK);
        return items;
    }

    function setCalendar() {
        var $layer = activeDocument.layers.add(),
            allMonths = options.endMonth,
            allYears = options.endYear - options.startYear;

        $layer.name = options.systemNames.prefix + options.systemNames.layer;
        $date.setFullYear(options.startYear);

        if (allYears > 0) {
            allMonths = options.startMonth + (12 * allYears - options.startMonth) + options.endMonth;
        }

        createStyles();

        switch (options.template.toLowerCase()) {
            case '3x4': {
                var valX = 3, valY = 4;
                if (options.frameWidth === false) options.frameWidth = (artWidth - options.margin[1] - options.margin[3] - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                if (options.frameHeight === false) options.frameHeight = (artHeight - options.margin[0] - options.margin[2] - (options.gutter_y * valY)) / valY + (options.gutter_y / valY);

                for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++) {
                    $date.setFullYear(options.startYear);
                    $date.setDate(1);
                    $date.setMonth(m);
                    if (x === valX) { x = 0; y--; }
                    createMonth($layer, x, y, rect[0], rect[1]);
                    x++; m++;
                }
                break;
            };
            case '4x3': {
                var valX = 4, valY = 3;
                if (options.frameWidth === false) options.frameWidth = (artWidth - options.margin[1] - options.margin[3] - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                if (options.frameHeight === false) options.frameHeight = (artHeight - options.margin[0] - options.margin[2] - (options.gutter_y * valY)) / valY + (options.gutter_y / valY);

                for (var i = options.startMonth - 1, m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++, x++, m++) {
                    $date.setFullYear(options.startYear);
                    $date.setDate(1);
                    $date.setMonth(m);
                    if (x === valX) { x = 0; y--; }
                    createMonth($layer, x, y, rect[0], rect[1]);
                }
                break;
            };
            case '6x2-top': {
                var valX = 6, valY = 6;
                if (options.frameWidth === false) options.frameWidth = (artWidth - options.margin[1] - options.margin[3] - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                if (options.frameHeight === false) options.frameHeight = (artHeight - options.margin[0] - options.margin[2] - (options.gutter_y * valY)) / valY + (options.gutter_y / valY);

                for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++) {
                    $date.setFullYear(options.startYear);
                    $date.setDate(1);
                    $date.setMonth(m);
                    if (x === valX) { x = 0; y--; }
                    createMonth($layer, x, y, rect[0], rect[1]);
                    x++; m++;
                }
                break;
            };
            case '6x2-bottom': {
                var valX = 6, valY = 6;
                if (options.frameWidth === false) options.frameWidth = (artWidth - options.margin[1] - options.margin[3] - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                if (options.frameHeight === false) options.frameHeight = (artHeight - options.margin[0] - options.margin[2] - (options.gutter_y * valY)) / valY + (options.gutter_y / valY);

                for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++) {
                    $date.setFullYear(options.startYear);
                    $date.setDate(1);
                    $date.setMonth(m);
                    if (x === valX) { x = 0; y--; }
                    createMonth($layer, x, y, rect[0], rect[3] + ((options.frameHeight + options.gutter_y / 2) * 2));
                    x++; m++;
                }
                break;
            };
            case '6|6': {
                var valX = 6, valY = 6, anchorX = rect[0];
                if (options.frameWidth === false) options.frameWidth = (artWidth - options.margin[1] - options.margin[3] - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                if (options.frameHeight === false) options.frameHeight = (artHeight - options.margin[0] - options.margin[2] - (options.gutter_y * valY)) / valY + (options.gutter_y / valY);

                for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++ , x-- , y-- , m++) {
                    $date.setFullYear(options.startYear);
                    $date.setDate(1);
                    $date.setMonth(m);
                    if (x === -valX) {
                        anchorX = rect[2] - (options.frameWidth + options.gutter_x + options.margin[1]);
                        y = 0;
                    }
                    createMonth($layer, 0, y, anchorX, rect[1]);
                }
                break;
            };
            case 'left-bottom': {
                var valX = 7, valY = 6;
                if (options.frameWidth === false) options.frameWidth = ((artWidth - options.margin[1] - options.margin[3]) - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                if (options.frameHeight === false) options.frameHeight = ((artHeight - options.margin[0] - options.margin[2]) - (options.gutter_y * valY)) / valY + (options.gutter_y / valY);

                for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++) {
                    $date.setFullYear(options.startYear);
                    $date.setDate(1);
                    $date.setMonth(m);
                    createMonth($layer, x, y, rect[0], rect[1]);
                    y === -(valY - 1) ? x++ : y--;
                    m++;
                }
                break;
            };
            case 'top-right': {
                var valX = 7, valY = 6;
                if (options.frameWidth === false) options.frameWidth = ((artWidth - options.margin[1] - options.margin[3]) - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                if (options.frameHeight === false) options.frameHeight = ((artHeight - options.margin[0] - options.margin[2]) - (options.gutter_y * valY)) / valY + (options.gutter_y / valY);

                for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++) {
                    $date.setFullYear(options.startYear);
                    $date.setDate(1);
                    $date.setMonth(m);
                    createMonth($layer, x, y, rect[0], rect[1]);
                    x === valX - 1 ? y-- : x++;
                    m++;
                }
                break;
            };
            case 'full-top': {
                var valX = 12, valY = 1;
                if (options.frameWidth === false) options.frameWidth = ((artWidth - options.margin[1] - options.margin[3]) - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                if (options.frameHeight === false) options.frameHeight = options.frameWidth / 1.2;

                for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++) {
                    $date.setFullYear(options.startYear);
                    $date.setDate(1);
                    $date.setMonth(m);
                    createMonth($layer, x, y, rect[0], rect[1]);
                    x++; m++;
                }
                break;
            };
            case 'full-bottom': {
                var valX = 12, valY = 1;
                if (options.frameWidth === false) options.frameWidth = ((artWidth - options.margin[1] - options.margin[3]) - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                if (options.frameHeight === false) options.frameHeight = options.frameWidth / 1.2;

                for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++) {
                    $date.setFullYear(options.startYear);
                    $date.setDate(1);
                    $date.setMonth(m);
                    createMonth($layer, x, y, rect[0], rect[3] + options.frameHeight);
                    x++; m++;
                }
                break;
            };
            case 'circle': {
                var valX = 6, valY = 6, anchorX = (rect[2] - rect[0]) / 2, reverseY = false, reverseX = false;
                if (options.frameWidth === false) options.frameWidth = ((artWidth - options.margin[1] - options.margin[3]) - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                if (options.frameHeight === false) options.frameHeight = (artHeight - options.margin[0] - options.margin[2] - (options.gutter_y * valY)) / valY + (options.gutter_y / valY);

                for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++ , m++) {
                    $date.setFullYear(options.startYear);
                    $date.setDate(1);
                    $date.setMonth(m);
                    if (y === -valY) {
                        y++;
                        reverseY = true;
                    }
                    if (x === 3) {
                        x--;
                        reverseX = true;
                    }
                    else if (x === -4) {
                        x++;
                        reverseX = false;
                    }
                    createMonth($layer, x, y, anchorX, rect[1]);
                    !reverseY ? y-- : y++;
                    !reverseX ? x++ : x--;
                }
                break;
            };
            case 'circle-compact': {
                var valX = 6, valY = 6, anchorX = (rect[2] - rect[0]) / 2, reverseY = false, reverseX = false, $val = 0.5;
                if (options.frameWidth === false) options.frameWidth = ((artWidth - options.margin[1] - options.margin[3]) - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                if (options.frameHeight === false) options.frameHeight = (artHeight - options.margin[0] - options.margin[2] - (options.gutter_y * valY)) / valY + (options.gutter_y / valY);

                for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++ , m++) {
                    $date.setFullYear(options.startYear);
                    $date.setDate(1);
                    $date.setMonth(m);
                    if (y === -valY) {
                        y++;
                        reverseY = true;
                    }
                    if (m === 12 * $val) {
                        anchorX -= options.frameWidth / 2;
                    }
                    if (x === 3 * $val) {
                        x -= $val;
                        reverseX = true;
                    }
                    else if (x === -4 * $val) {
                        x += $val;
                        reverseX = false;
                    }
                    createMonth($layer, x, y, anchorX, rect[1]);
                    !reverseY ? y-- : y++;
                    x = !reverseX ? x + $val : x - $val;
                }
                break;
            };
        }

        if (options.linkFrames) {
            var selectionBak = selection,
                items = $layer.pageItems,
                l = items.length;

            selection = null;
            for (var i = 0; i < l; i++) {
                try { items[i].pageItems.getByName(options.systemNames.prefix + options.systemNames.body).selected = true; } catch(e){}
            }

            if (app.executeMenuCommand instanceof Function) app.executeMenuCommand('threadTextCreate');
            selection = selectionBak;
        }

        reverseOrder($layer.pageItems);
    }


    // check and change of the variable values
    var activeArt = activeDocument.artboards[activeDocument.artboards.getActiveArtboardIndex()],
        rect = activeArt.artboardRect,
        artWidth = rect[2] - rect[0],
        artHeight = rect[1] - rect[3];

    options.margin = parseMargin(options.margin);

    options.frameWidth = typeof options.frameWidth === 'number'
        ? options.frameWidth
        : (typeof options.frameWidth === 'string'
            ? (options.frameWidth.slice(0, 2).toLowerCase() === 'fi'
                ? false
                : (options.frameWidth.slice(0, 3).toLowerCase() === 'art'
                    ? artWidth - options.margin[1] - options.margin[3]
                    : 500)
            )
            : 500);

    options.frameHeight = typeof options.frameHeight === 'number'
        ? options.frameHeight
        : (typeof options.frameHeight === 'string'
            ? (options.frameHeight.slice(0, 2).toLowerCase() === 'fi'
                ? false
                : (options.frameHeight.slice(0, 3).toLowerCase() === 'art'
                    ? artHeight - options.margin[0] - options.margin[2]
                    : 500)
            )
            : 400);

    // run
    this.create = function () {
        setCalendar();
        return this;
    }
    this.replace = function (layer, newYear) {
        if (layer.name === options.systemNames.prefix + options.systemNames.layer) {
            var frames = layer.pageItems,
                l = frames.length;
                allMonths = options.endMonth,
                allYears = options.endYear - options.startYear;
    
            if (allYears > 0) {
                allMonths = options.startMonth + (12 * allYears - options.startMonth) + options.endMonth;
            }
    
            createStyles(true);

            if (l) {
                options.frameWidth = frames[0].width;
                options.frameHeight = frames[0].height;
            }
    
            for (var i = 0, m = options.startMonth - 1; i < l; i++) {
                $date.setFullYear(options.startYear);
                $date.setMonth(m);
                $date.setDate(1);
                createMonth(layer, 1, 1, 0, 0, frames[i]);
                m++;
            }
        }
            else {
                if (confirm('Sorry, calendar not found! Create new?')) {
                    setCalendar();
                }
            }

        return this;
    }
    this.clear = function () {
        try { activeDocument.layers.getByName(options.systemNames.prefix + options.systemNames.layer).remove(); } catch (e) {}
        return this;
    }
};

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
            _value = ( ((_dir === 'u') || (_dir === 'r')) ? _value + step : (((_dir === 'd') || (_dir === 'l')) ? _value - step : false) );
            if (_value !== false) {
                _value = (_value <= min ? min : (_value >= max ? max : _value))
                _input.text = _value;
                if (callback instanceof Function) callback(_value, _input, min, max, units);
                    else if (units) _input.text = parseFloat(_input.text) + ' ' + units;
            }
                else if (units) _input.text = parseFloat(_input.text) + ' ' + units;
        }
}

function normalizeInputYear (val, item, min, max) {
    if (item === __startYear) {
        if (val > parseFloat(__endYear.text)) { __endYear.text = ((val + 1) >= max ? max + 1 : val); }
    }
        else if (item === __endYear) {
            if (val < parseFloat(__startYear.text)) { __startYear.text = ((val - 1) < min ? min - 1 : val); }
        }
}

function normalizeInputMonth (val, item, min, max) {
    if (parseFloat(__startYear.text) === parseFloat(__endYear.text)) {
        if (item === __startMonth) {
            if (val > parseFloat(__endMonth.text)) { __endMonth.text = ((val + 1) >= max ? max : val); }
        }
            else if (item === __endMonth) {
                if (val < parseFloat(__startMonth.text)) { __startMonth.text = ((val - 1) < min ? min : val); }
            }
    }
}

var win = new Window('dialog', scriptName + copyright),
    globalGroup = win.add('group');
    globalGroup.orientation = 'column';
    globalGroup.alignChildren = 'fill';

    with (globalGroup.add('group')) {
        orientation = 'row';
        alignChildren = ['fill', 'fill'];

        with (add('panel')) {
            orientation = 'row';
            alignChildren = ['fill', 'fill'];

            with (add('group')) {
                orientation = 'column';
                alignChildren = 'fill';
                add('statictext', undefined, 'Start Year');
                var __startYear = add('edittext', undefined, new Date().getFullYear());
                __startYear.addEventListener('keydown', function(e) { inputNumberEvents(e, __startYear, 1970, Infinity, normalizeInputYear); });
                __startYear.addEventListener('change', function (e) { normalizeInputYear(parseInt(__startYear.text), __startYear, 1970, Infinity); });
                add('statictext', undefined, 'Start Month');
                var __startMonth = add('edittext', undefined, 1);
                __startMonth.addEventListener('keydown', function(e) { inputNumberEvents(e, __startMonth, 1, 12, normalizeInputMonth); });
                __startMonth.addEventListener('change', function(e) { if (parseInt(this.text) > 12) this.text = '12'; else if (parseInt(this.text) <= 1) this.text = '1'; });
            }

            with (add('group')) {
                orientation = 'column';
                alignChildren = 'fill';
                add('statictext', undefined, 'End Year');
                var __endYear = add('edittext', undefined, new Date().getFullYear());
                __endYear.addEventListener('keydown', function(e) { inputNumberEvents(e, __endYear, 1970, Infinity, normalizeInputYear); });
                __endYear.addEventListener('change', function (e) { normalizeInputYear(parseInt(__endYear.text), __endYear, 1970, Infinity); });
                add('statictext', undefined, 'End Month');
                var __endMonth = add('edittext', undefined, 12);
                __endMonth.addEventListener('keydown', function(e) { inputNumberEvents(e, __endMonth, 1, 12, normalizeInputMonth); });
                __endMonth.addEventListener('change', function(e) { if (parseInt(this.text) > 12) this.text = '12'; else if (parseInt(this.text) <= 1) this.text = '1'; });
            }
        }

        with (add('panel')) {
            alignChildren = 'fill';

            with (add('group')) {
                orientation = 'row';
                alignChildren = ['fill', 'fill'];

                with (add('group')) {
                    orientation = 'column';
                    alignChildren = 'fill';
                    add('statictext', undefined, 'Language:');
                    var __lang = add('dropdownlist', undefined, 'Russian,Ukrainian,English,Deutsch,French,Spanish,Italian,Danish'.split(','));
                    __lang.selection = 0;
                }
                with (add('group')) {
                    orientation = 'column';
                    alignChildren = 'fill';
                    add('statictext', undefined, 'Template:');
                    var __template = add('dropdownlist', undefined, '3x4,4x3,6x2-top,6x2-bottom,6|6,left-bottom,top-right,full-top,full-bottom,circle,circle-compact'.split(','));
                    __template.selection = 0;
                }
            }
            with (add('group')) {
                orientation = 'row';
                alignChildren = ['fill', 'fill'];

                with (add('group')) {
                    orientation = 'column';
                    alignChildren = 'fill';
                    add('statictext', undefined, 'Days week:');
                    var __daysFormat = add('dropdownlist', undefined, 'One Letter,Short Form,Full Word'.split(','));
                    __daysFormat.selection = 1;
                }
                with (add('group')) {
                    orientation = 'column';
                    alignChildren = 'fill';
                    add('statictext', undefined, 'Weekends:');
                    var __weekends = add('edittext', undefined, '6, 7');
                }
                with (add('group')) {
                    orientation = 'column';
                    alignChildren = 'fill';
                    add('statictext', undefined, 'Standart:');
                    var __standart = add('dropdownlist', undefined, ['European', 'American']);
                    __standart.selection = 0;
                }
            }
        }
    }

    with (globalGroup.add('group')) {
        orientation = 'row';
        alignChildren = ['fill', 'fill'];

        with (add('panel')) {
            orientation = 'column';
            alignChildren = ['fill', 'fill'];

            with(add('group')) {
                orientation = 'row';
                alignChildren = ['fill', 'fill'];

                add('statictext', undefined, 'Frame size:');
                var __frameAutoSize = add('dropdownlist', undefined, ['Fit artboad', 'Artboard size', 'Custom']);
                __frameAutoSize.selection = 0;
                __frameAutoSize.onChange = function () {
                    var val = this.selection.text === 'Custom';
                    __frameWidthText.enabled = __frameWidth.enabled = val;
                    __frameHeightText.enabled = __frameHeight.enabled = val;
                }
            }

            with (add('group')) {
                orientation = 'row';
                alignChildren = ['fill', 'fill'];

                with (add('group')) {
                    orientation = 'column';
                    alignChildren = 'fill';
                    var __frameWidthText = add('statictext', undefined, 'Width (px, mm)'),
                        __frameWidth = add('edittext', undefined, '300 mm');
                        __frameWidthText.enabled = __frameWidth.enabled = false;
                    add('statictext', undefined, 'Gutter X (px, mm)');
                    var __gutterX = add('edittext', undefined, '15 mm');
                    __gutterX.addEventListener('keydown', function(e) { inputNumberEvents(e, __gutterX, 0, Infinity); });
                    __gutterX.addEventListener('change', function(e) { inputNumberEvents(e, __gutterX, 0, Infinity); });
                }
        
                with (add('group')) {
                    orientation = 'column';
                    alignChildren = 'fill';
                    var __frameHeightText = add('statictext', undefined, 'Height (px, mm)'),
                        __frameHeight = add('edittext', undefined, '175 mm');
                        __frameHeightText.enabled = __frameHeight.enabled = false;
                    add('statictext', undefined, 'Gutter Y (px, mm)');
                    var __gutterY = add('edittext', undefined, '15 mm');
                    __gutterY.addEventListener('keydown', function(e) { inputNumberEvents(e, __gutterY, 0, Infinity); });
                    __gutterY.addEventListener('change', function(e) { inputNumberEvents(e, __gutterY, 0, Infinity); });
                }
            }
        }
        with (add('panel')) {
            alignChildren = 'left';

            with (add('group')) {
                orientation = 'row';
                alignChildren = 'left';
                add('statictext', undefined, 'Days week position:')
                var __daysPosition = add('dropdownlist', [0, 0, 80, 25], 'Top,Bottom,Top & Bottom'.split(','));
                __daysPosition.selection = 0;
            }

            with (add('group')) {
                orientation = 'row';
                alignChildren = 'left';
                add('statictext', undefined, 'Week num position:')
                var __weekNumbersPosition = add('dropdownlist', [0, 0, 80, 25], 'Left,Right,Left & Right'.split(','));
                __weekNumbersPosition.selection = 0;
            }

            with (add('group')) {
                orientation = 'row';
                alignChildren = ['fill', 'fill'];

                var __isDay = add('checkbox', undefined, 'Days week'),
                    __isWeek = add('checkbox', undefined, 'Week numbers');
            }

            with (add('group')) {
                orientation = 'row';
                alignChildren = ['fill', 'fill'];

                var __isMonth = add('checkbox', undefined, 'Month name'),
                    __isYearInMonth = add('checkbox', undefined, 'Year in month');
            }
            __isDay.value = __isWeek.value = __isMonth.value = __isYearInMonth.value = true;

            with (add('group')) {
                orientation = 'row';
                alignChildren = ['fill', 'fill'];

                var __otherDays = add('checkbox', undefined, 'Enable days of other months');
                __otherDays.value = true;
            }
        }
    }

    with (globalGroup.add('group')) {
        orientation = 'row';
        alignChildren = 'fill';

        add('statictext', undefined, 'Holidays - [day].[month]:');
        var winHolidays = add('edittext', [0, 0, 335, 25], '01.01, 07.01, 23.02, 08.03, 01.05, 09.05, 12.06, 04.11');
    }

    var winButtons = globalGroup.add('group');
    winButtons.alignChildren = ['fill', 'fill'];

    winButtons.add('statictext', undefined, 'All settings are saved automatically.');

    var cancel = winButtons.add('button', undefined, 'Cancel');
    cancel.helpTip = 'Press Esc to Close';
    cancel.onClick = function () { win.close(); }

    var ok = winButtons.add('button', undefined, 'Create calendar');
    ok.helpTip = 'Press Enter to Run';
    ok.onClick = startAction;
    ok.active = true;

function saveSettings() {
    var $file = new File(settingFile.folder + settingFile.name),
        data = [
            __startYear.text,
            __startMonth.text,
             __endYear.text,
             __endMonth.text,
            __lang.selection.index,
            __template.selection.index,
            __daysFormat.selection.index,
             __frameAutoSize.selection.index,
            __frameWidth.text,
            __gutterX.text,
            __frameHeight.text,
            __gutterY.text,
            __daysPosition.selection.index,
            __weekNumbersPosition.selection.index,
            __isDay.value,
            __isWeek.value,
            __isMonth.value,
            __isYearInMonth.value,
            __otherDays.value,
            __standart.selection.index
        ].toString() + '\n' + __weekends.text.replace(/ /g, '').replace(/,/g, ', ') + '\n' + winHolidays.text.replace(/ /g, '').replace(/,/g, ', ');

    $file.open('w');
    $file.write(data);
    $file.close();
}
function loadSettings() {
    var $file = File(settingFile.folder + settingFile.name);
    if ($file.exists) {
        try {
            $file.open('r');
            var data = $file.read().split('\n'),
                $main = data[0].split(','),
                $wnds = data[1],
                $holi = data[2];
            __startYear.text = $main[0];
            __startMonth.text = $main[1];
            __endYear.text = $main[2];
            __endMonth.text = $main[3];
            __lang.selection = parseInt($main[4]);
            __template.selection = parseInt($main[5]);
            __daysFormat.selection = parseInt($main[6]);
            __frameAutoSize.selection = parseInt($main[7]);
            __frameWidth.text = $main[8];
            __gutterX.text = $main[9];
            __frameHeight.text = $main[10];
            __gutterY.text = $main[11];
            __daysPosition.selection = parseInt($main[12]);
            __weekNumbersPosition.selection = parseInt($main[13]);
            __isDay.value = $main[14] === 'true' ? true : false;
            __isWeek.value = $main[15] === 'true' ? true : false;
            __isMonth.value = $main[16] === 'true' ? true : false;
            __isYearInMonth.value = $main[17] === 'true' ? true : false;
            __otherDays.value = $main[18] === 'true' ? true : false;
            __standart.selection = parseInt($main[19]);
            __weekends.text = $wnds;
            winHolidays.text = $holi;
        } catch (e) {}
        $file.close();
    }
}

function startAction() {
    try{
        var $size = {
                width: (__frameAutoSize.selection.text === 'Custom' ? __frameWidth.text.replace(/ /g, '') : __frameAutoSize.selection.text.replace(/ /g, '').toLowerCase()),
                height: (__frameAutoSize.selection.text === 'Custom' ? __frameHeight.text.replace(/ /g, '') : __frameAutoSize.selection.text.replace(/ /g, '').toLowerCase()),
            },
            $preset = (__daysPosition.selection.index === 2 ? 'days-title-top, days-title-bottom' : ('days-title-' + __daysPosition.selection.text.toLowerCase()));
            $preset += (__weekNumbersPosition.selection.index === 2 ? 'week-numbers-left, week-numbers-right' : ('week-numbers-' + __weekNumbersPosition.selection.text.toLowerCase()));
        new calendarikko({
            startYear:      parseInt(__startYear.text),
            endYear:        parseInt(__endYear.text),
            startMonth:     parseInt(__startMonth.text),
            endMonth:       parseInt(__endMonth.text),
            otherDays:      __otherDays.value ? 'fill': 'empty',
            language:       __lang.selection.text.toLowerCase().slice(0,2),
            holidays:       winHolidays.text.replace(/ /g, '').split(','),
            margin:         '0',
            standart:       __standart.selection.text === 'European' ? 'eu' : 'us',
            frameWidth:     $size.width,
            frameHeight:    $size.height,
            template:       __template.selection.text.toLowerCase(),
            daysFormat:     __daysFormat.selection.text.slice(0,1).toLowerCase() + __daysFormat.selection.text.replace(/ /g, '').slice(1),
            gutter_x:       __gutterX.text,
            gutter_y:       __gutterY.text,
            preset:         $preset,
            weekends:       __weekends.text.replace(/ /g, '').split(','),
            enableFrames: {
                day: __isDay.value,
                week: __isWeek.value,
                month: __isMonth.value,
                yearInMonth: __isYearInMonth.value,
            },
        }).create();
        win.close();
    }catch(e){$.errorMessage(e);}
}

loadSettings();
win.onClose = function() {
    saveSettings();
    return true;
}
win.center();
win.show();