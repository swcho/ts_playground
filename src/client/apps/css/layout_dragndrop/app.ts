
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

const elDebug = document.getElementById('debug');

// helper to find the closest parent by class with on optional stop class to stop searching
function closest(el, clazz, stopClazz): HTMLElement {
    if (el.classList.contains(stopClazz)) return null;

    while ((el = el.parentElement)
        && !el.classList.contains(clazz)
        && !el.classList.contains(stopClazz));

    return el.classList.contains(stopClazz) ? null : el;
}

const dnd = (element: HTMLElement, options?) => {
    // find all dragable elements
    let draggableElements = element.querySelectorAll('[draggable=true]');
    let activeDragElement: HTMLElement;
    let placeholderElement: HTMLElement;
    let startElementRect: ClientRect;
    console.log('Drag\'n\'Drop Container: ', element, 'Draggable elements: ', draggableElements);

    // Function responsible for sorting
    const _onDragOver = function (event) {
        placeholderElement.style.width = startElementRect.width + 'px';
        placeholderElement.style.height = startElementRect.height + 'px';
        placeholderElement.style.top = startElementRect.top + 'px';
        placeholderElement.style.left = startElementRect.left + 'px';
        console.log('Placeholder: ', placeholderElement, 'startRect: ', startElementRect);

        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        console.log('event.target', event.target);

        let target = closest(event.target, 'card', 'playground');
        // let target = closest(activeDragElement, 'card', 'playground');
        if (target && target !== activeDragElement) {
            let rect = target.getBoundingClientRect();
            let horizontal = event.clientY > startElementRect.top && event.clientY < startElementRect.bottom;
            let next = false;

            if (horizontal) {
                next = (event.clientX - rect.left) / (rect.right - rect.left) > .5;
            } else {
                next = !((event.clientY - rect.top) / (rect.bottom - rect.top) > .5);
            }

            console.log('onDragOver target classlist: ', target);

            // insert at new position
            element.insertBefore(activeDragElement, next && target.nextSibling || target);

            // update rect for insert poosition calculation
            startElementRect = activeDragElement.getBoundingClientRect();
        }
        elDebug.innerText = `
            ${event.clientX},${event.clientY}
        `;
    };

    // handle drag event end
    const _onDragEnd = function (event) {
        event.preventDefault();

        placeholderElement.style.width = '0px';
        placeholderElement.style.height = '0px';
        placeholderElement.style.top = '0px';
        placeholderElement.style.left = '0px';

        activeDragElement.classList.remove('moving');
        element.removeEventListener('dragover', _onDragOver, false);
        element.removeEventListener('dragend', _onDragEnd, false);
    };


    element.addEventListener('dragstart', function (event) {

        const el = event.target as HTMLElement;
        // don't allow selection to be dragged if it is not draggable
        if (el.getAttribute('draggable') !== 'true') {
            event.preventDefault();
            return;
        }

        activeDragElement = el;
        startElementRect = activeDragElement.getBoundingClientRect();

        // Limiting the movement type
        event.dataTransfer.effectAllowed = 'move';

        // setData => Fuinktioniert im IE nicht bzw. nur bedingt
        // IE에서 또는 조건부로 만 작동합니다.
        // !!!! wird aber scheinbar im Firefox für die Vorschau benötigt
        // 하지만 Firefox에서 미리보기가 필요한 것 같습니다.
        // event.dataTransfer.setData('text/html', activeDragElement.innerHtml);
        event.dataTransfer.setData('text/uri-list', 'http://www.mozilla.org');

        // Subscribing to the events at dnd
        element.addEventListener('dragover', _onDragOver, false);
        element.addEventListener('dragend', _onDragEnd, false);

        activeDragElement.classList.add('moving');

        // import placeholder
        placeholderElement = element.querySelector('.tpl-placeholder');
    });
};


// active the drag'n'drop functionallity for the .playground element
dnd(document.querySelector('.playground'));
