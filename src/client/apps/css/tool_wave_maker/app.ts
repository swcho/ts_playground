
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// https://codepen.io/yoksel/pen/xLZjZp
import './style.scss';
require('./tinylib');

declare const tinyLib;

let doc = document;
const $ = tinyLib;
let isCmdPressed = false;

let svg = $.get('.svg');
let targetPath = $.get('.shape-arc');

let popup = $.get('.popup');
let popupOpenedClass = 'popup--opened';
let popupToggle = $.get('.popup__toggle');

let code = $.get('.code');
let codeOutput = $.get('.code__textarea');
let codeButton = $.get('.code__toggle');

let waveTypesItems = $.get('.wave-types__items');

let pathCoordsAttrs = $.get('.path-coords__attrs');
let attrsClass = 'attrs';
let itemClass = attrsClass + '__item';
let itemLineClass = itemClass + '--line';
let inputClass = attrsClass + '__input';
let inputErrorClass = inputClass + '--error';
let labelClass = attrsClass + '__label';
let labelLineClass = labelClass + '--line';
let labelHiddenClass = labelClass + '--hidden';
let errorClass = attrsClass + '__error';

let pathCoordsList = [{
    prop: 'startLetter'
},
{
    prop: 'startX',
    desc: 'start X'
},
{
    prop: 'startY',
    desc: 'start Y'
},
{
    prop: 'arcLetter'
},
{
    prop: 'rX',
    desc: 'rx',
    min: 0
},
{
    prop: 'rY',
    desc: 'ry',
    min: 0
},
{
    prop: 'xRot',
    desc: 'x-axis-rotation',
},
{
    prop: 'largeArc',
    desc: 'large-arc-flag',
    min: 0,
    max: 1
},
{
    prop: 'sweep',
    desc: 'sweep-flag',
    min: 0,
    max: 1
},
{
    prop: 'endX',
    desc: 'end X'
},
{
    prop: 'endY',
    desc: 'end Y'
},
];

let pathParams = $.get('.path-params');
let pathParamsList = [{
    prop: 'repeat',
    desc: 'repeat',
    min: 0
},
{
    prop: 'strokeWidth',
    desc: 'stroke-width',
    min: 1
}
];

let flags = $.get('.flags');
let flagsList = [
    {
        prop: 'rotateLargeArc',
        desc: 'larg-arc-flag',
        type: 'checkbox',
        disableCond: {
            prop: 'repeat',
            value: 0
        }
    },
    {
        prop: 'rotateSweep',
        desc: 'sweep-flag',
        type: 'checkbox',
        disableCond: {
            prop: 'repeat',
            value: 0
        }
    }
];

let inputsToDisable = [];

let wavesInputsList = {
    radiowave: {
        startX: 150,
        startY: 200,
        rX: 80,
        rY: 100,
        endY: 200,
        endX: 300,
        xRot: 0,
        largeArc: 0,
        sweep: 0,
        repeat: 4,
        rotateSweep: true,
        rotateLargeArc: false,
        strokeWidthBtn: 18
    },
    seawave: {
        startX: 150,
        startY: 200,
        rX: 80,
        rY: 100,
        endX: 300,
        endY: 200,
        xRot: 0,
        largeArc: 0,
        sweep: 0,
        repeat: 4,
        repeatBtn: 2,
        rotateSweep: false,
        rotateLargeArc: false,
        strokeWidthBtn: 11
    },
    lightbulbs: {
        startX: 150,
        startY: 200,
        rX: 80,
        rY: 80,
        endX: 250,
        endY: 200,
        xRot: 0,
        largeArc: 1,
        sweep: 1,
        repeat: 6,
        rotateSweep: true,
        rotateLargeArc: false,
        strokeWidthBtn: 21
    },
    cursive: {
        startX: 150,
        startY: 200,
        rX: 20,
        rY: 90,
        endX: 300,
        endY: 200,
        xRot: 60,
        largeArc: 1,
        sweep: 0,
        repeat: 4,
        rotateSweep: true,
        rotateLargeArc: false,
        strokeWidthBtn: 20
    },
    bubbles: {
        startX: 150,
        startY: 220,
        rX: 80,
        rY: 80,
        endX: 230,
        endY: 130,
        xRot: 0,
        largeArc: 0,
        sweep: 0,
        repeat: 7,
        rotateSweep: true,
        rotateLargeArc: true,
        strokeWidthBtn: 16
    },
    leaves: {
        startX: 150,
        startY: 220,
        rX: 160,
        rY: 200,
        endX: 230,
        endY: 50,
        xRot: 0,
        largeArc: 0,
        sweep: 1,
        repeat: 7,
        rotateSweep: false,
        rotateLargeArc: false,
        strokeWidthBtn: 15
    },
    circle: {
        hidden: true,
        startX: 200,
        startY: 50,
        rX: 100,
        rY: 100,
        endX: 200,
        endY: 300,
        xRot: 0,
        largeArc: 0,
        sweep: 0,
        repeat: 1,
        rotateSweep: false,
        rotateLargeArc: true
    }
};

