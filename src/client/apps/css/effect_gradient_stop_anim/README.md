Gradient Stop Animation
===

[출처](https://codepen.io/thebabydino/pen/zddMJo)

CSS

``` css
        @supports (mix-blend-mode: screen) {
            /* in supports because 
 		 	 * background: inherit 
		 	 * breaks Edge for some reason 
		 	 * (sorry, I had no better idea) */
            background: inherit;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            filter: invert(1) grayscale(1) contrast(3)
        }
```