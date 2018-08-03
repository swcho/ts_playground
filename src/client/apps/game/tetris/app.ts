
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

import $ = require('jquery');

/*
 *
 *  KeyBoard Task
 *
 */

class KeyBoard {

    private qt = [];
    private down_sw = false;

    setup() {
        window.focus();
        this.qt = [];
        this.down_sw = false;
        $(document).bind('keydown', this.keydown.bind(this));
        $(document).bind('keyup', function () { window.focus(); this.down_sw = false; }.bind(this));
    }

    add(p) {
        let evet = Tetris.extend({ object: null, id: null, post: null }, p || {});
        this.qt.push(evet);
    }

    remove(p) {
        for (let i = 0; i < this.qt.length; i++) {
            if (this.qt[i].object === p) {
                this.qt.splice(i, 1);
                break;
            }
        }
    }

    keydown(e) {
        if (this.down_sw) return;
        window.focus();
        switch (e.keyCode) {
            case Tetris.key_code.UP: this.post('UP'); return false;
            case Tetris.key_code.DOWN: this.post('DOWN'); return false;
            case Tetris.key_code.RIGTH: this.post('RIGTH'); return false;
            case Tetris.key_code.LEFT: this.post('LEFT'); return false;
            case Tetris.key_code.SPACE: this.post('UP'); return false;
        }
    }

    post(i) {
        let id = i;
        this.qt.forEach(function (e, i, a) { if (e.id === id) e.post(); });
    }
}

/*
 *
 *  Timer Task
 *
 */
class Timer {

    private qt = [];
    private timer = setInterval(this.onLoop.bind(this), 33);

    setup() {
        this.qt = [];
        this.timer = setInterval(this.onLoop.bind(this), 33);
    }

    add(p) {
        let evet = Tetris.extend({ object: null, post: null }, p || {});
        this.qt.push(evet);
    }

    remove(p) {
        for (let i = 0; i < this.qt.length; i++) {
            if (this.qt[i].object === p) {
                this.qt.splice(i, 1);
                break;
            }
        }
    }

    onLoop() {
        this.qt.forEach(function (e, i, a) { e.post(); });
    }
};

/*
 *
 *  Score Task
 *
 */

class Score {

    private qt;
    private score;
    private current_dom;
    private lock;

    setup() {
        this.qt = [];
        this.score = 0;
        this.current_dom = $('<p>').text('00000').css({
            position: 'absolute',
            top: '-30px',
            width: '60px',
            height: '20px',
            paddingLeft: '10px',
            backgroundColor: 'white'
        }).appendTo('#Score');
        this.lock = false;
    }

    add() {
        this.score += 10;
        let data = '00000' + String(this.score);
        let pos = data.length - 5;
        data = data.substring(pos);
        let dom = $('<p>').text(data).css({
            position: 'absolute',
            top: '-15px',
            width: '60px',
            height: '20px',
            paddingLeft: '10px',
            backgroundColor: 'white'
        });
        this.qt.push(dom);
        this.score_up();
    }

    score_up() {
        if (this.qt.length !== 0 && !this.lock) {
            this.lock = true;
            let dom = this.qt.shift();
            $(dom).appendTo('#Score');
            $(dom).animate(
                { top: -30 },
                {
                    duration: 1000,
                    complete: function () {
                        this.lock = false;
                        $(this.current_dom).remove();
                        this.current_dom = dom;
                        if (this.qt.length !== 0) this.score_up();
                    }.bind(this)
                }
            );
        }
    }
}

/*
 *
 *  Tetris Control
 *
 */

class Control {

    private lock: boolean;

