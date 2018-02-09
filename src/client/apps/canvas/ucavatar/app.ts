
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);
const CONFIG = {
    division: 25,
    add: 0.1,
    usePrev: false,
    noFade: false,
};

// let gui = new dat.GUI();
// gui.add(CONFIG, 'division', 0.01, 50).step(0.01);
// gui.add(CONFIG, 'add', -1, 1).step(0.1);
// gui.add(CONFIG, 'usePrev');
// gui.add(CONFIG, 'noFade');

// Ucavatar.js
// Unique avatars generator
//
// Version: 1.0.3
// Author:  Ivan Bogachev <sfi0zy@gmail.com>, 2017
// License: MIT

const Ucavatar = (function () {

    function strangeHash(str): any {
        let hash = 0;

        if (str.length === 0) {
            return '' + hash;
        }

        for (let i = 0, len = str.length; i < len; i++) {
            const chr = str.charCodeAt(i);

            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }

        return (new Array(9).join('1') + Math.abs(hash)).slice(-8);
    }


    function getDecimal(num) {
        let str = '' + num,
            zeroPos = str.indexOf('.');

        if (zeroPos === -1) {
            return 0;
        }

        str = str.slice(zeroPos);

        return +str;
    }


    function hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = function (p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }


    function getColorScheme(hash: number, alpha: number): string[4] {
        let colorScheme: string[] = [];

        let lastH = 0,
            lastS = 0,
            lastL = 0;

        for (let i = 0; i < 4; i++) {
            let H = (hash[i] * 10 + hash[i + 1]) / 1000,
                S = hash[i + 2] * 0.05 + .5,
                L = hash[i + 3] * 0.09 + .1,
                sign;

            if (Math.abs(H - lastH) < .3) {
                sign = H > lastH ? 1 : -1;
                H = getDecimal(H + sign * .2 + 1);
            }

            if (Math.abs(S - lastS) < .3) {
                sign = S > lastS ? 1 : -1;
                S = getDecimal(S + sign * .3 + 1);
            }

            if (Math.abs(L - lastL) < .3) {
                sign = L > lastL ? 1 : -1;
                L = getDecimal(L + sign * .3 + 1);
            }

            let rgb = hslToRgb(H, S, L);

            colorScheme.push('rgba(' +
                rgb[0] + ',' +
                rgb[1] + ',' +
                rgb[2] + ',' +
                alpha + ')'
            );

            lastH = H;
            lastS = S;
            lastL = L;
        }

        return colorScheme as any;
    }


    function getRectCoords(hash, size) {
        let coords = [];

        for (let i = 4; i < 8; i++) {
            let h = hash[i];

            if (hash[i] < 0.01) {
                h = i;
            }

            let c = h * size * .03,
                c1 = c,
                c2 = c,
                c3 = c,
                c4 = c;

            if (2 * c < (size / 2)) {
                c1 *= -2;
                c2 *= -2;
                c3 *= 5;
                c4 *= 5;
            }

            coords.push([c1, c2, c3, c4]);
        }

        return coords;
    }


    function drawRects(ctx: CanvasRenderingContext2D, colors: string[4], coords, s) {
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = colors[i];
            const c = coords[i];

            for (let j = 0; j < 2 * s; j++) {
                ctx.fillRect(c[0], c[1], c[2], c[3]);
                ctx.rotate(Math.PI / s);
            }
        }
    }


    function drawCircle(ctx, colors, size) {
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, 2 * Math.PI, false);
        ctx.fillStyle = colors[0];
        ctx.fill();
    }


    function Ucavatar(canvas, str, size?) {
        if (typeof canvas === 'string') {
            canvas = document.querySelector(canvas);
        }

        if (!canvas || !document.body.contains(canvas)) {
            throw new Error('Ucavatar: canvas does not exists');
        }

        if (!size) {
            size = 64;
        }

        canvas.height = size;
        canvas.width = size;

        const ctx = canvas.getContext('2d');
        const h = strangeHash(str);
        let colors = getColorScheme(h, .5);
        const rectCoords = getRectCoords(h, size);
        const s = h[0] % 5 + 3;

        ctx.fillStyle = colors[0];
        ctx.fillRect(0, 0, size, size);

        ctx.translate(size / 2, size / 2);
        ctx.rotate(h[0] * Math.PI / (h[1] + 1));
        drawRects(ctx, colors, getRectCoords(h, size), s);

        ctx.rotate(Math.PI / 2);
        colors = getColorScheme(h, .8);
        drawRects(ctx, colors, getRectCoords(h, size / 3), s);

        colors = getColorScheme(h, .7);
        drawCircle(ctx, colors, size / 2);

        colors = getColorScheme(h, .8);
        drawCircle(ctx, colors, 3);

        colors = getColorScheme(h, .8);
        drawRects(ctx, colors, getRectCoords(h, size / 3), s);
        ctx.rotate(Math.PI / 2);

        drawCircle(ctx, colors, size / 5);
        colors = getColorScheme(h, 1);
        drawRects(ctx, colors, getRectCoords(h, size / 6), s);
        ctx.rotate(Math.PI / 2);
        drawCircle(ctx, colors, size / 8);
        drawRects(ctx, colors, getRectCoords(h, size / 10), s);

        let colors2 = getColorScheme(h, .5);

        for (let i = 0; i < s; i++) {
            ctx.rotate(2 * Math.PI / s);
            ctx.translate(size / 4, size / 4);
            drawRects(ctx, colors, getRectCoords(h, size / (1.7 * s)), s);
            drawCircle(ctx, colors2, size / (2 * s));
            drawRects(ctx, colors, getRectCoords(h, size / (3 * s)), s);
            ctx.translate(-size / 4, -size / 4);
        }

        ctx.rotate(Math.PI / s);

        for (let i = 0; i < s; i++) {
            ctx.rotate(2 * Math.PI / s);
            ctx.translate(size / (s * h[0] / 10), size / (s * h[0] / 10));
            drawRects(ctx, colors, getRectCoords(h, size / (3 * s)), s);
            ctx.translate(-size / (s * h[0] / 10), -size / (s * h[0] / 10));
        }
    };

    return Ucavatar;

})();


