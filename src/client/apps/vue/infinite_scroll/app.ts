
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

import './style.scss';
// import * as $ from 'jquery';
import Vue from 'vue';
// import {TimelineMax, TimelineLite, Sine} from 'gsap';

declare global {
    interface Window {
        CustomEvent;
        Event;
    }
}


/*************************************
UTILITIES
*************************************/
// custom event polyfill
(function () {
    if (typeof window.CustomEvent === 'function') return false;

    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();

// create optimized scrolling event
(function () {
    const throttle = function (type, name, obj?) {
        obj = obj || window;
        let running = false;
        const func = function () {
            if (running) { return; }
            running = true;
            requestAnimationFrame(() => {
                obj.dispatchEvent(new CustomEvent(name));
                running = false;
            });
        };
        obj.addEventListener(type, func);
    };

    // init - you can init any event
    throttle('scroll', 'optimizedScroll');
})();

const getScrollXY = () => {
    let scrOfX = 0;
    let scrOfY = 0;
    if (typeof (window.pageYOffset) === 'number') {
        // Netscape compliant
        scrOfY = window.pageYOffset;
        scrOfX = window.pageXOffset;
    } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
        // DOM compliant
        scrOfY = document.body.scrollTop;
        scrOfX = document.body.scrollLeft;
    } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
        // IE6 standards compliant mode
        scrOfY = document.documentElement.scrollTop;
        scrOfX = document.documentElement.scrollLeft;
    }
    return [scrOfX, scrOfY];
};

const getDocHeight = () => {
    const D = document;
    return Math.max(
        D.body.scrollHeight, D.documentElement.scrollHeight,
        D.body.offsetHeight, D.documentElement.offsetHeight,
        D.body.clientHeight, D.documentElement.clientHeight
    );
};

const isScrollBottom = (tolerance = 0) => {
    return (getDocHeight() < getScrollXY()[1] + window.innerHeight + tolerance);
};

function shuffle(a) {
    let b = [...a];
    for (let i = b.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [b[i - 1], b[j]] = [b[j], b[i - 1]];
    }
    return b;
}

/*************************************
COMPONENT: FILTERED GRID
*************************************/
const filteredGrid = {
    props: {
        items: {
            type: Array,
            required: true
        },
        emptyResult: {
            type: Object,
            required: true
        },
        query: {
            type: String,
            default: ''
        },
        filter: {
            type: String,
            default: ''
        },
        queryBy: {
            type: String,
            default: ''
        },
        filterBy: {
            type: String,
            default: ''
        },
        numResults: {
            type: Number,
            default: 6
        },
        initNumResults: {
            type: Number,
            default: 6
        },
        numCols: {
            type: Number,
            default: 1
        },
        infiniteDistance: {
            type: Number,
            // default: 600
            default: 1
        }
    },
    computed: {
        results: function () {
            const _results = this.items.filter((i) => {
                return (
                    (!this.queryBy ||
                        (i[this.queryBy].toLowerCase().indexOf(this.query.toLowerCase()) !== -1)) &&
                    (!this.filterBy ||
                        (i[this.filterBy].indexOf(this.filter) !== -1 || this.filter === ''))
                );
            }).slice(0, this.numResults);
            return _results.length > 0 ? _results : this.emptyResult;
        }
    },
    watch: {
        query: function (val, oldVal) {
            this.numResults = this.initNumResults;
        },
        filter: function (val, oldVal) {
            this.numResults = this.initNumResults;
        }
    },
    created: function () {
        window.addEventListener('optimizedScroll', () => {
            if (isScrollBottom(this.infiniteDistance) && this.numResults < this.items.length) {
                this.numResults += this.numCols;
            }
        });
    },
    template: `<transition-group
    tag="ul"
    name="gsf-filtered-grid"
    class="gsf-filtered-grid">
    <slot v-for="i in results"
      v-bind:data="i"
      v-bind:last="results.indexOf(i) === results.length - 1"
      v-bind:card-width="numCols === 1 ? '100%' : ((100/numCols) - 1.5) + '%'">
    </slot>
  </transition-group>`
};