    setup() {
        Tetris.Timer.setup();
        Tetris.KeyBoard.setup();
        const elMain = document.getElementById('Main-scrren') as HTMLCanvasElement;
        const elNext = document.getElementById('Sub-scrren') as HTMLCanvasElement;
        Tetris.Tetris_currnet_canvas = elMain.getContext('2d');
        Tetris.Tetris_next_canvas = elNext.getContext('2d');
        Tetris.Tetris_currnet_size = get_size(elMain);
        Tetris.Tetris_next_size = get_size(elNext);
        Tetris.KeyBoard.add({ object: this, id: 'DOWN', post: this.keydown.bind(this) });
        Tetris.KeyBoard.add({ object: this, id: 'RIGTH', post: this.keyrigth.bind(this) });
        Tetris.KeyBoard.add({ object: this, id: 'LEFT', post: this.keyleft.bind(this) });
        Tetris.KeyBoard.add({ object: this, id: 'SPACE', post: this.keyspace.bind(this) });
        Tetris.KeyBoard.add({ object: this, id: 'UP', post: this.keyspace.bind(this) });
        this.lock = true;
        function get_size(el: HTMLCanvasElement) {
            let w = el.width;
            let h = el.height;
            return { w: w, h: h };
        }
    }

    game_over;
    now_time;
    level_time;
    level_cnt;
    current_piece;
    next_piece;
    game_start() {
        this.init_screen();
        this.screen_clear();
        this.lock = false;
        this.game_over = false;
        this.now_time = new Date().getTime();
        Tetris.Timer.remove(this);
        Tetris.Timer.add({ object: this, post: this.onLoop.bind(this) });
        Tetris.Score.setup();
        this.level_time = Tetris.level_time;
        this.level_cnt = Tetris.level_cnt;
        let current = this.random(), next = this.random();
        this.current_piece = new Piece(Tetris.piece_type[current], Tetris.piece_color[current], current);
        this.next_piece = new Piece(Tetris.piece_type[next], Tetris.piece_color[next], next);
        let y = 0;
        let x = Math.floor(Tetris.WIDHT / 2 - this.current_piece.get_size().width / 2);
        this.current_piece.set_position(x, y);
        this.onLoop();
    }

    init_screen() {
        let i, j;
        Tetris.Tetris_piece = [];
        for (i = 0; i < Tetris.HEIGHT; i++) {
            Tetris.Tetris_piece[i] = [];
            for (j = 0; j < Tetris.WIDHT; j++) {
                Tetris.Tetris_piece[i][j] = -1;
            }
        }
    }

    screen_clear() {
        Tetris.Tetris_currnet_canvas.clearRect(0, 0, Tetris.Tetris_currnet_size.w, Tetris.Tetris_currnet_size.h);
        Tetris.Tetris_next_canvas.clearRect(0, 0, Tetris.Tetris_next_size.w, Tetris.Tetris_next_size.h);
    }

    onLoop() {
        let now = new Date().getTime();
        if (now - this.now_time < this.level_time) return;
        this.now_time = now;
        this.draw();
        if (this.lock) return;
        if (this.current_piece.check_down()) this.set_next();
        this.line_check();
    }

    keydown() {
        if (this.lock) return;
        this.down_key();
    }

    keyrigth() {
        if (this.lock) return;
        if (this.current_piece.rigth()) this.draw();
    }

    keyleft() {
        if (this.lock) return;
        if (this.current_piece.left()) this.draw();
    }

    keyspace() {
        if (this.lock) return;
        if (this.current_piece.rotation()) this.draw();
    }

    private down_sw;
    down_key() {
        this.down_sw = true;
        this.lock = true;
        let timer_id = {};
        let key_down = {
            object: timer_id, post: function () {
                if (this.current_piece.down_piece()) {
                    this.draw();
                    this.lock = false;
                    Tetris.Timer.remove(timer_id);
                    return;
                }
                this.draw();
            }.bind(this)
        };
        Tetris.Timer.add(key_down);
    }

    set_next() {
        this.current_piece.set_piece();
        let next = this.random();
        this.current_piece = this.next_piece;
        this.next_piece = new Piece(Tetris.piece_type[next], Tetris.piece_color[next], next);
        let y = 0;
        let x = Math.floor(Tetris.WIDHT / 2 - this.next_piece.get_size().width / 2);
        this.current_piece.set_position(x, y);
        this.draw();
        if (this.game_over) this.gameOver();
    }

