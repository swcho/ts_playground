
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// https://github.com/swagger-api/swagger-ui/issues/3000

import 'swagger-ui/dist/swagger-ui.css';
const SwaggerUI = require<any>('swagger-ui');
const presets = SwaggerUI.presets;

import {Spec} from 'swagger-schema-official';
const spec: Spec = require('./api-with-examples.json');

console.log(SwaggerUI);

function printSpec(spec: Spec) {
    console.log('version', spec.swagger);
    console.log('title', spec.info.title);
}

printSpec(spec);
SwaggerUI({
    dom_id: '#swaggerContainer',
    // url: 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/json/petstore-expanded.json',
    // url: 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/json/petstore-separate/spec/swagger.json',
    // url: this.props.url,
    spec,
    presets: [presets.apis]
});
