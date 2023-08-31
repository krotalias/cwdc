// Martijn Steinrucken
//
// https://twitter.com/the_artofcode?lang=en
// https://www.youtube.com/TheArtOfCodeIsCool
//
// https://www.youtube.com/watch?v=PGtv-dBi2wE
// https://www.youtube.com/watch?v=Ff0jJyyiVyw
// https://www.youtube.com/watch?v=AfKGMUDWfuE
// https://www.youtube.com/watch?v=Vmb7VGBVZJA
//
// https://michaelwalczyk.com/blog-ray-marching.html
// https://www.lcg.ufrj.br/cwdc/13-webgl/shaderToy.mp4
//
// A very simple ray marching implementation,
// with a few SDF functions: sphere, torus, box, cylinder.
// Boolean operations are also available:
// union, intersection, difference and blend.
//
// The beauty of the method is that there are no more polygons or vertices,
// but objects are just scalar fields, given by Signed Distance Functions (SDFs).
//
// Paulo Roma
// 17/07/2022

#define MAX_STEPS 100
#define MAX_DIST 100.0
#define SURF_DIST 0.01
#define PI 3.1415925359

// Rotation matrix.
mat2 Rot (float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

// SDF of a torus at the origin given its two radius.
float dTorus(vec3 p, vec2 r) {
    float x = length(p.xz) - r.x;

    return length(vec2(x, p.y)) - r.y;
}

// SDF of a box at the origin given its size (width, height and depth).
float dBox(vec3 p, vec3 s) {
    return length(max(abs(p) - s, 0.0));
}

// SDF of a sphere, given its center and radius.
float dSphere(vec3 p, vec4 s) {
    return length(p - s.xyz) - s.w;
}

// SDF of a cylinder given a segment and a radius.
float dCylinder(vec3 p, vec3 a, vec3 b, float r) {
    vec3 ab = b - a;
    vec3 ap = p - a;

    float t = dot(ab, ap) / dot(ab, ab);

    vec3 c = a + t * ab;

    float x = length(p - c) - r;
    float y = (abs(t - 0.5) - 0.5) * length(ab);
    float e = length(max(vec2(x, y), 0.0));
    float i = min(max(x, y), 0.0);

    return e + i;
}

// B + A
float unionSDF (float sda, float sdb) {
    return min(sda, sdb);
}

// B * A
float intersectionSDF (float sda, float sdb) {
    return max(sda, sdb);
}

// B - A
float differenceSDF (float sda, float sdb) {
    return max(-sda, sdb);
}

// Blend A and B
float blendSDF(float sda, float sdb, float k) {
    float h = clamp(0.5 + 0.5 * (sdb - sda) / k, 0.0, 1.0);
    return mix(sdb, sda, h) - k * h * (1.0 - h);
}

// Scene SDF: signed distance function.
float getDist(vec3 p) {
    float planeDist = p.y;

    float s = sin(iTime);

    vec3 bp = p - vec3(3, 0.75, 7);
    bp.xz *= Rot(iTime);

    vec3 tp = p - vec3(0, 0.5, 6);
    tp.y -= s;

    vec3 bp2 = p - vec3(-3, 0.75, 6);
    bp2.y -= -s;

    float cx = -3.0;
    cx -= s;

    vec3 a = vec3(0, 0.3, 3);
    vec3 b = vec3(3, 0.3, 5);
    vec3 ab = normalize(b - a).zyx;
    ab.x = -ab.x;
    a -= s * ab;
    b -= s * ab;

    float sd  = dSphere(p, vec4(0, 1, 6 , 1));
    float sd2 = dSphere(p, vec4(-3, 0.5, 6, 1.0));
    float td  = dTorus (tp, vec2(1.5, 0.3));
    float bd  = dBox(bp, vec3(0.75));
    float bd2 = dBox(bp2, vec3(0.75));
    float cd  = dCylinder(p, a, b, 0.3);

    float sd3 = dSphere(p, vec4(cx, 3, 8, 1));
    float sd4 = dSphere(p, vec4(-2, 3, 8, 1));

    float d = min(sd, planeDist);
    d = min(d, td);
    d = min(d, cd);
    d = min(d, bd);
    d = min(differenceSDF(sd2, bd2), d);
    d = min(blendSDF(sd3, sd4, 0.2), d);

    return d;
}

// Walk through empty spheres until the ray hits an object
// or is beyond MAX_DIST, meaning no hit.
float rayMarch(vec3 ro, vec3 rd) {
    float dO = 0.0;
    for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = getDist(p);
        dO += dS;
        if (dO > MAX_DIST || dS < SURF_DIST) break;
    }
    return dO;
}

