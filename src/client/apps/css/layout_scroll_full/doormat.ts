/*!
  * doormat - http://jh3y.github.io/doormat
  *
  * @license MIT
  * @author jh3y
  * (c) 2017
!*/
/**
  * Represent Doormat instance
  * @constructor
  * @param {Object} opts - user defined options for Doormat instance
*/
declare global {
    interface Element {
        doormatBoundary: number;
        doormatActiveTop: string;
        doormatIndex: number;
        startScrollPos: number;
        offsetHeight: number;
    }
}
enum SnapMode {
    inbound = 'inbound',
    outbound = 'outbound',
    travel = 'travel',
    viewport = 'viewport',
    bottom = 'bottom',
    top = 'top',
    up = 'up',
    down = 'down',
    updateEvent = 'doormat =update',
}
export interface Options {
    snapMode: SnapMode;
    mode: SnapMode;
    snapDebounce: number;
    snapThreshold: number;
    scrollDuration: number;
}
export class Doormat {
    // class enums for no class mis-match
    classes = {
        active: 'dm-panel--active',
        el: 'dm',
        inbound: 'dm--inbound',
        obsolete: 'dm-panel--obsolete',
    };
    // Set default options for doormat
    defaults: Object = {
        snapDebounce: 150,
        scrollDuration: 250,
        snapMode: SnapMode.viewport,
        mode: SnapMode.outbound,
        snapThreshold: 30,
    };
    errors = {
        invalidMode: 'Doormat: mode must be either "inbound" or "outbound"',
        invalidSnap:
            'Doormat: snapMode must be set to either "viewport" or "travel"',
    };
    // Scroll position reference
    scrollPos: number = 0;
    // Main element
    el: HTMLElement = document.querySelector(
        `.${this.classes.el}`,
    );
    // Content panels
    panels: HTMLCollection = this.el.children;
    // Reference for update state for scroll performance
    updating = false;
    // Define the active panel
    active: HTMLDivElement = this.panels[0] as HTMLDivElement;
    cumulativeHeight: number;
    options: Options;
    scrollDir: String;
    activeIndex: number = 1;