// ---------------------------------------------

let Arc = function (params) {

    this.params = params;
    this.path = params.path || targetPath;
    this.hasControls = params.hasControls || false;
    this.startLetter = 'M';
    this.arcLetter = 'A';
    this.startX = params.startX || 150;
    this.startY = params.startY || 200;
    this.endX = params.endX || 400;
    this.endY = params.endY || 200;
    this.rX = params.rX || 130;
    this.rY = params.rY || 120;
    this.xRot = params.xRot || 0;
    this.largeArc = params.largeArc || 0;
    this.sweep = params.sweep || 0;
    this.repeat = params.repeat || 0;
    this.strokeWidth = params.strokeWidth || 5;
    this.pathCoordsInputs = [];

    this.rotateSweep = params.rotateSweep !== undefined ? params.rotateSweep : true;
    this.rotateLargeArc = params.rotateLargeArc !== undefined ? params.rotateLargeArc : false;
    this.currentControl;

    if (this.hasControls) {
        this.addHelpers();
        this.addControls();

    }
    this.getPathCoords();
    this.setPathCoords();

    if (this.hasControls) {
        this.addPathParams({
            list: pathCoordsList,
            target: pathCoordsAttrs,
            itemIsLine: false,
            labelIsHidden: true,
        });
        this.addPathParams({
            list: pathParamsList,
            target: pathParams,
            itemIsLine: true,
            labelIsHidden: false,
        });
        this.addPathParams({
            list: flagsList,
            target: flags,
            itemIsLine: true,
            labelIsHidden: false,
        });

        this.addWaveInputs();
    }
};

// ---------------------------------------------

Arc.prototype.getPathCoords = function () {
    this.pathCoordsSet = {
        startLetter: this.startLetter,
        startX: this.startX,
        startY: this.startY,
        arcLetter: this.arcLetter,
        rX: this.rX,
        rY: this.rY,
        xRot: this.xRot,
        largeArc: this.largeArc,
        sweep: this.sweep,
        endX: this.endX,
        endY: this.endY
    };

    for (let key in this.pathCoordsSet) {
        let item = this.pathCoordsSet[key];
        if (!isNaN(item)) {
            this.pathCoordsSet[key] = Math.round(item);
        }
    }

    let pathVals = Object.keys(this.pathCoordsSet).map(k => this.pathCoordsSet[k]);
    this.pathCoords = pathVals.join(' ');
};

// ---------------------------------------------

Arc.prototype.setPathCoords = function () {
    this.path.attr({
        'd': this.pathCoords,
        'stroke-width': this.strokeWidth
    });
    this.path.rect = this.path.elem.getBBox();

    this.addWaves();

    if (this.hasControls) {
        this.setAllHelperArcParams();
        this.setAllControlsParams();
        this.updateCode();
    }
};

// ---------------------------------------------

Arc.prototype.addControls = function () {
    let that = this;
    this.controls = {
        start: {
            coordsFunc: this.getStartCoords,
            fill: 'greenyellow',
            targets: {
                'startX': getMouseX,
                'startY': getMouseY
            }
        },
        end: {
            coordsFunc: this.getEndCoords,
            fill: 'greenyellow',
            targets: {
                'endX': getMouseX,
                'endY': getMouseY
            }
        },
        // I dont't know how to place them on path
        // with rotation and if startY != endY
        // rx: {
        //   coordsFunc: this.getRxCoords,
        //   targets: {
        //     'rX': this.getRX
        //   }
        // },
        // ry: {
        //   coordsFunc: this.getRyCoords,
        //   targets: {
        //     'rY': this.getRY
        //   }
        // }
    };

    for (let key in this.controls) {
        let set = this.controls[key];
        set.elemSet = $.createNS('circle')
            .attr({
                id: key,
                r: 7
            })
            .addClass('point-control');

        svg.append(set.elemSet);

        set.elemSet.elem.addEventListener('mousedown', function (event) {
            that.currentControl = that.controls[this.id];
            doc.onmousemove = function (event) {
                that.drag(event);
            };
        });
    }
};