    line_check() {
        let i;
        for (i = Tetris.HEIGHT - 1; i > 0; i--) {
            if (this.check_block(i)) {
                this.line_light(i, function () {
                    Tetris.Score.add();
                    this.timer_down();
                    this.line_clear(i);
                    this.draw();
                    this.block_down(i);
                }.bind(this));
                return;
            }
        }
    }

    timer_down() {
        if (this.level_cnt - 1 < 0) {
            this.level_cnt = Tetris.level_cnt;
            if (this.level_time - 100 > 100) {
                this.level_time -= 200;
            }
        } else this.level_cnt--;
    }

    line_light(i, p) {
        let line = i, post = p;
        let timer_id = {};
        let index = 0;
        this.lock = true;
        let ligth_timer = {
            object: timer_id, post: function () {
                if (index + 1 === Tetris.WIDHT) {
                    Tetris.Timer.remove(timer_id);
                    this.lock = false;
                    post();
                    return;
                }
                Tetris.Tetris_piece[line][index++] = -1;
                this.draw();
            }.bind(this)
        };
        Tetris.Timer.add(ligth_timer);
    }

    line_clear(line) {
        let i;
        for (i = 0; i < Tetris.WIDHT; i++) {
            Tetris.Tetris_piece[line][i] = -1;
        }
    }

    block_down(n) {
        let line = n, timer, i, end_block = false;
        let timer_id = {};
        let now_time = new Date().getTime();
        let block_down = {
            object: timer_id, post: function () {
                let now = new Date().getTime();
                if (now - now_time < 30) return;
                now_time = now;
                let down_line = line - 1;
                if (this.check_off_block(down_line)) end_block = true;
                for (i = 0; i < Tetris.WIDHT; i++) {
                    Tetris.Tetris_piece[line][i] = Tetris.Tetris_piece[down_line][i];
                }
                this.line_clear(down_line);
                if (end_block) {
                    Tetris.Timer.remove(timer_id);
                    this.lock = false;
                    this.line_check();
                    return;
                }
                line--;
                this.draw();
            }.bind(this)
        };
        Tetris.Timer.add(block_down);
        this.lock = true;
    }

    check_block(line) {
        let i;
        for (i = 0; i < Tetris.WIDHT; i++) {
            if (Tetris.Tetris_piece[line][i] === -1) return false;
        }
        return true;
    }

    check_off_block(line) {
        let i;
        for (i = 0; i < Tetris.WIDHT; i++) {
            if (Tetris.Tetris_piece[line][i] !== -1) return false;
        }
        return true;
    }

    gameOver() {
        this.lock = true;
        $('#Game_over').fadeIn('slow');
        $('#play').fadeIn('slow');

    }

    random() {
        let no = Math.floor(Math.random() * 10);
        return no % Tetris.piece_type.length;
    }

    draw() {
        this.screen_clear();
        this.current_piece.current_draw();
        this.next_piece.next_draw();
        let y, x;
        for (y = 0; y < Tetris.HEIGHT; y++) {
            for (x = 0; x < Tetris.WIDHT; x++) {
                let index = Tetris.Tetris_piece[y][x];
                if (index !== -1) {
                    let color = Tetris.piece_color[index];
                    this.current_draw(x, y, color);
                }
            }
        }
    }

    current_draw(x, y, c) {
        let current_x = x * Tetris.BLOCK_SIZE;
        let current_y = y * Tetris.BLOCK_SIZE;
        Tetris.Tetris_currnet_canvas.fillStyle = c;
        Tetris.Tetris_currnet_canvas.fillRect(current_x, current_y, Tetris.BLOCK_SIZE, Tetris.BLOCK_SIZE);
    }

    next_draw(x, y, c) {
        Tetris.Tetris_next_canvas.fillStyle = c;
        Tetris.Tetris_next_canvas.fillRect(x, y, Tetris.BLOCK_SIZE, Tetris.BLOCK_SIZE);
    }
};