    constructor(opts?: Partial<Options>) {
        const { bind, calibrate, classes, active, defaults, errors } = this;
        this.options = Object.assign({}, defaults, opts) as any;
        /**
          * Set appropriate classes for first panel and doormat element.
        */
        if (
            !(
                this.options.snapMode === SnapMode.travel ||
                this.options.snapMode === SnapMode.viewport
            )
        )
            throw Error(errors.invalidSnap);

        if (
            !(
                this.options.mode === SnapMode.inbound ||
                this.options.mode === SnapMode.outbound
            )
        )
            throw Error(errors.invalidMode);
        active.classList.add(classes.active);
        if (this.options.mode === SnapMode.inbound)
            this.el.classList.add(classes.inbound);
        calibrate();
        bind();
    }
    /**
      * Request updating the DOM. If actively in an update cycle, then do
      * nothing
      * @return {undefined}
      * @param {function} action - action to be invoked during next frame
    */
    requestUpdate = (action: (frame: number) => void) => {
        if (!this.updating) {
            requestAnimationFrame(action);
            this.updating = true;
        }
    }
    /**
      * Bind event listeners for scrolling and viewport resize or orientation
      * change
      * @return {undefined}
    */
    bind = () => {
        const onViewportChange = () => this.requestUpdate(this.calibrate);
        if ('onorientationchange' in window)
            window.onorientationchange = onViewportChange;
        else window.onresize = onViewportChange;
        window.onscroll = this.onScroll;
    }
    /**
      * on scroll update the scroll position reference and request to update
      * the DOM
      * @return {undefined}
    */
    onScroll = () => {
        const { scrollPos } = this;
        const newPosition = window.scrollY || window.pageYOffset;
        this.scrollDir = scrollPos < newPosition ? SnapMode.down : SnapMode.up;
        this.scrollPos = newPosition;
        this.requestUpdate(this.handleScroll);
    }
    /**
      * Handle scrolling behavior setting classes appropriately based on scroll
      * position.
      * @return {undefined}
    */
    private __TIMER;
    handleScroll = () => {
        const {
            classes,
            active,
            el,
            handleSnap,
            inSnapRegion,
            options,
            scrollPos,
        } = this;

        const { snapMode, snapDebounce } = options;
        const activeIndex = active.doormatIndex;
        const next = active.nextElementSibling as HTMLElement;
        const prev = active.previousElementSibling as HTMLElement;
        const isInbound = options.mode === SnapMode.inbound;

        const boundaries = {
            up: isInbound
                ? next && scrollPos >= next.offsetTop
                : next && scrollPos >= active.offsetTop + active.offsetHeight,
            down: isInbound
                ? prev && scrollPos < prev.doormatBoundary
                : prev && scrollPos < active.offsetTop,
        };

        /**
          * Update scroll position reference and determine scroll direction
        */
        if (boundaries.up) {
            active.classList.remove(classes.active);
            active.classList.add(classes.obsolete);
            next.classList.add(classes.active);
            next.style.top = isInbound ? '0' : next.doormatActiveTop;
            this.active = next as HTMLDivElement;
        } else if (boundaries.down) {
            active.classList.remove(classes.active);
            active.style.top = isInbound ? active.doormatActiveTop : '0';
            prev.classList.remove(classes.obsolete);
            prev.classList.add(classes.active);
            this.active = prev as HTMLDivElement;
        }
        if (activeIndex !== this.active.doormatIndex) {
            const update = new Event(SnapMode.updateEvent, {
                bubbles: true,
            });
            this.activeIndex = this.active.doormatIndex;
            el.dispatchEvent(update);
        }
        this.updating = false;

        /**
          * handle snap behavior
        */
        if (snapMode) {
            const snapRegion = inSnapRegion();
            clearTimeout(this.__TIMER);
            if (snapRegion) {
                this.__TIMER = setTimeout(() => {
                    handleSnap(snapRegion);
                }, snapDebounce);
            }
        }
    }
    /**
      * Determine whether active scroll position is within snap region
      * @return {String} region - Returns an enumeration of which region to snap
      * in/from
    */
    inSnapRegion = () => {
        const { active, options, scrollPos, scrollDir } = this;
        const { snapMode, snapThreshold } = options;
        /**
          * Determine whether active position is within the top threshold.
          * Threshold defined as percentage of viewport.
        */
        const { startScrollPos, offsetHeight } = active;

        const thresholdSize = window.innerHeight * (snapThreshold / 100);

        let withinBottom, withinTop;

        const bottomBoundary = startScrollPos + offsetHeight;
        const bottomBuffer = bottomBoundary - thresholdSize;
        const topBuffer = startScrollPos + thresholdSize;

        if (snapMode === SnapMode.viewport) {
            withinBottom = scrollPos > bottomBuffer && scrollPos < bottomBoundary;
            withinTop = scrollPos > startScrollPos && scrollPos < topBuffer;
        } else if (snapMode === SnapMode.travel) {
            withinBottom = scrollPos > topBuffer && scrollDir === SnapMode.down;
            withinTop = scrollDir === SnapMode.up && scrollPos < bottomBuffer;
        }

        if (withinBottom || withinTop)
            return withinBottom ? SnapMode.bottom : SnapMode.top;
    }
    /**
      * An internal scrolling function for snapping/travelling effects using
      * requestAnimationFrame. Drops the need for $.animate
      * @param {Number} destination - the desired scroll position
      * @param {Number} timeToScroll - duration of scroll in ms
      * @return {undefined}
    */
    scrollTo = (destination: number, timeToScroll?: number) => {
        const { options, scrollPos } = this;
        const start = performance.now();
        const duration = timeToScroll || options.scrollDuration;
        const startingBlock = scrollPos || (window.scrollY || window.pageYOffset);
        const distance = destination - startingBlock;
        const traverse = () => {
            const now = performance.now();
            const time = Math.min(1, (now - start) / duration);
            const timeFn = Math.sin(time * (Math.PI / 2));
            if (window.pageYOffset === destination) return;
            window.scrollTo(0, Math.ceil(timeFn * distance + startingBlock));
            requestAnimationFrame(traverse);
        };
        traverse();
    }
    /**
      * Shorthand for scrolling to a specific panel.
      * @param {number} panelIndex - panel to scroll to
      * @param {number} speed - optional speed in ms
      * @return {undefined}
    */
    scrollToPanel = (panelIndex: number, speed?: number) => {
        const { panels, scrollTo } = this;
        const destinationPanel = panels[panelIndex - 1];
        if (destinationPanel) scrollTo(destinationPanel.startScrollPos, speed);
        else throw Error('Doormat: No panel available at that index');
    }
    /**
      * Shorthand for travelling to next panel
      * @return {undefined}
    */
    next = () => {
        this.scrollToPanel(this.active.doormatIndex + 1);
    }
    /**
      * Shorthand for travelling to previous panel
      * @return {undefined}
    */
    prev = () => {
        this.scrollToPanel(this.active.doormatIndex - 1);
    }
    /**
      * Handle snap enumeration and scroll doormat to appropriate panel if
      * necessary.
      * @param {String} region - enumeration of snap region "up/down"
      * @return {undefined}
    */
    scrolling: boolean;
    handleSnap = (region: String) => {
        const { active, scrollTo } = this;
        const next = active.nextElementSibling;
        if (!this.scrolling) {
            const nextPanel = region === SnapMode.top ? active : next;
            scrollTo(nextPanel.startScrollPos);
        }
    }
    /**
      * Check for whether a content panel is longer than viewport height.
      * @return {bool} greater - whether panel height is greater than viewport
      * height
    */
    isGreaterThanViewport = () => {
        const { panels } = this;
        let greater = false;
        for (let p = 0; p < panels.length; p++)
            if (panels[p].offsetHeight > window.innerHeight) greater = true;
        return greater;
    }
    /**
      * Reset DOM elements and scroll to top of window. Invoked on viewport
      * changes mitigates the risk of funky glitches that can occur on resizing
      * of content etc.
      * @return {undefined}
    */
    reset = () => {
        const { classes, panels } = this;
        window.scrollTo(0, 0);
        for (const panel of [].slice.call(panels, 0)) {
            panel.classList.remove(classes.obsolete);
            panel.classList.remove(classes.active);
        }
        panels[0].classList.add(classes.active);
    }

