
import * as d3 from 'd3';

import {TickerItem} from './common';

const xScale = d3.scaleTime();
const yScale = d3.scaleLinear();

const ohlc = function(selection: d3.Selection<HTMLElement, TickerItem[], HTMLElement, TickerItem[]>) {
    console.log(selection);
    selection.each(function(data) {
        console.log(data);
        const series = d3.select(this).selectAll('.ohlc-series').data([data]);
        series.enter().append('g').classed('ohlc-series', true);
    });
};

const DEFAULT_DATA: TickerItem[] = [
    {
        open: 10,
        close: 15,
        low: 20,
        hight: 12,
        qty: 200,
    },
    {
        open: 10,
        close: 15,
        low: 20,
        hight: 12,
        qty: 200,
    },
];

export function draw(el: HTMLElement, data = DEFAULT_DATA) {

    d3.select(el).selectAll('svg').data(data)
        .enter()
        .append('g')
        .text(d => d.low);


}