// ---------------------------------------------

Arc.prototype.getStartCoords = function () {
    return {
        cx: this.startX ? this.startX : 0,
        cy: this.startY ? this.startY : 0
    };
};

// ---------------------------------------------

Arc.prototype.getEndCoords = function () {
    return {
        cx: this.endX ? this.endX : 0,
        cy: this.endY ? this.endY : 0
    };
};

// ---------------------------------------------

Arc.prototype.getRxCoords = function () {
    return {
        cx: (this.arcHelpers.flipBoth.rect.x + this.arcHelpers.flipBoth.rect.width),
        cy: (this.arcHelpers.flipBoth.rect.y + this.rY)
    };
};

Arc.prototype.getRX = function (event) {
    let rect = this.arcHelpers.flipBoth.rect;
    let offset = event.offsetX - (rect.x + rect.width);
    let rX = this.rX + offset;
    return rX;
};

// ---------------------------------------------

Arc.prototype.getRyCoords = function () {
    return {
        cx: (this.path.rect.x + this.path.rect.width / 2),
        cy: (this.path.rect.y + this.path.rect.height)
    };
};

Arc.prototype.getRY = function (event) {
    let rect = this.path.rect;
    let offset = event.offsetY - (rect.y + rect.height);
    let rY = this.rY + offset;
    return rY;
};

// ---------------------------------------------

Arc.prototype.setAllControlsParams = function () {
    for (let key in this.controls) {
        let set = this.controls[key];
        let coords = set.coordsFunc.apply(this);

        set.elemSet.attr({
            cx: coords.cx,
            cy: coords.cy,
        });
    }
};

// ---------------------------------------------

Arc.prototype.drag = function (event) {
    let x = event.offsetX;
    let y = event.offsetY;
    let targets = this.currentControl.targets;

    for (let target in targets) {
        this[target] = targets[target].call(this, event);
    }

    this.getPathCoords();
    this.setPathCoords();
    this.updateInputs();

    const that = this;
    doc.onmouseup = function () {
        doc.onmousemove = null;
        that.currentControl = null;
    };
};

// ---------------------------------------------

Arc.prototype.addHelpers = function () {
    this.arcHelpers = {};
    this.arcHelpers.flipBoth = this.addHelperArc({
        id: 'arcHelper-flipSweepAndArc',
        flipSweep: true,
        flipLargeArc: true,
        // stroke: 'seagreen'
    });
    this.arcHelpers.flipArc = this.addHelperArc({
        id: 'arcHelper-flipArc',
        flipSweep: false,
        flipLargeArc: true,
        // stroke: 'orangered'
    });
    this.arcHelpers.flipSweep = this.addHelperArc({
        id: 'arcHelper-flipSweep',
        flipSweep: true,
        flipLargeArc: false,
        // stroke: 'royalblue'
    });

    this.arcHelpers.list = [
        this.arcHelpers.flipBoth,
        this.arcHelpers.flipArc,
        this.arcHelpers.flipSweep
    ];
};

// ---------------------------------------------

Arc.prototype.addHelperArc = function (params) {
    let arcHelper: any = {};
    arcHelper.params = params;
    arcHelper.elemSet = $.createNS('path')
        .attr({
            'id': params.id,
            'fill': 'none',
            'stroke': params.stroke || '#999'
        });

    svg.prepend(arcHelper.elemSet);
    return arcHelper;
};

// ---------------------------------------------

