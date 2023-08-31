#define MAX_OCTAVES 8

float oNoise (vec3 p) {
  float total = 0.;
  float frequency = 1.;
  float amplitude = 1.;
  float value = 0.;
  for (int i = 0; i < MAX_OCTAVES; ++i) {
    if (float(i) >= octaves) break;
    value += noise3(p * frequency) * amplitude;
    total += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }
  return value / total;
}

const int MAX_MARCHING_STEPS = 255;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float EPSILON = 0.0001;

const float fieldOfView = radians(45.0); // Vertical camera angle
vec3 eye = 10.0*normalize(vec3(0.5-iMouse.xy/iResolution.xy,0.5)); // Position of the eye

float cubeSDF(vec3 p) {
    vec3 d = abs(p) - vec3(1.0, 1.0, 1.0);
    float insideDistance = min(max(d.x, max(d.y, d.z)), 0.0);
    float outsideDistance = length(max(d, 0.0));
    return insideDistance + outsideDistance;
}

/**
 * SDF for a sphere of radius 1.2
 **/
float largeSphereSDF(vec3 samplePoint) {
    return length(samplePoint) - 1.2;
}

/**
 * Difference between a cube of side 2 and a sphere of radius 1.2
 **/
float sceneSDF(vec3 samplePoint) {
    return max(cubeSDF(samplePoint),-largeSphereSDF(samplePoint));
}

float shortestDistanceToSurface(vec3 marchingDirection, float start, float end) {
  float depth = start;
  for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
    float dist = sceneSDF(eye + depth * marchingDirection);
    if (dist < EPSILON) {
      return depth;
    }
    depth += dist;
    if (depth >= end) {
      return end;
    }
  }
  return end;
}

vec3 rayDirection(vec2 fragCoord) {
  vec2 xy = fragCoord - iResolution.xy / 2.0;
  float z = iResolution.y / tan(fieldOfView / 2.0);
  return normalize(vec3(xy, -z));
}

vec3 normal(vec3 p) {
  return normalize (vec3 (sceneSDF(p+vec3(EPSILON,0.0,0.0))-sceneSDF(p-vec3(EPSILON,0.0,0.0)),
                          sceneSDF(p+vec3(0.0,EPSILON,0.0))-sceneSDF(p-vec3(0.0,EPSILON,0.0)),
                          sceneSDF(p+vec3(0.0,0.0,EPSILON))-sceneSDF(p-vec3(0.0,0.0,EPSILON))));
}

vec3 noiseNormal (vec3 p) {
  return normalize (vec3 (oNoise(p+vec3(EPSILON,0.0,0.0))-oNoise(p-vec3(EPSILON,0.0,0.0)),
                          oNoise(p+vec3(0.0,EPSILON,0.0))-oNoise(p-vec3(0.0,EPSILON,0.0)),
                          oNoise(p+vec3(0.0,0.0,EPSILON))-oNoise(p-vec3(0.0,0.0,EPSILON))));
}


vec3 phong (vec3 k_a, vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 N,
            vec3 lightPos, vec3 lightIntensity) {
    vec3 L = normalize(lightPos - p);
    vec3 V = normalize(eye - p);
    vec3 R = normalize(reflect(-L, N));
    
    float dotLN = dot(L, N);
    float dotRV = dot(R, V);
    
    if (dotLN < 0.0) {
        // Light not visible from this point on the surface
        return k_a * lightIntensity;
    } 
    
    if (dotRV < 0.0) {
        // Light reflection in opposite direction as viewer, apply only diffuse
        // component
        return lightIntensity * (k_a + k_d * dotLN);
    }
    return lightIntensity * (k_a + k_d * dotLN + k_s * pow(dotRV, alpha));
}

mat4 lookAt(vec3 eye, vec3 center, vec3 up) {
    // Based on gluLookAt man page
    vec3 f = normalize(center - eye);
    vec3 s = normalize(cross(f, up));
    vec3 u = cross(s, f);
    return mat4(
        vec4(s, 0.0),
        vec4(u, 0.0),
        vec4(-f, 0.0),
        vec4(0.0, 0.0, 0.0, 1)
    );
}

void main( )
{
  mat4 view = lookAt(eye,vec3(0.0,0.0,0.0),vec3(0.0,1.0,0.0)); 
  vec3 dir = (view*(vec4(rayDirection(gl_FragCoord.xy),1.0))).xyz;
  float dist = shortestDistanceToSurface(dir, MIN_DIST, MAX_DIST);
  if (dist > MAX_DIST - EPSILON) {
    gl_FragColor = vec4( 0.8, 0.8, 0.8, 1.0); // light gray
  }
  else {
    vec3 p = eye + dist * dir;
    vec3 N = normal(p);
    vec3 nn = noiseNormal (p*scale+vec3(0.,0.,iTime*speed));
    if (dot(N,nn) < 0.0) nn = reflect (nn,N);
    if (bumpmapNoise > 0.) N = normalize (N*2.+ nn);
    float w = colorNoise > 0. ? offset + multiplier * oNoise(p*scale+vec3(0.,0.,iTime*speed)) : 1.; 
    //gl_FragColor = vec4(w,w,w,1.0);
    gl_FragColor = vec4(phong (vec3 (0.3), // ambient
                               vec3 (0.8) *w, // diffuse
                               vec3 (0.7) *w, // specular
                               50.0, // shininess
                               p, // point
                               N, // normal at point
                               vec3(5.0,5.0,10.0), // light position
                               vec3(1.0,1.0,1.0)), // light color/intensity
                        1.0);
  }
}
