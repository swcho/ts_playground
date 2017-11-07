
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';
import * as Flipping from 'flipping/dist/flipping';
import * as Rx from 'rxjs';

const house = document.querySelector('#house');
const range = document.querySelector('#range');
const label = document.querySelector('#label');

const f = new Flipping();
const update = f.wrap(rooms => {
    const prevRooms = house.getAttribute('data-rooms');
    house.setAttribute('data-prev-rooms', prevRooms);
    house.setAttribute('data-rooms', rooms);

    label.setAttribute('data-prev-rooms', prevRooms);
    label.setAttribute('data-rooms', rooms);
    label.setAttribute('data-rooms-delta', '' + (rooms - parseInt(prevRooms)));
});

const range$ = Rx.Observable
    .fromEvent<KeyboardEvent>(range, 'input')
    .map(e => e.target['value'])
    .startWith(6);

range$.subscribe(update);
