precision mediump float;
uniform float time;
uniform vec2 resolution;

float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
}

float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(
        mix(hash(i+vec2(0.0,0.0)), hash(i+vec2(1.0,0.0)), u.x),
        mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x),
        u.y
    );
}

float fbm(vec2 p){
    float value = 0.0;
    float scale = 0.5;
    value += noise(p)*scale; p*=2.0; scale*=0.5;
    value += noise(p)*scale; p*=2.0; scale*=0.5;
    value += noise(p)*scale; p*=2.0; scale*=0.5;
    value += noise(p)*scale; p*=2.0; scale*=0.5;
    value += noise(p)*scale;
    return value;
}

void main(void){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv *= 3.0;
    float t = time*0.05;
    float n = fbm(uv + vec2(t, t*0.5));
    vec3 col = vec3(0.1,0.2,0.5);
    col = mix(col, vec3(0.3,0.6,1.0), n);
    col = mix(col, vec3(0.8,0.2,0.6), n*0.6);
    gl_FragColor = vec4(col,1.0);
}
