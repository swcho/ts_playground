
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

declare var just;
declare var flubber;

let t1 = just.animate({
    targets: '#target',
    duration: 4000,
    props: {
        d: {
            value: [
                'M3 22v-20l18 10-18 10z',
                'M12 4.248c-3.148-5.402-12-3.825-12 2.944 0 4.661 5.571 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-6.792-8.875-8.306-12-2.944z',
                'M21 6.285l-11.16 12.733-6.84-6.018 1.319-1.49 5.341 4.686 9.865-11.196 1.475 1.285z',
                'M4 0l16 12.279-6.951 1.17 4.325 8.817-3.596 1.734-4.35-8.879-5.428 4.702z',
            ],
            interpolate(left, right) {
                console.log('interpolate', left, right);
                return flubber.interpolate(
                    left,
                    right, { maxSegmentLength: 0.3 }
                );
            }
        },
        fill: {
            value: ['black', 'red', 'blue', 'hsl(128, 50%, 50%)'],
            interpolate: just.mix.colors
        }
    }
});

t1.play({ repeat: Infinity, alternate: true });

just.tools.player(t1);
