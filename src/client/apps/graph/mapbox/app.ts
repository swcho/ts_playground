
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

declare const Plotly;

function unpack(rows, key) {
    return rows.map(function (row) { return row[key]; });
}

const unique = (strs: string[]) => Object.keys(strs.reduce((ret, str) => { ret[str] = null; return ret; }, {}));

Plotly.d3.csv('https://raw.githubusercontent.com/bcdunbar/datasets/master/meteorites_subset.csv', function (err, rows) {

    let classArray = unpack(rows, 'class');
    // let classes = [...(new Set(classArray) as any)];
    let classes = unique(classArray);
    // let classes = [...classArray];

    let data = classes.map(function (classes) {
        let rowsFiltered = rows.filter(function (row) {
            return (row.class === classes);
        });
        return {
            type: 'scattermapbox',
            name: classes,
            lat: unpack(rowsFiltered, 'reclat'),
            lon: unpack(rowsFiltered, 'reclong')
        };
    });

    let layout = {
        title: 'Meteorite Landing Locations',
        font: {
            color: 'white'
        },
        dragmode: 'zoom',
        mapbox: {
            center: {
                lat: 38.03697222,
                lon: -90.70916722
            },
            domain: {
                x: [0, 1],
                y: [0, 1]
            },
            style: 'dark',
            zoom: 1
        },
        margin: {
            r: 20,
            t: 40,
            b: 20,
            l: 20,
            pad: 0
        },
        paper_bgcolor: '#191A1A',
        plot_bgcolor: '#191A1A',
        showlegend: true,
        annotations: [{
            x: 0,
            y: 0,
            xref: 'paper',
            yref: 'paper',
            text: 'Source: <a href="https://data.nasa.gov/Space-Science/Meteorite-Landings/gh4g-9sfh" style="color: rgb(255,255,255)">NASA</a>',
            showarrow: false
        }]
    };

    Plotly.setPlotConfig({
        mapboxAccessToken: 'pk.eyJ1IjoiZXRwaW5hcmQiLCJhIjoiY2luMHIzdHE0MGFxNXVubTRxczZ2YmUxaCJ9.hwWZful0U2CQxit4ItNsiQ'
    });

    Plotly.plot('graphDiv', data, layout);
});