let Tetris = {
    WIDHT: 15,
    HEIGHT: 30,
    NEXT_WIDHT: 5,
    NEXT_HEIGHT: 5,
    BLOCK_SIZE: 10,
    piece_type: [
        [
            [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }]     // O
        ],
        [
            [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }],
            [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }]     // I

        ],
        [
            [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }],    // Z
            [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }]
        ],
        [
            [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],    // L
            [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
            [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
            [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 0 }, { x: 2, y: 1 }]
        ],
        [
            [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],    // T
            [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 2 }],
            [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }],
            [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }]
        ]
    ],
    next_piece: [
        [{ x: 15, y: 15 }, { x: 25, y: 15 }, { x: 15, y: 25 }, { x: 25, y: 25 }],    // O
        [{ x: 20, y: 5 }, { x: 20, y: 15 }, { x: 20, y: 25 }, { x: 20, y: 35 }],    // I
        [{ x: 25, y: 10 }, { x: 15, y: 20 }, { x: 25, y: 20 }, { x: 15, y: 30 }],    // Z
        [{ x: 15, y: 10 }, { x: 15, y: 20 }, { x: 15, y: 30 }, { x: 25, y: 30 }],    // L
        [{ x: 20, y: 15 }, { x: 10, y: 25 }, { x: 20, y: 25 }, { x: 30, y: 25 }]     // T
    ],
    lock: false,
    stop: false,
    piece_color: ['#0000FF', '#FF0000', '#00FF00', '#FFFF00', '#808080'],
    Tetris_piece: null,
    Tetris_currnet_canvas: null,
    Tetris_next_canvas: null,
    Tetris_currnet_size: null,
    Tetris_next_size: null,
    ready_sw: false,
    level_time: 800,
    level_cnt: 5,
    key_code: {
        UP: 38, DOWN: 40, LEFT: 37, RIGTH: 39, BACKSPACE: 8,
        ESC: 27, ENTER: 13, DELETE: 46, TAB: 9, DOUBLE: 50,
        SINGULE: 55, SPACE: 32
    },
    defineClass: function (constructor, methos, statics) {
        if (methos) this.extend(constructor.prototype, methos);
        if (statics) this.extend(constructor, statics);
        return constructor;
    },
    extend: function (o, p) {
        for (const prop in p) o[prop] = p[prop];
        return o;
    },
    log: function (msg) {
        if (!msg) return;
        if (window.console && window.console.log) {
            window.console.log(msg);
        }
    },
    Timer: new Timer(),
    KeyBoard: new KeyBoard(),
    Score: new Score(),
    Control: new Control(),
};

/*
 *
 *  Tetris Piece Class
 *
 */
class Piece {
    private type;
    private color;
    private no;
    private next;
    private index;
    private position;

    constructor(type, color, n) {
        this.type = type;
        this.color = color;
        this.no = n;
        this.next = Tetris.next_piece[this.no];
        this.index = 0;
        this.position = { x: 0, y: 0 };
    }

    set_position (x, y) {
        this.position.x = x;
        this.position.y = y;
        if (this.end_down()) Tetris.Control.game_over = true;
    }

    check_down() {
        if (this.end_down()) return true;
        this.position.y++;
        return false;
    }

    end_down() {
        let pos = this.get_position(), i;
        let check = false;
        for (i = 0; i < pos.length; i++) {
            if (pos[i].y + 1 >= Tetris.HEIGHT) return true;
            if (Tetris.Tetris_piece[pos[i].y + 1][pos[i].x] !== -1) return true;
        }
        return false;
    }

    set_piece() {
        let pos = this.get_position();
        let no = this.no;
        pos.forEach(function (e, i, a) {
            Tetris.Tetris_piece[e.y][e.x] = no;
        });
    }

    down_piece() {
        let i;
        for (i = 0; i < 3; i++) {
            if (this.check_down()) {
                return true;
            }
        }
        return false;
    }

