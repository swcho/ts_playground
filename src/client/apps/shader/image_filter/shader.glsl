precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_tex0; // https://images-na.ssl-images-amazon.com/images/I/910PPWWqFuL.png
uniform sampler2D bgTexture; // https://s3-us-west-2.amazonaws.com/s.cdpn.io/13842/texture02.png
uniform sampler2D bgTexture2; // https://s3-us-west-2.amazonaws.com/s.cdpn.io/13842/texture_copy_copy.png

float random (in vec2 _st) { 
    return fract(sin(dot(_st.xy,
                            vec2(12.9898,78.233)))* 
        43758.5453123);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + 
            (c - a)* u.y * (1.0 - u.x) + 
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 5

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), 
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
    float uPow = 5.4;
    float uMix = 1.936;
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.x *= u_resolution.x / u_resolution.y;
    vec2 st = uv * 5.;
    vec3 color = vec3(0.0);

    vec2 q = vec2(0.);
    q.x = fbm( st + 0.00 * u_time);
    q.y = fbm( st + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm( st + 1.0*q + vec2(1.7,9.2- 3. * 0.15 * u_time));
    r.y = fbm( st + 1.0*q + vec2(8.3,2.8- 3. * 0.126 * u_time));

    float f = fbm(st+r);
    vec2 distort = vec2(pow(f, uPow)) ;
    vec2 customUv0 = distort  +  vec2(uv.x, uv.y * (uMix - 1.)+ ( 2. - uMix) );
    vec2 customUv1 = distort  + vec2(uv.x, uv.y * ( -uMix)  ) ;
    vec3 col, col1;

    col = texture2D(bgTexture, customUv0).rgb * (1.0 - smoothstep( uMix + 0.5, uMix + 1.0, f));
    col1 = texture2D(bgTexture2, customUv1).rgb*smoothstep( uMix + 0.5, uMix + 1.0, f) ;

    gl_FragColor = vec4(  vec3( (col + col1) * clamp(1.0 - pow(f, uPow), 0.0, 1.0) ), 1.0); //clamp(uPow * (1.0 - distort), 0.0, 1.0));

    // vec2 st = gl_FragCoord.xy/u_resolution.xy;
    // st.x *= u_resolution.x/u_resolution.y;
    
    // vec3 color = vec3(0.);
    // vec2 pixel = 1./u_resolution;
    
    // color += texture2D(u_tex0, st).rgb;
     
	// gl_FragColor = vec4(color, 1.0);

}