
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

// external js: packery.pkgd.js, draggabilly.pkgd.js

declare global {
    /**
     * https://github.com/metafizzy/packery
     */
    class Packery {
        constructor(grid, options);
        items: any[];
        bindDraggabillyEvents(draggie: Draggabilly);
        appended(elements);
    }

    /**
     * https://github.com/desandro/draggabilly
     */
    class Draggabilly {
        constructor(itemElem);
    }

}

let grid = document.querySelector('.grid');

let pckry = new Packery(grid, {
    columnWidth: 80,
    rowHeight: 80
});

// bind draggabilly events to item elements
pckry.items.forEach(function (item) {
    makeItemDraggable(item.element);
});

function makeItemDraggable(itemElem) {
    // make element draggable with Draggabilly
    let draggie = new Draggabilly(itemElem);
    // bind Draggabilly events to Packery
    pckry.bindDraggabillyEvents(draggie);
}

let addItemsButton = document.querySelector('#add-items');

addItemsButton.addEventListener('click', function () {
    let itemElems = [
        getItemElement('w2 h2'),
        getItemElement('w4 h2'),
        getItemElement('w4 h4'),
        getItemElement('w2 h2'),
        getItemElement('w2 h4'),
        getItemElement('w2 h2'),
    ];
    // append to grid via document fragment
    let fragment = document.createDocumentFragment();
    itemElems.forEach(function (itemElem) {
        fragment.appendChild(itemElem);
    });
    grid.appendChild(fragment);
    // add to packery & make draggable
    pckry.appended(itemElems);
    itemElems.forEach(makeItemDraggable);
});

// get item element
function getItemElement(className) {
    let itemElem = document.createElement('div');
    itemElem.className = 'item ' + className;
    return itemElem;
}