Arc.prototype.setHelperArcParams = function (arcHelper) {
    let arcParamsSet = Object.assign({}, this.pathCoordsSet);

    if (arcHelper.params) {
        if (arcHelper.params.flipLargeArc) {
            arcParamsSet.largeArc = +!arcParamsSet.largeArc;
        }
        if (arcHelper.params.flipSweep) {
            arcParamsSet.sweep = +!arcParamsSet.sweep;
        }
    }

    // let arcParams = Object.values(arcParamsSet).join(' ');
    let arcParams = Object.keys(arcParamsSet).map(k => arcParamsSet[k]).join(' ');

    arcHelper.elemSet.attr({
        'd': arcParams
    });
    arcHelper.rect = arcHelper.elemSet.elem.getBBox();
};

// ---------------------------------------------

Arc.prototype.setAllHelperArcParams = function () {
    let that = this;
    this.arcHelpers.list.map(function (item) {
        that.setHelperArcParams(item);
    });
};

// ---------------------------------------------

Arc.prototype.changeValueByKeyboard = function (event, input, error) {
    if (!(event.keyCode === 38 || event.keyCode === 40)) {
        return;
    }

    let step = 1;

    if (event.shiftKey && (event.ctrlKey || isCmdPressed)) {
        step = 1000;
    } else if (event.ctrlKey || isCmdPressed) {
        step = 100;
    } else if (event.shiftKey) {
        step = 10;
    }

    if (event.keyCode === 38) {
        input.value = +input.value + step;
    } else {
        input.value = +input.value - step;
    }

    setInputWidth.apply(input);

    if (!checkValue.apply(input, [error])) {
        return false;
    }

    this[input.name] = input.value;
    this.getPathCoords();
    this.setPathCoords();
};

// ---------------------------------------------

Arc.prototype.updateInputs = function () {
    let that = this;

    this.pathCoordsInputs.forEach(function (item) {
        let name = item.elem.name;
        if (that[name] == null) {
            return;
        }
        let value = +item.elem.value;
        let newValue = that.pathCoordsSet[name] || that[name];

        if (item.elem.type === 'checkbox') {
            item.elem.checked = !!that[name];
            return;
        }

        item.elem.value = newValue;

        if (value !== newValue) {
            setInputWidth.apply(item.elem);
        }

        disableInputs.call(item.elem);
    });
};

// ---------------------------------------------

Arc.prototype.createInput = function (item) {
    let name = item.prop;
    let value = this[name];

    let input = $.create('input')
        .attr({
            type: item.type || 'text',
            name: name,
            id: name,
            value: value
        })
        .addClass([
            inputClass,
            inputClass + '--' + name,
            inputClass + '--' + typeof (value)
        ]);

    if (item.min !== undefined && item.min !== null) {
        input.attr({
            min: item.min
        });
    }
    if (item.max) {
        input.attr({
            max: item.max
        });
    }
    if (typeof (value) === 'string') {
        input.attr({
            'disabled': ''
        });
    }
    else if (typeof (value) === 'boolean' && value === true) {
        input.attr({
            checked: value
        });
    }


    if (item.disableCond) {
        let cond = item.disableCond;

        if (this[cond.prop] === cond.value) {
            input.elem.disabled = true;
        }

        inputsToDisable.push({
            input: input,
            disableCond: item.disableCond
        });
    }

    return input;
};

// ---------------------------------------------

Arc.prototype.createLabel = function (item, params) {
    let name = item.prop;
    let value = this[name];

    let label = $.create('label')
        .attr({
            for: name
        })
        .addClass(labelClass);

    if (params.labelIsHidden) {
        label.addClass(labelHiddenClass);
    }
    if (params.itemIsLine) {
        label.addClass(labelLineClass);
    }
    label.html(item.desc);

    return label;
};

// ---------------------------------------------

Arc.prototype.createError = function (item) {
    if (item.min === undefined && item.max === undefined) {
        return null;
    }
    let error = $.create('span')
        .addClass(errorClass);

    return error;
};

// ---------------------------------------------

