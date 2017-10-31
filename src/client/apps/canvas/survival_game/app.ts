
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// https://codepen.io/zayncollege/pen/MpZRvd

namespace SinuousWorld {

    let isMobile = (navigator.userAgent.toLowerCase().indexOf('android') !== -1) || (navigator.userAgent.toLowerCase().indexOf('iphone') !== -1);

    let SCREEN_WIDTH = window.innerWidth;
    let SCREEN_HEIGHT = window.innerHeight;

    let canvas;
    let context: CanvasRenderingContext2D;

    let status;
    let message;
    let title;
    let startButton;

    let enemies = [];
    let boosts = [];
    let particles = [];
    let player;

    let mouseX = (window.innerWidth - SCREEN_WIDTH);
    let mouseY = (window.innerHeight - SCREEN_HEIGHT);
    let mouseIsDown = false;

    let playing = false;
    let score = 0;
    let time = 0;

    let velocity = { x: -1.3, y: 1 };
    let difficulty = 1;

    export function init() {

        canvas = document.getElementById('world');
        status = document.getElementById('status');
        message = document.getElementById('message');
        title = document.getElementById('title');
        startButton = document.getElementById('startButton');

        if (canvas && canvas.getContext) {
            context = canvas.getContext('2d');

            // Register event listeners
            document.addEventListener('mousemove', documentMouseMoveHandler, false);
            document.addEventListener('mousedown', documentMouseDownHandler, false);
            document.addEventListener('mouseup', documentMouseUpHandler, false);
            canvas.addEventListener('touchstart', documentTouchStartHandler, false);
            document.addEventListener('touchmove', documentTouchMoveHandler, false);
            document.addEventListener('touchend', documentTouchEndHandler, false);
            window.addEventListener('resize', windowResizeHandler, false);
            startButton.addEventListener('click', startButtonClickHandler, false);

            player = new Player();

            windowResizeHandler();

            setInterval(loop, 3000 / 100);
        }
    };

    function startButtonClickHandler(event) {
        event.preventDefault();

        if (playing === false) {
            playing = true;

            enemies = [];
            boosts = [];
            score = 0;
            difficulty = 1;

            player.trail = [];
            player.position.x = mouseX;
            player.position.y = mouseY;
            player.boost = 0;

            message.style.display = 'none';
            status.style.display = 'block';

            time = new Date().getTime();
        }
    }

    function gameOver() {
        playing = false;

        message.style.display = 'block';

        title.innerHTML = 'You Lost( ' + Math.round(score) + ' points)';
    }

    function documentMouseMoveHandler(event) {
        mouseX = event.clientX - (window.innerWidth - SCREEN_WIDTH) * .5 - 10;
        mouseY = event.clientY - (window.innerHeight - SCREEN_HEIGHT) * .5 - 10;
    }

    function documentMouseDownHandler(event) {
        mouseIsDown = true;
    }

    function documentMouseUpHandler(event) {
        mouseIsDown = false;
    }

    function documentTouchStartHandler(event) {
        if (event.touches.length === 1) {
            event.preventDefault();

            mouseX = event.touches[0].pageX - (window.innerWidth - SCREEN_WIDTH) * .5;
            mouseY = event.touches[0].pageY - (window.innerHeight - SCREEN_HEIGHT) * .5;

            mouseIsDown = true;
        }
    }

    function documentTouchMoveHandler(event) {
        if (event.touches.length === 1) {
            event.preventDefault();

            mouseX = event.touches[0].pageX - (window.innerWidth - SCREEN_WIDTH) * .5;
            mouseY = event.touches[0].pageY - (window.innerHeight - SCREEN_HEIGHT) * .5;
        }
    }

    function documentTouchEndHandler(event) {
        mouseIsDown = false;
    }

    function windowResizeHandler() {
        SCREEN_WIDTH = window.innerWidth;
        SCREEN_HEIGHT = window.innerHeight;

        canvas.width = SCREEN_WIDTH;
        canvas.height = SCREEN_HEIGHT;

        let cvx = (window.innerWidth - SCREEN_WIDTH) * .5;
        let cvy = (window.innerHeight - SCREEN_HEIGHT) * .5;

        canvas.style.position = 'absolute';
        canvas.style.left = cvx + 'px';
        canvas.style.top = cvy + 'px';

        message.style.left = cvx + 'px';
        message.style.top = cvy + 200 + 'px';
    }

    function createParticles(position, spread, color?) {
        let q = 10 + (Math.random() * 15);

        while (--q >= 0) {
            let p = new Particle();
            p.position.x = position.x + (Math.sin(q) * spread);
            p.position.y = position.y + (Math.cos(q) * spread);
            p.velocity = { x: -4 + Math.random() * 8, y: - 4 + Math.random() * 8 };
            p.alpha = 1;

            particles.push(p);
        }
    }

