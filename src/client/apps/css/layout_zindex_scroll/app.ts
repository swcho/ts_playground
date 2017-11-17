
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

const OpacityScroll = (() => {
    let s;

    return {
        settings() {
            return {
                windowHeight: window.innerHeight,
                halfWindowHeight: window.innerHeight / 2,
                windowWidth: window.innerWidth,
                documentHeight: document.body.scrollHeight
            };
        },

        init(page) {
            s = this.settings();
            this.bindEvents(page);
        },

        bindEvents(page) {
            if (s.windowWidth >= 864) {
                this.opacityScroll(page);
            }
        },

        opacityScroll(page) {
            const children = document.querySelectorAll(`${page} main`)[0].children;

            [].forEach.call(children, (child: HTMLElement, idx) => {
                child.style.left = '0';

                if (idx === 0) {
                    child.style.position = 'fixed';
                    child.style.top = '0';
                    child.style.zIndex = '0';
                } else {
                    child.style.position = 'absolute';
                    child.style.top = `${idx * 2}00vh`;
                    child.style.zIndex = idx;

                    let scrollOffset = child.getBoundingClientRect().top + document.body.scrollTop;
                    let opacityTrigger = s.windowHeight * idx - s.halfWindowHeight;

                    window.addEventListener('resize', () => {
                        scrollOffset = child.getBoundingClientRect().top + document.body.scrollTop;
                        s.windowHeight = window.innerHeight;
                        s.halfWindowHeight = s.windowHeight / 2;
                        s.documentHeight = document.body.scrollHeight;
                        opacityTrigger = s.windowHeight * idx - s.halfWindowHeight;
                    });

                    const opacityChange = () => {
                        // const scrollTop = document.documentElement.scrollTop;
                        const scrollTop = document.body.scrollTop;
                        const scrollHeight = document.body.scrollHeight;
                        const prev = child.previousElementSibling as HTMLElement;
                        const opacity = 1 - (scrollTop - opacityTrigger) / scrollTop * idx * 2;

                        console.log('opacityChange', scrollTop, opacityTrigger, scrollHeight);
                        if (scrollTop >= opacityTrigger) {
                            prev.style.opacity = `${opacity > 0 ? opacity : 0}`;
                        } else {
                            prev.style.opacity = '1';
                        }

                        if (scrollTop >= scrollOffset && scrollTop + s.windowHeight !== s.documentHeight) {
                            child.style.position = 'fixed';
                            child.style.top = '0';
                        } else {
                            child.style.position = 'absolute';
                            child.style.top = `${idx}00vh`;
                            child.style.left = '0';
                            child.style.zIndex = idx;
                        }
                    };

                    window.addEventListener('scroll', opacityChange);
                    window.addEventListener('resize', opacityChange);

                }
            });
        }
    };
})();

OpacityScroll.init('html');
