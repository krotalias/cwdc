/**
 * @file
 *
 * Summary.
 * <p>Edge light object.</p>
 *
 * @author Claudio Esperança
 * @since 08/06/2022
 * @see <a href="/cwdc//13-webgl/beam/segments.html">link</a>
 * @see <a href="/cwdc/13-webgl/beam/beam.js">source</a>
 * @see https://github.com/regl-project/regl
 * @see https://regl-project.github.io/regl/
 * @see https://regl-intro.herokuapp.com/#Passing_parameters_to_the_command
 * @see https://peterbeshai.com/blog/2017-05-26-beautifully-animate-points-with-webgl-and-regl/
 * @see https://drive.google.com/file/d/1bDLGlqdqgMBsUSr1icIaSqdm_5VC2io5/view
 * @see https://www.instagram.com/p/Cc3uGxaJ2MB/
 */

/**
 * Edge light object, defined by:
 * <ul>
 *  <li> initial random position and angle, </li>
 *  <li> direction (rotation angle) </li>
 *  <li> initial size and random maximum size, </li>
 *  <li> color, </li>
 *  <li> increment (for growth and rotation). </li>
 * </ul>
 */
class edgeLight {
  /**
   * Constructs a new edge.
   *
   * @param {Number} aspect canvas aspect ratio.
   */
  constructor(aspect = 1) {
    this.pos = [(Math.random() * 2 - 1) * aspect, Math.random() * 2 - 1];
    this.angle = (Math.PI / 4) * ~~(Math.random() * 8);
    const turn = this.angle + ((Math.random() < 0.5 ? -1 : 1) * Math.PI) / 2;
    this.direction = [Math.cos(turn), Math.sin(turn)];
    this.size = 0.1;
    this.maxSize = Math.random() / 2 + 0.5;
    this.color = palette[~~(Math.random() * palette.length)];
    this.increment = 0.001;
  }

  /**
   * A property holding this segment origin.
   *
   * @return {Array<Number>} segment origin.
   */
  get a() {
    return [
      this.pos[0] + Math.cos(this.angle) * this.size,
      this.pos[1] + Math.sin(this.angle) * this.size,
    ];
  }

  /**
   * A property holding this segment end point.
   *
   * @return {Array<Number>} segment end point.
   */
  get b() {
    return [
      this.pos[0] - Math.cos(this.angle) * this.size,
      this.pos[1] - Math.sin(this.angle) * this.size,
    ];
  }

  /**
   * A property for signaling the end of life of this segment.
   *
   * @return {Boolean} ending condition.
   */
  get terminated() {
    return this.size < 0;
  }

  /**
   * <p>Animation function.</p>
   *
   * Grows and rotates this segment by a fixed increment in each frame.
   */
  animate() {
    if (!this.terminated) {
      this.size += this.increment;
      this.pos[0] += this.direction[0] * this.increment;
      this.pos[1] += this.direction[1] * this.increment;
      this.angle += this.increment * Math.PI;
    }
    if (this.size > this.maxSize) this.increment = -this.increment;
  }
}

/**
 * <p>Return a regl object and a draw command with the source code for a vertex and a fragment shader.</p>
 *
 * A draw command wraps up all of the WebGL state associated with a draw call
 * (either drawArrays or drawElements) and packages it into a single reusable function.
 *
 * @param {HTMLElement} canvas WebGL canvas.
 * @returns {Object<regl:Object, drawEdge:function>} regl object and draw function.
 * @see http://regl.party/api#from-a-canvas
 */
function edgeRenderProgram(canvas) {
  const regl = createREGL(canvas);

  const drawEdge = regl({
    frag: `
      precision mediump float;
      uniform vec4 color;
      uniform vec2 a;
      uniform vec2 b;
      uniform vec2 resolution;
      uniform float attenuationExponent;
      uniform float lightIntensity;
      uniform float beamLength;

      float orient(vec2 a, vec2 b, vec2 c) {
        return (c.y*b.x - c.x*b.y) + (c.x*a.y - c.y*a.x) + (b.y*a.x - b.x*a.y);
      }

      float orientedSegment( in vec2 p, in vec2 a, in vec2 b ) {
        vec2 pa = p-a, ba = b-a;
        float t = dot(pa,ba)/dot(ba,ba);
        float h = clamp(t , 0.0, 1.0 );
        vec2 u = pa - ba*h;
        if (h == t && orient(p,a,b) >= 0.) return length( u );
        return 1e20;
      }

      void main () {
        vec2 p = (2.0*gl_FragCoord.xy-resolution)/resolution.y;
        float d = orientedSegment(p, a, b);
        if (d < beamLength) {
          float t = smoothstep(0.,0.005,d)-smoothstep(0.005,0.01,d);
          gl_FragColor = vec4(color.xyz,t+lightIntensity*pow((1.-d/beamLength),attenuationExponent));
        } else discard;
      }`,

    vert: `
      attribute vec2 position;
      void main () {
        gl_Position = vec4(position, 0., 1.);
      }`,

    attributes: {
      position: [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ],
    },

    depth: {
      enable: false,
    },

    primitive: "triangle fan",

    blend: {
      enable: true,
      func: {
        srcRGB: "src alpha",
        srcAlpha: 1,
        dstRGB: "one minus src alpha",
        dstAlpha: 1,
      },
      equation: {
        rgb: "add",
        alpha: "add",
      },
      color: [0, 0, 0, 0],
    },

    count: 4,

    uniforms: {
      resolution: [canvas.width, canvas.height],
      a: regl.prop("a"),
      b: regl.prop("b"),
      color: regl.prop("color"),
      attenuationExponent: regl.prop("attenuationExponent"),
      lightIntensity: regl.prop("lightIntensity"),
      beamLength: regl.prop("beamLength"),
    },
  });

  return { regl, drawEdge };
}