Arc.prototype.addPathParams = function (params) {
    let that = this;
    let list = params.list;
    let target = params.target;
    let items = [];

    list.forEach(function (item) {
        let name = item.prop;
        let value = that[name];

        let input = that.createInput(item);

        let label = that.createLabel(item, params);

        let error = that.createError(item);

        item = $.create('span')
            .addClass([
                itemClass,
                itemClass + '--' + name
            ])
            .append([input, label, error]);

        if (params.itemIsLine) {
            item.addClass(itemLineClass);
        }

        that.pathCoordsInputs.push(input);
        items.push(item);

        // Events
        input.elem.addEventListener('input', function () {
            setInputWidth.apply(this);
            if (!checkValue.apply(this, [error])) {
                return false;
            }
            that[this.name] = this.value;
            that.getPathCoords();
            that.setPathCoords();
            disableInputs.call(this);
        });

        input.elem.addEventListener('keydown', function (event) {
            if (this.type !== 'text') {
                return;
            }
            setIsCmd(event);
            that.changeValueByKeyboard(event, this, error);
            disableInputs.call(this);
        });

        input.elem.addEventListener('keyup', function (event) {
            unSetIsCmd(event);
        });

        input.elem.addEventListener('click', function (event) {
            if (this.type !== 'checkbox') {
                return;
            }
            that[this.name] = this.checked;

            that.getPathCoords();
            that.setPathCoords();
        });

    });

    target.append(items);
};

// ---------------------------------------------

// context: input
function disableInputs() {
    let inputId = this.id;
    let inputValue = +this.value;

    inputsToDisable.forEach(function (item) {
        let input = item.input;
        let cond = item.disableCond;

        if (inputId === cond.prop) {
            if (inputValue === cond.value) {
                input.elem.disabled = true;
            }
            else {
                input.elem.disabled = false;
            }
        }
    });
};

// ---------------------------------------------

Arc.prototype.addWaves = function () {
    let wavesParamsSet = [this.pathCoords];
    if (this.repeat === 0) {
        return;
    }

    for (let i = 0; i < this.repeat; i++) {
        wavesParamsSet.push(this.addWave(i));
    }

    let wavesParams = wavesParamsSet.join(' ');
    this.path.attr({
        'd': wavesParams
    });
};

// ---------------------------------------------

Arc.prototype.addWave = function (counter) {
    let arcParamsSet = {};
    let waveWidth = this.pathCoordsSet.endX - this.pathCoordsSet.startX;

    for (let key in this.pathCoordsSet) {
        arcParamsSet[key] = this.pathCoordsSet[key];
    }

    delete arcParamsSet['startLetter'];
    delete arcParamsSet['startX'];
    delete arcParamsSet['startY'];

    arcParamsSet['endX'] = this.pathCoordsSet.endX + (waveWidth * (counter + 1));
    if (counter % 2 === 0) {
        if (this.rotateSweep) {
            arcParamsSet['sweep'] = +!this.pathCoordsSet.sweep;
        }
        if (this.rotateLargeArc) {
            arcParamsSet['largeArc'] = +!this.pathCoordsSet.largeArc;
        }

        arcParamsSet['endY'] = this.pathCoordsSet.startY;
    }

    // let arcParamsVals = Object.values(arcParamsSet);
    let arcParamsVals = Object.keys(arcParamsSet).map(k => arcParamsSet[k]);
    let arcParams = arcParamsVals.join(' ');
    return arcParams;
};

// ---------------------------------------------

Arc.prototype.cloneParams = function () {
    let params = Object.assign({}, this.pathCoordsSet);
    params.repeat = this.repeat;
    params.rotateLargeArc = this.rotateLargeArc;
    params.rotateSweep = this.rotateSweep;
    params.strokeWidth = this.strokeWidth;

    return params;
};

// ---------------------------------------------

Arc.prototype.getCode = function (params) {
    let newParams = Object.assign({}, params);
    newParams.path = this.path.clone();

    if (newParams.strokeWidthBtn) {
        newParams.strokeWidth = newParams.strokeWidthBtn;
    }
    if (newParams.repeatBtn) {
        newParams.repeat = newParams.repeatBtn;
    }

    let newArc = new Arc(newParams);
    let newPath = newArc.path;
    let newPathElem = newPath.elem;
    newPathElem.removeAttribute('class');

    let copyRect = newPathElem.getBBox();
    let strokeWidth = +newArc.strokeWidth;
    let strokeWidthHalf = strokeWidth / 2;

    newArc.startX -= copyRect.x - strokeWidthHalf;
    newArc.startY -= copyRect.y - strokeWidthHalf;
    newArc.endX -= copyRect.x - strokeWidthHalf;
    newArc.endY -= copyRect.y - strokeWidthHalf;

    newArc.getPathCoords();
    newArc.setPathCoords();

    let viewBox = [
        0,
        0,
        copyRect.width + strokeWidth,
        copyRect.height + strokeWidth
    ];

    viewBox = viewBox.map(function (item) {
        return Math.round(item);
    });
    const viewBoxStr = viewBox.join(' ');

    let result = '<svg viewBox="' + viewBoxStr + '">';
    result += newPathElem.outerHTML + '</svg>';

    return result;
};