    /**
      * Sets the doormat behavior style by setting appropriate z-index values
      * and setting up the correct classnaming if necessary
      * @param {number} timestamp - timestamp for requestAnimationFrame invocation
      * Used to determine how calibration was invoked and whether to reset.
      * @return {undefined}
    */
    calibrate = (timestamp?: number) => {
        const { el, panels, reset, options } = this;
        const isOutbound = options.mode === SnapMode.outbound;
        const greater = this.isGreaterThanViewport();

        let cumulativeHeight = 0;
        let activeHeight = 0;

        for (let i = 0; i < panels.length; i++) {
            const panel = panels[i] as HTMLElement;
            panel.doormatIndex = i + 1;
            cumulativeHeight += panel.offsetHeight;
            if (i) activeHeight += panels[i - 1].offsetHeight;
            panel.startScrollPos = activeHeight;
            if (greater) panel.doormatActiveTop = `${activeHeight}px`;
            else panel.doormatActiveTop = `${i}00vh`;
            panel.style.zIndex = '' + (isOutbound ? 1000 - i : 1000 - (panels.length - i));
            if (!isOutbound) {
                panel.doormatBoundary = cumulativeHeight;
                panel.style.top = panel.doormatActiveTop;
            }
        }

        this.cumulativeHeight = cumulativeHeight;
        el.style.height = greater ? `${cumulativeHeight}px` : `${panels.length}00vh`;
        /**
          * If timestamp, then calibration is being invoked via
          * requestAnimationFrame and therefore we know this is part of a viewport
          * change. Due to issues when viewport size changes and maintaining scroll
          * position, it's simpler to mitigate side effects by resetting the
          * elements.
        */
        if (timestamp) reset();

        this.updating = false;
    }
}