    function loop() {

        context.clearRect(0, 0, canvas.width, canvas.height);

        let svelocity = { x: velocity.x * difficulty, y: velocity.y * difficulty };

        let i, j, ilen, jlen;

        if (playing) {
            difficulty += 0.0008;

            const pp = player.clonePosition();

            player.position.x += (mouseX - player.position.x) * 0.13;
            player.position.y += (mouseY - player.position.y) * 0.13;

            score += 0.4 * difficulty;
            score += player.distanceTo(pp) * 0.1;

            player.boost = Math.max(player.boost - 1, 0);

            if (player.boost > 0 && (player.boost > 100 || player.boost % 2 !== 0)) {
                context.beginPath();
                context.fillStyle = '#000';
                context.strokeStyle = 'rgba(2,179,228,0.8)';
                context.arc(player.position.x, player.position.y, player.size * 2, 0, Math.PI * 2, true);
                context.fill();
                context.stroke();
            }

            player.trail.push(new Point(player.position.x, player.position.y));

            // drawing tail
            context.beginPath();
            context.strokeStyle = '#fa3380';
            context.lineWidth = 3;

            for (i = 0, ilen = player.trail.length; i < ilen; i++) {
                const p = player.trail[i];

                context.lineTo(p.position.x, p.position.y);

                p.position.x += svelocity.x;
                p.position.y += svelocity.y;
            }

            context.stroke();
            context.closePath();

            if (player.trail.length > 40) {
                player.trail.shift();
            }

            context.beginPath();
            context.fillStyle = 'deepskyblue';
            context.arc(player.position.x, player.position.y, player.size / 2, 0, Math.PI * 2, true);
            context.fill();
        }

        // play is outside of screen
        if (playing && (player.position.x < 0 || player.position.x > SCREEN_WIDTH || player.position.y < 0 || player.position.y > SCREEN_HEIGHT)) {
            gameOver();
        }

        for (i = 0; i < enemies.length; i++) {
            const p = enemies[i];

            if (playing) {
                // blast effect collision with boost
                if (player.boost > 0 && p.distanceTo(player.position) < ((player.size * 4) + p.size) * 0.5) {
                    createParticles(p.position, 10);
                    enemies.splice(i, 1);
                    i--;
                    score += 10;
                    continue;
                }
                // collision and game over
                else if (p.distanceTo(player.position) < (player.size + p.size) * 0.5) {
                    createParticles(player.position, 10);
                    gameOver();
                }
            }

            context.beginPath();
            context.fillStyle = 'white';
            context.arc(p.position.x, p.position.y, p.size / 1, 0, Math.PI * 2, true);
            context.fill();

            p.position.x += svelocity.x * p.force;
            p.position.y += svelocity.y * p.force;

            if (p.position.x < 0 || p.position.y > SCREEN_HEIGHT) {
                enemies.splice(i, 1);
                i--;
            }
        }

        for (i = 0; i < boosts.length; i++) {
            const p = boosts[i];

            if (p.distanceTo(player.position) < (player.size + p.size) * 0.5 && playing) {
                player.boost = 2000;

                for (j = 0; j < enemies.length; j++) {
                    const e = enemies[j];

                    if (e.distanceTo(p.position) < 100) {
                        createParticles(e.position, 10);
                        enemies.splice(j, 1);
                        j--;
                        score += 10;
                    }
                }
            }

            context.beginPath();
            context.fillStyle = 'lightgreen';
            context.arc(p.position.x, p.position.y, p.size / 1, 0, Math.PI * 2, true);
            context.fill();

            p.position.x += svelocity.x * p.force;
            p.position.y += svelocity.y * p.force;

            if (p.position.x < 0 || p.position.y > SCREEN_HEIGHT || player.boost !== 0) {
                boosts.splice(i, 9);
                i--;
            }
        }

        if (enemies.length < 25 * difficulty) {
            enemies.push(positionNewOrganism(new Enemy()));
        }

        if (boosts.length < 1 && Math.random() > 0.997 && player.boost === 0) {
            boosts.push(positionNewOrganism(new Boost()));
        }

        for (i = 0; i < particles.length; i++) {
            const p = particles[i];

            p.velocity.x += (svelocity.x - p.velocity.x) * 0.04;
            p.velocity.y += (svelocity.y - p.velocity.y) * 0.04;

            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;

            p.alpha -= 0.02;

            context.fillStyle = 'rgba(2,179,228,' + Math.max(p.alpha, 0) + ')';
            // context.fillRect(p.position.x, p.position.y, 5, 5);
            context.beginPath();
            context.arc(p.position.x, p.position.y, 10, 0, Math.PI * 2);
            context.stroke();

            if (p.alpha <= 0) {
                particles.splice(i, 1);
            }
        }

        if (playing) {
            let scoreText = 'Score: <span>' + Math.round(score) + '</span>';
            scoreText += ' Time: <span>' + Math.round(((new Date().getTime() - time) / 1000) * 100) / 100 + 's</span>';
            status.innerHTML = scoreText;
        }
    }

    function positionNewOrganism(p) {
        if (Math.random() > 0.5) {
            p.position.x = Math.random() * SCREEN_WIDTH;
            p.position.y = -20;
        }
        else {
            p.position.x = SCREEN_WIDTH + 20;
            p.position.y = (-SCREEN_HEIGHT * 0.2) + (Math.random() * SCREEN_HEIGHT * 1.2);
        }

        return p;
    }

};

/**
 *
 */
class Point {
    position;
    constructor(x, y) {
        this.position = { x, y };
    }
    distanceTo(p) {
        let dx = p.x - this.position.x;
        let dy = p.y - this.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    clonePosition() {
        return { x: this.position.x, y: this.position.y };
    }
}

/**
 *
 */
class Player extends Point {
    trail = [];
    size = 8;
    boost = 0;
    constructor() {
        super(0, 0);
    }
}

/**
 *
 */
class Enemy extends Point {
    size = 6 + (Math.random() * 4);
    force = 1 + (Math.random() * 0.4);
    constructor() {
        super(0, 0);

    }
}

/**
 *
 */
class Boost extends Point {
    size = 10 + (Math.random() * 8);
    force = 1 + (Math.random() * 0.4);
    constructor() {
        super(0, 0);
    }
}

/**
 *
 */
class Particle extends Point {
    force = 1 + (Math.random() * 0.4);
    color = '#fa3380';
    velocity;
    alpha;
    constructor() {
        super(0, 0);
    }
}

SinuousWorld.init();