// ---------------------------------------------

Arc.prototype.updateCode = function () {
    let output = this.getCode(this.cloneParams());
    codeOutput.val(output);

    changeContentHeight.call(codeButton.elem);
};

// ---------------------------------------------

Arc.prototype.addWaveInputs = function () {
    let that = this;
    let prefix = 'wave-types';
    let items = [];

    for (let key in wavesInputsList) {
        let params = wavesInputsList[key];

        if (params.hidden) {
            continue;
        }
        let demoPath = this.getCode(params);

        let button = $.create('button')
            .attr({
                type: 'button',
                name: prefix,
                id: key
            })
            .html(demoPath)
            .addClass(prefix + '__button');

        let item = $.create('div')
            .addClass(prefix + '__item')
            .append([button]);

        items.push(item);

        button.elem.addEventListener('click', function () {
            let params = wavesInputsList[this.id];

            for (let key in params) {
                that[key] = params[key];
            }

            that.getPathCoords();
            that.setPathCoords();
            that.updateInputs();
        });
    }

    waveTypesItems.append(items);
};

// ---------------------------------------------

function setInputWidth() {
    if (this.type !== 'text') {
        return;
    }

    this.style.minWidth = this.value.length * .65 + 'em';
}

// ---------------------------------------------

function checkValue(errorElem) {
    if (!errorElem) {
        return true;
    }

    errorElem.html('');
    this.classList.remove(inputErrorClass);

    if (isNaN(this.value)) {
        errorElem.html('not a number');
        this.classList.add(inputErrorClass);
        return false;
    } else if (this.min && this.value < this.min) {
        this.classList.add(inputErrorClass);
        errorElem.html('minimum: ' + this.min);
        return false;
    } else if (this.max && this.value > this.max) {
        this.classList.add(inputErrorClass);
        errorElem.html('maximum: ' + this.max);
        return false;
    }

    return true;
}

// ---------------------------------------------

function setIsCmd(event) {
    // Chrome || FF
    if (event.keyCode === 91 || (event.key === 'Meta' && event.keyCode === 224)) {
        isCmdPressed = true;
    }
}

function unSetIsCmd(event) {
    // Chrome || FF
    if (event.keyCode === 91 || (event.key === 'Meta' && event.keyCode === 224)) {
        isCmdPressed = false;
    }
}
doc.addEventListener('keyup', function (event) {
    unSetIsCmd(event);
});

// ---------------------------------------------

function getMouseX(event) {
    return event.offsetX;
}

function getMouseY(event) {
    return event.offsetY;
}

// ---------------------------------------------

// Popup events
popup.forEach(function (item) {
    item.elem.addEventListener('click', function (event) {
        event.stopPropagation();
    });
});

popupToggle.forEach(function (item) {

    item.elem.addEventListener('click', function (event) {
        let parent = this.parentNode;

        if (parent.classList.contains(popupOpenedClass)) {
            parent.classList.remove(popupOpenedClass);
        }
        else {
            closeOpened();
            changeContentHeight.call(this);

            parent.classList.toggle(popupOpenedClass);
        }
    });
});


doc.addEventListener('click', function () {
    closeOpened();
});

function closeOpened() {
    let popupPanel = $.get('.' + popupOpenedClass);

    if (popupPanel.elem) {
        popupPanel.removeClass(popupOpenedClass);
    }

}

function changeContentHeight() {
    let parent = this.parentNode;
    let container = parent.querySelector('.popup__container');
    let content = parent.querySelector('.popup__content');

    // trick to get real scrollHeight
    content.style.maxHeight = '0';
    container.style.maxHeight = (content.scrollHeight + 10) + 'px';
    content.style.maxHeight = null;
}

// ---------------------------------------------

let arc = new Arc({
    path: targetPath,
    hasControls: true
});