    current_draw() {
        let pos = this.get_position();
        let color = this.color;
        pos.forEach(
            function (e, i, a) {
                Tetris.Control.current_draw(e.x, e.y, color);
            }
        );
    }

    next_draw() {
        let color = this.color;
        this.next.forEach(
            function (e, i, a) {
                Tetris.Control.next_draw(e.x, e.y, color);
            }
        );
    }

    get_position() {
        let pos = [];
        let position = this.position;
        this.type[this.index].forEach(
            function (e, i, a) {
                pos.push({ x: e.x + position.x, y: e.y + position.y });
            }
        );
        return pos;
    }

    get_size() {
        let size = this.get_rect();
        return { width: size.rigth.x + 1, height: size.bottom.y + 1 };
    }

    get_rect() {
        let left = { x: 0, y: 0 }, rigth = { x: 0, y: 0 }, top = { x: 0, y: 0 }, bottom = { x: 0, y: 0 };
        this.type[this.index].forEach(
            function (e, i, a) {
                if (e.x < left.x) Tetris.extend(left, e);
                if (e.x > rigth.x) Tetris.extend(rigth, e);
                if (e.y > bottom.y) Tetris.extend(bottom, e);
            }
        );
        return { left: left, rigth: rigth, top: top, bottom: bottom };
    }

    left() {
        let pos = this.get_position(), i;
        for (i = 0; i < pos.length; i++) {
            if (pos[i].x - 1 < 0) {
                return false;
            }
            if (Tetris.Tetris_piece[pos[i].y][pos[i].x - 1] !== -1) {
                return false;
            }
        }
        this.position.x--;
        return true;
    }

    rigth() {
        let pos = this.get_position(), i;
        for (i = 0; i < pos.length; i++) {
            if (pos[i].x + 2 > Tetris.WIDHT) {
                return false;
            }
            if (Tetris.Tetris_piece[pos[i].y][pos[i].x + 1] !== -1) {
                return false;
            }
        }
        this.position.x++;
        return true;
    }

    rotation() {
        let save_index = this.index, i, check_out = false;
        this.index = (this.index + 1) % this.type.length;
        let pos = this.get_position();
        for (i = 0; i < pos.length; i++) {
            if (pos[i].x < 0) {
                check_out = true;
                break;
            }
            if (Tetris.Tetris_piece[pos[i].y][pos[i].x] !== -1) {
                check_out = true;
                break;
            }
            if (pos[i].x + 1 > Tetris.WIDHT) {
                check_out = true;
                break;
            }
            if (Tetris.Tetris_piece[pos[i].y][pos[i].x] !== -1) {
                check_out = true;
                break;
            }
            if (pos[i].y >= Tetris.HEIGHT) {
                check_out = true;
                break;
            }
            if (Tetris.Tetris_piece[pos[i].y][pos[i].x] !== -1) {
                check_out = true;
                break;
            }
        }
        if (check_out) {
            this.index = save_index;
            return false;
        }
        return true;
    }
}


/*
 *
 *  Game Over
 *
 */

function GameOvaer() {
    const elGameOver = document.getElementById('Game_over') as HTMLCanvasElement;
    let Context = elGameOver.getContext('2d');
    $(elGameOver).hide();
    Context.font = 'normal bold 23px fantasy';
    Context.fillStyle = 'red';
    Context.textBaseline = 'top';
    Context.shadowColor = '#A0A0A0';
    Context.shadowOffsetX = 5;
    Context.shadowOffsetY = 5;
    Context.shadowBlur = 5;
    Context.fillText('Game Over', 0, 0);
};

/*
 *
 *  ON Load
 *
 */
$(function () {
    Tetris.Control.setup();
    GameOvaer();
    $('#play').click(
        function () {
            $(this).fadeOut('slow');
            $('#Game_over').fadeOut('slow');
            Tetris.Control.game_start();
        }
    );
});