// if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
//     module.exports.Ucavatar = Ucavatar;
// } else {
//     window.Ucavatar = Ucavatar;
// }

// -------------------------------------------------

const names = [
    // 0
    'Gisele Tibbits',
    'Alix Metayer',
    'Nguyet Lago',
    'Bonita Leu',
    'Ola Vila',
    'Luetta Shaughnessy',
    'Ileana Reppert',
    'Dina Huizar',
    'Michaele Hugo',
    'Deshawn Imboden',
    // 10
    'Monty Bethea',
    'Audie Weesner',
    'Florencia Kittelson',
    'Zella Blackerby',
    'Augusta Varley',
    'Marcela Priebe',
    'Melissa Kolman',
    'Tamisha Hillis',
    'Lynwood Whitener',
    'Mellissa Warf',
    // 20
    'Margherita Flippen',
    'Ewa Navarre',
    'Pattie Hardrick',
    'Wilbur Banda',
    'Morgan Sydow',
    'Nisha Schmeltzer',
    'Liz Croley',
    'Margurite Delreal',
    'Ayesha Penhollow',
    'Dorcas Leech',
    // 30
    'Jone Feaster',
    'Roscoe Winford',
    'Ione Caputo',
    'Monnie Jacinto',
    'Morton Freels',
    'Reyes Achorn',
    'Quinton Mccormack',
    'Rosanne Amorim',
    'Glynda Mcfarland',
    'Rhea Lauzon',
    // 40
    'Maya Yarnall',
    'Jutta Hamilton',
    'Adrien Waites',
    'Lona Tuller',
    'Leia Giel',
    'Ted Shealey',
    'Angeline Montanez',
    'Wilmer Whitaker',
    'Davida Raker',
    'Cristina Chabolla',
    // 50
    'Kathleen Eliason',
    'Chuck Booze',
    'Elmo Saba',
    'Tomika Lehmann',
    'Marivel Ensley',
    'Willene Kimpel',
    'Donn Dimatteo',
    'Evelina Juneau',
    'Fernando Wojciechowski',
    'Mario Mortensen',
    // 60
    'Griselda Watkins',
    'Kymberly Mendel',
    'Donella Audia',
    'Wes Sweatt',
    'Tisha Styons',
    'Leif Tiedeman',
    'Art Biscoe',
    'Shona Meagher',
    'Rocky Bolding',
    'Tari Silvey',
    // 70
    'Marsha Mifflin',
    'Lois Buchta',
    'Wm Wiese',
    'Emely Trump',
    'Felicia Arora',
    'Suzy Tonkin',
    'Alvin Mendell',
    'Talisha Marotta',
    'Fredda Haefner',
    'Migdalia Hersey',
    // 80
    'Johanna Crisman',
    'Brent Muff',
    'Willette Sae',
    'Eldon Kuykendall',
    'Noella Beausoleil',
    'Laurence Starner',
    'Yu Maldanado',
    'Fermina Alcantar',
    'Flossie Viola',
    'Shirlene Lopinto',
    // 90
    'Isis Hixson',
    'Elana Whitenack',
    'Erica Lamprecht',
    'Elinore Otto',
    'Catrice Stutz',
    'Adelia Aycock',
    'Tosha Singleterry',
    'Pam Carman',
    'Pearle Ruston',
    'Danette Phillippi',
    // 100
    'Darcy Priester',
    'Terresa Estevez',
    'Daron Witherite',
    'Leatha Fiorini',
    'Summer Haff',
    'Jerrica Boyden',
    'Marine Rehberg',
    'Eliz Mischke',
    'Reagan Kupiec',
    'Lynsey Graff',
    // 110
    'Martin Clem',
    'Marva Mumm',
    'Shane Steele',
    'Violette Cantero',
    'Venita Mader',
    'Jutta Hagler',
    'Senaida Rumore',
    'Ivey Catalano',
    'Racquel Grimaldo',
    'Lavenia Dunkelberger',
    // 120
    'Myrtle Gentner',
    'Katy Hayhurst',
    'Kira Moritz',
    'Inga Bourassa',
    'Prudence Fluker',
    'Henrietta Reck',
    'Dorthy Mair',
    'Conrad Orrell',
    'Dorinda Yeates',
    'Clarinda Mccombs',
    // 130
    'Flora Ainsworth',
    'Treva Petri',
    'Yu Gaylor',
    'Hedwig Buth',
    'Wilford Madigan',
    'Lorenza Bibler',
    'Jonie Quigg',
    'Many Synder',
    'Ashton Gandy',
    'Brenna Vandermark',
    // 140
    'Cassidy Heuser',
    'Kelvin Troiano',
    'Jeana Aguinaldo',
    'Corina Tomko',
    'Youlanda Galaz',
    'Annelle Martinez',
    'Lovie Kania',
    'Hermelinda Lumb',
    'Debera Wanke',
    'Delfina Chancey',
    // 150
    'Katrice Treacy',
    'Caridad Hollie',
    'Elina Prosperie',
    'Vernia Heywood',
    'Chara Cutright',
    'Arnulfo Hitchman',
    'Edmundo Hobby',
    'Anisha Rutter',
    'Jenifer Hommel',
    'Brendon Latorre',
    // 160
    'Kristina Luciano',
    'Javier Earnest',
    'Lorie Whiten',
    'Susanna Planas',
    'Enoch Fitting',
    'Garnet Burrage',
    'Cristal Gallaway',
    'Lael Gallucci',
    'Zenobia Kroner',
    'Leonie Morais',
    // 170
    'Charline Chatmon',
    'Aracely Millington',
    'Onita Surace',
    'Ying Hallock',
    'Rebecca Bigler',
    'Jeanene Deer',
    'Dana Vanvliet',
    'Kimbra Tryon',
    'Leta Biddle',
    'Sharolyn Forbus',
    // 180
    'Myriam Laffin',
    'Ivette Veillon',
    'Delorse Altschuler',
    'Shayne Tillett',
    'Eula Bostwick',
    'Irina Oba',
    'Jesus Grieco',
    'Chelsea Bowes',
    'Jeanetta Hazel',
    // 190
    'Elaina Tinajero',
    'Shantel Rosario',
    'Arlena Cuddy',
    'Valorie Metz',
    'Yajaira Fausnaught',
    'Tammara Sines',
    'Linwood Kothari',
    'Jed Licari',
    'Leilani Marmon',
    'Jerrie Berthiaume',
    'Yolande Maul'
];

// --------------------------------------------------
// usage

names.forEach(function (name, index) {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    Ucavatar(canvas, name);
});