// The normal is the gradient of the SDF scalar field at point p.
// By using finite difference:
// https://en.wikipedia.org/wiki/Finite_difference#Relation_with_derivatives
vec3 getNormal(vec3 p) {
    // arbitrary — should be smaller than any surface detail in your distance function,
    // but not so small as to get lost in float precision
    vec2 e = vec2(0.001, 0);

    vec3 n =
        vec3(
        getDist(p + e.xyy),
        getDist(p + e.yxy),
        getDist(p + e.yyx)) -
        vec3(
        getDist(p - e.xyy),
        getDist(p - e.yxy),
        getDist(p - e.yyx));

    return normalize(n);
}

// Phong illumination model, given a point and camera position.
float getLight(vec3 p, vec3 ro) {
    vec3 lightPos = vec3(0, 5, 6);

    lightPos.xz += vec2(sin(iTime), cos(iTime)) * 2.0;

    vec3 l = normalize(lightPos - p);
    vec3 n = getNormal(p);
    vec3 r = reflect(-l,n);

    // ambient component
    float amb = 0.1;
    // ambient reflection coefficient
    float ka = 1.0;

    // diffuse component - apply Lambert's cosine law
    float dif = clamp(dot(n, l), 0.0, 1.0);
    // diffuse reflection coefficient
    float kd = 0.8;

    // specular component
    float shininess = 100.;
    vec3 v = normalize(ro-p);
    float spec = clamp(dot(r, v), 0.0, 1.0);
    spec = pow(spec,shininess);
    // specular reflection coefficient
    float ks = 1.0;

    // slightly move point p in the direction of the normal,
    // so the distance is not zero. Otherwise, the first hit
    // will be at the plane.
    float d = rayMarch(p + 2. * n * SURF_DIST , l);

    // cast a ray to the light
    if (d < length(lightPos - p)) {
        // point in the shadow
        dif *= 0.1;
        spec *= 0.5;
    }

    // ambient + diffuse + specular components
    return ka * amb + kd * dif + ks * spec;
}

// Fragment shader.
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // normalized pixel coordinates (from -0.5 to 0.5)
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / min(iResolution.x, iResolution.y);

    // camera position
    vec3 ro = vec3(0, 2, 0);

    // projection plane z = 1
    vec3 rd = normalize(vec3(uv.x, uv.y, 1));

    // Rotate camera down about the x-axis
    rd.yz *= Rot(PI * 10. / 180.);

    float d = rayMarch(ro, rd);

    // point hit by the ray
    vec3 p = ro + rd * d;

    // illumination at point p
    float light_intensity = getLight(p, ro);

    // dark grey
    // vec3 background_color = vec3(.2, .2, .2);
    vec3 background_color = texture(iChannel0, uv*vec2(1.,2.)).rgb;

    // Antique White color #FAEBD7
    vec3 surface_color = vec3(250, 235, 215) / 255.;

    // pixel color
    vec3 color;

    if (d < MAX_DIST)
        // modulate surface color by the light intensity
        color = surface_color * vec3(light_intensity);
    else
        color = background_color;

    // output to screen
    fragColor = vec4(color,1.0);
}