/*************************************
COMPONENT: FILTER LIST
*************************************/
const filterList = {
    props: {
        activeFilter: {
            type: String,
            default: ''
        },
        allText: {
            type: String,
            default: 'All'
        },
        backdrop: {
            type: Boolean,
            default: true
        },
        drawerOpen: {
            type: Boolean,
            default: false
        },
        filters: {
            type: Array,
            required: true
        },
        onChange: {
            type: Function,
            required: true
        }
    },
    methods: {
        toggleDrawer: function (bool) {
            this.drawerOpen = bool;
        }
    },
    watch: {
        activeFilter: function (val, oldVal) {
            this.drawerOpen = false;
        }
    },
    template: `<div class="gsf-filters" v-bind:class="{'gsf-filters-backdrop': backdrop, 'gsf-mobile-filters-open': drawerOpen}">
    <a v-on:click="toggleDrawer(!drawerOpen)" class="gsf-mobile-filters-drawer">
      <span class="gsf-mobile-filters-heading">Filter</span>
      <span class="gsf-mobile-filters-selected">{{ activeFilter === '' ? allText : activeFilter }}</span>
    </a>
    <div class="gsf-filter-list-wrap">
      <ul class="gsf-filter-list">
        <li><a
          v-bind:class="{'gsf-filter-active': activeFilter === ''}"
          v-on:click="onChange('')"><span>{{allText}}</span></a></li>
        <li v-for="filter in filters"><a
          v-bind:class="{'gsf-filter-active': activeFilter === filter}"
          v-on:click="onChange(filter)"><span>{{filter}}</span></a></li>
      </ul>
    </div>
  </div>`
};

/*************************************
COMPONENT: FRIEND CARD
*************************************/
const friendCard = {
    props: {
        cardWidth: {
            type: String,
            default: '100%'
        },
        data: {
            type: Object,
            required: true
        }
    },
    template: `<li class="gsf-friend-card" v-bind:style="{width: cardWidth}">
    <div class="gsf-friend-img-wrapper">
      <img class="gsf-friend-static" v-bind:src="data.imgStatic" alt="" />
      <img class="gsf-friend-animated" v-bind:src="data.imgAnimated" alt="" />
    </div>
    <div class="gsf-friend-card-text">
      <div class="gsf-friend-full-name">{{ data.fullName }}</div>
      <div class="gsf-friend-job-title">{{ data.jobTitle }}</div>
    </div>
  </li>`
};

/*************************************
MAIN
*************************************/
const whoWeAre = {
    components: {
        'filtered-grid': filteredGrid,
        'filter-list': filterList,
        'friend-card': friendCard
    },
    props: {
        friends: {
            type: Array,
            required: true
        },
        tags: {
            type: Array,
            required: true
        }
    },
    data: function () {
        return {
            query: '',
            activeTag: '',
            numCols: 2,
            allFriends: shuffle(this.friends),
            noFriends: [{
                id: -1,
                fullName: 'No friends found',
                imgStatic: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/476907/no-friends-static.jpg',
                imgAnimated: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/476907/no-friends.gif'
            }]
        };
    },
    watch: {
        activeTag: function (val, oldVal) {
            this.allFriends = shuffle(this.allFriends);
        }
    },
    methods: {
        setTag: function (tag) {
            this.activeTag = tag;
            this.query = '';
        },
        onKeyDown: function () {
            this.activeTag = '';
        }
    },
    template: `<div class="friends-gallery">
    <div class="friends-search">
      <div class="friends-input-wrapper">
        <input
          type="text"
          placeholder="Find a Friend"
          v-model="query"
          v-on:keydown="onKeyDown"/>
        <div class="friends-input-status"></div>
      </div>
    </div>
    <div class="friends-main">
      <filter-list
        allText="Everyone"
        v-bind:filters="tags"
        v-bind:active-filter="activeTag"
        v-bind:on-change="setTag" />
      <filtered-grid
        filter-by="tags"
        query-by="fullName"
        v-bind:items="allFriends"
        v-bind:filter="activeTag"
        v-bind:query="query"
        v-bind:num-cols="numCols"
        v-bind:empty-result="noFriends">
        <template scope="props">
          <friend-card
            v-bind:data="props.data"
            v-bind:key="props.data.id"
            v-bind:card-width="props.cardWidth"/>
        </template>
      </filtered-grid>
    </div>
  </div>`
};

/*************************************
GET DATA AND MOUNT
*************************************/
const friendsGallery = document.getElementById('friends-gallery');
const friendsData = JSON.parse(friendsGallery.getAttribute('data-friends'));
const friendsTags = JSON.parse(friendsGallery.getAttribute('data-tags'));

new Vue({
    el: '#friends-gallery',
    render: function (createElement) {
        return createElement(whoWeAre, {
            props: {
                friends: friendsData
                    .map((e, i) => {
                        return {
                            id: i,
                            fullName: e.name,
                            jobTitle: e.jobTitle,
                            tags: e.tags,
                            imgStatic: e.imageSrc,
                            imgAnimated: e.animatedImageSrc
                        };
                    }),
                tags: friendsTags
            }
        });
    }
});
