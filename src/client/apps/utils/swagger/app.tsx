
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import {Spec} from 'swagger-schema-official';

const spec: Spec = require('./api-with-examples.json');

function printSpec(spec: Spec) {
    console.log('version', spec.swagger);
    console.log('title', spec.info.title);
}

printSpec(spec);
