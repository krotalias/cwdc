/**
 * @file
 *
 * Summary.
 * <p>Equirectangular and Mercator projection viewer using lighting combined with
 * {@link https://web.engr.oregonstate.edu/~mjb/cs550/PDFs/TextureMapping.4pp.pdf texture mapping}
 * written in Vanilla Javascript and WebGL.</p>
 *
 * <p><b>For educational purposes only.</b></p>
 * <p>This is just a <b>demo</b> for teaching {@link https://en.wikipedia.org/wiki/Computer_graphics CG},
 * which became {@link https://www.youtube.com/watch?v=uhiCFdWeQfA overly complicated},
 * and it is similar to <a href="/cwdc/13-webgl/examples/lighting/content/doc-lighting2/index.html">Lighting2</a>,
 * except we define a 3x3 matrix for {@link https://learnopengl.com/Lighting/Materials material properties}
 * and a 3x3 matrix for {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Lighting_in_WebGL light properties}
 * that are passed to the fragment shader as
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform uniforms}.
 *
 * Edit the {@link lightPropElements light} and {@link matPropElements material} matrices in the global variables to experiment or
 * {@link startForReal} to choose a model and select
 * {@link https://www.scratchapixel.com/lessons/3d-basic-rendering/introduction-to-shading/shading-normals face or vertex normals}.
 * {@link https://threejs.org Three.js} only uses face normals for
 * {@link https://threejs.org/docs/#api/en/geometries/PolyhedronGeometry polyhedra}, indeed.<p>
 *
 * Texture coordinates can be set in each model or {@link https://gamedev.stackexchange.com/questions/197931/how-can-i-correctly-map-a-texture-onto-a-sphere sampled at each pixel}
 * in the {@link https://raw.githubusercontent.com/krotalias/cwdc/main/13-webgl/extras/LightingWithTexture.html fragment shader}.
 * We can also approximate a sphere by subdividing a
 * {@link https://en.wikipedia.org/wiki/Regular_polyhedron convex regular polyhedron} and solving Mipmapping artifact issues
 * by using {@link https://vcg.isti.cnr.it/Publications/2012/Tar12/jgt_tarini.pdf Tarini's} method, in this case.
 * These {@link https://bgolus.medium.com/distinctive-derivative-differences-cce38d36797b artifacts}
 * show up due to the discontinuity in the seam when crossing the line with 0 radians on one side and 2π on the other.
 * Some triangles may have edges that cross this line, causing the wrong mipmap level 0 to be chosen.
 *
 * <p>To lay a map onto a sphere, textures should have an aspect ratio of 2:1 for equirectangular projections
 * or 1:1 (squared) for Mercator projections. Finding high-resolution, good-quality,
 * and free {@link https://www.axismaps.com/guide/map-projections cartographic maps}
 * is really difficult.</p>
 *
 * <p>The initial position on the screen takes into account the {@link https://science.nasa.gov/science-research/earth-science/milankovitch-orbital-cycles-and-their-role-in-earths-climate/ obliquity}
 * of the earth ({@link viewMatrix 23.44°}), and the {@link https://en.wikipedia.org/wiki/Phong_reflection_model Phong highlight}
 * projects onto the {@link https://en.wikipedia.org/wiki/Equator equator line}
 * if the user has not interacted using the {@link http://courses.cms.caltech.edu/cs171/assignments/hw3/hw3-notes/notes-hw3.html#NotesSection2 Arcball}.
 * If {@link https://www.php.net PHP} is running on the {@link https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/What_is_a_web_server HTTP server},
 * then any image file in directory <a href="/cwdc/13-webgl/extras/textures">textures</a>
 * will be available in the {@link readFileNames menu}. Otherwise, sorry {@link https://pages.github.com GitHub pages},
 * only the images listed in the HTML file.<p>
 *
 * <p>Maps are transformations from {@link module:polyhedron.cartesian2Spherical 3D space}
 * to {@link module:polyhedron.spherical2Mercator 2D space}, and they can preserve areas
 * ({@link https://en.wikipedia.org/wiki/Equal-area_projection equal-area maps}) or angles
 * ({@link https://en.wikipedia.org/wiki/Conformal_map conformal maps}). The success of the
 * {@link https://en.wikipedia.org/wiki/Mercator_projection Mercator projection}
 * lies in its ability to preserve angles, making it ideal for navigation
 * (directions on the map match the directions on the compass). However, it distorts areas,
 * especially near the poles, where landmasses appear {@link https://math.uit.no/ansatte/dennis/MoMS2017-Lec3.pdf much larger}
 * than they are in reality. Meridian and parallel {@link https://en.wikipedia.org/wiki/Scale_(map) scales}
 * are the same, meaning that distances along a parallel or meridian (in fact, in all directions) are equally stretched
 * by a factor of sec(φ) = 1/cos(φ), where φ ∈ [-85.051129°, 85.051129°] is its latitude.</p>
 *
 * <p>The {@link https://en.wikipedia.org/wiki/Web_Mercator_projection Web Mercator}
 * projection, on the other hand, is a variant of the Mercator projection, which is {@link https://en.wikipedia.org/wiki/Google_Maps widely}
 * used in {@link https://en.wikipedia.org/wiki/Web_mapping web mapping} applications.
 * It was designed to work well with the Web Mercator coordinate system,
 * which is based on the {@link https://en.wikipedia.org/wiki/World_Geodetic_System#WGS_84 WGS 84 datum}.
 *
 * The projection is neither strictly ellipsoidal nor strictly spherical,
 * and it uses spherical development of ellipsoidal coordinates.
 * The underlying geographic coordinates are defined using the WGS 84 ellipsoidal model
 * of the Earth's surface but are projected as if
 * {@link https://alastaira.wordpress.com/2011/01/23/the-google-maps-bing-maps-spherical-mercator-projection/ defined on a sphere}.
 *
 * Misinterpreting Web Mercator for the standard Mercator during coordinate conversion can lead to
 * {@link https://web.archive.org/web/20170329065451/https://earth-info.nga.mil/GandG/wgs84/web_mercator/index.html deviations}
 * as much as 40 km on the ground.</p>
 *
 * <p>It is impressive how {@link https://en.wikipedia.org/wiki/Gerardus_Mercator Gerardus Mercator} was able to create such a projection in a
 * {@link https://personal.math.ubc.ca/~israel/m103/mercator/mercator.html time} (1569) when there was no
 * calculus (integrals, derivatives — {@link https://en.wikipedia.org/wiki/History_of_calculus Leibniz-Newton}, 1674-1666) or even logarithm tables
 * ({@link https://en.wikipedia.org/wiki/John_Napier John Napier}, 1614).</p>
 *
 * {@link https://www.esri.com/arcgis-blog/products/arcgis-pro/mapping/mercator-its-not-hip-to-be-square/ Mercator texture coordinates}
 * can be set in a {@link module:polyhedron.setMercatorCoordinates model} directly or in
 * the <a href="../../showCode.php?f=extras/LightingWithTexture">shader</a>
 * that samples texture coordinates for each pixel.
 *
 * Since a unit sphere fits in the WebGL {@link https://carmencincotti.com/2022-11-28/from-clip-space-to-ndc-space/ NDC space},
 * it is possible to go into each fragment from:
 * <ul>
 *   <li> cartesian → spherical (equirectangular) → Mercator </li>
 *   <li> (x, y, z) → (long, lat) → (x, y) </li>
 *   <li> sample texture at (x, y)</li>
 * </ul>
 *
 * The {@link https://en.wikipedia.org/wiki/Equirectangular_projection equirectangular projection},
 * also known as the equidistant cylindrical projection (e.g., plate carrée),
 * is a way of representing the Earth's surface on a flat plane, and
 * maps longitude and latitude lines into straight, evenly spaced lines,
 * essentially flattening the sphere into a rectangle.
 *
 * <p>Its meridian scale is 1 meaning that the distance along lines of longitude
 * remains the same across the map, while its parallel
 * {@link https://en.wikipedia.org/wiki/Scale_(map) scale} varies with latitude,
 * which means that the distance along lines of latitude is stretched by a factor of sec(φ).
 *
 * {@link https://en.wikipedia.org/wiki/Ptolemy Ptolemy} claims that
 * {@link https://en.wikipedia.org/wiki/Marinus_of_Tyre Marinus of Tyre}
 * invented the projection in the first century (AD 100).
 * The projection is neither equal area nor conformal.
 * In particular, the plate carrée (<em>flat square</em>) has become a standard for
 * {@link https://gisgeography.com/best-free-gis-data-sources-raster-vector/ global raster datasets}.</p>
 *
 * <p><u>As a final remark</u>, I thought it would be easier to deal with map images as textures, but I was mistaken. I tried, as long as I could,
 * not to rewrite third-party code. Unfortunately, this was impossible. The main issue was that the
 * {@link https://en.wikipedia.org/wiki/Prime_meridian prime meridian} is
 * at the center of a map image and not at its border, which corresponds to
 * its {@link https://en.wikipedia.org/wiki/180th_meridian antimeridian}. </p>
 *
 * <p>Initially, I used the {@link https://math.hws.edu/graphicsbook/demos/script/basic-object-models-IFS.js basic-object-models-IFS} package,
 * but the models had their z-axis pointing up as the {@link https://en.wikipedia.org/wiki/Zenith zenith},
 * and I wanted the y-axis to be the north pole (up).
 * Therefore, I switched to {@link getModelData Three.js}, and almost everything
 * worked just fine. Nonetheless, a sphere created by subdividing a {@link https://threejs.org/docs/#api/en/geometries/PolyhedronGeometry polyhedron}
 * had its {@link module:polyhedron.rotateUTexture texture coordinates} rotated by 180°
 * and a cylinder or cone by 90°. In fact, there is a poorly documented parameter,
 * {@link https://threejs.org/docs/#api/en/geometries/ConeGeometry thetaStart}, that <u>does fix</u> just that.</p>
 *
 * <p>Nevertheless, I decided to adapt the {@link https://math.hws.edu/graphicsbook/ hws} software
 * to my needs by introducing a global hook, {@link yNorth},
 * and {@link setNorth rotating} the models accordingly. Furthermore, I added the parameter <u>stacks</u> to {@link uvCone} and {@link uvCylinder},
 * to improve interpolation and fixed the number of triangles generated in uvCone. This way, the set of models in hws and
 * three.js became quite similar, although I kept the "<i>zig-zag</i>" mesh for cones and cylinders in hws
 * (I have no idea whether it provides any practical advantage).
 * A user can switch between hws and three.js models by pressing a single key (Alt, ❖ or ⌘) in the interface.</p>
 *
 * <p>There is a lot of redundancy in the form of {@link https://stackoverflow.com/questions/36179507/three-js-spherebuffergeometry-why-so-many-vertices vertex duplication}
 * in all of these models, which may preclude mipmapping
 * artifacts. The theoretical number of vertices, <mark>𝑣</mark>, for a {@link https://en.wikipedia.org/wiki/Manifold manifold model}
 * and the actual number of vertices (🔴) are {@link createModel displayed} in the interface.
 * The number of edges, <i>e</i>, is simply three times the number of triangles, <i>t</i>, divided by two.</p>
 *
 * For any triangulation of a {@link https://en.wikipedia.org/wiki/Surface_(topology) compact surface},
 * the <a href="https://link.springer.com/book/9780387902715">following holds</a> (page=52):
 * <ul>
 * <li><i>2e = 3t</i>,</li>
 * <li><i>e = 3(<mark>𝑣</mark> - <a href="../doc/Eulers_Map_Theorem.pdf">χ</a>), χ(S²)=2</i>,</li>
 * <li>𝑣 &ge; 1/2 (7 + √(49 - 24χ)).</li>
 * </ul>
 *
 * <p>As a proof of concept, I implemented a {@link uvSphereND sphere} model without any vertex duplication.
 * Besides being much harder to code, its last slice (e.g., slices = 48) goes from 6.152285613280011 (2π/48 * 47) to 0.0
 * and not 2π (if there was an extra duplicate vertex), which generates texture coordinates
 * going from 0.9791666666666666 (47/48) to 0.0 and not 1.0.
 * Although this is what causes the mipmapping artifacts, it has nothing to do with the topology of the model
 * but how mimapping is {@link https://developer.nvidia.com/gpugems/gpugems2/part-iii-high-quality-rendering/chapter-28-mipmap-level-measurement implemented} on the GPU.</p>
 *
 * Of course, these are just {@link https://en.wikipedia.org/wiki/Polygon_mesh polygon meshes} suitable for visualization
 * and not valid topological {@link https://en.wikipedia.org/wiki/Boundary_representation B-rep}
 * models that enforce the {@link https://www.britannica.com/science/Euler-characteristic Euler characteristic}
 * by using the {@link https://people.computing.clemson.edu/~dhouse/courses/405/papers/p589-baumgart.pdf winged-edge},
 * {@link https://dl.acm.org/doi/pdf/10.1145/282918.282923 quad-edge},
 * or <a href="../doc/TeseKevinWeiler.pdf">radial-edge</a> data structures required in
 * {@link https://www.sciencedirect.com/science/article/abs/pii/S0010448596000668?via%3Dihub solid modeling}.
 *
 * <p><b>{@link https://www.youtube.com/watch?v=Otm4RusESNU Homework}</b>:</p>
 *
 * <ol>
 * <li>The application selects a random {@link gpsCoordinates city} and displays its location (when its name is checked in the interface)
 * as the intersection of its line of latitude (parallel) and line of longitude (meridian) on the model surface (preferably a map onto a sphere).
 * Your task is to pick a point in the texture image (using the mouse or any pointer device) and display its location
 * on the texture image (map) and on the 3D model.
 * <ul>
 *   <li>To do this, you need to convert the pixel coordinates of the mouse pointer into texture coordinates (u, v), then
 *   into {@link spherical2gcs GCS} coordinates (longitude, latitude) using the {@link currentLocation}, and
 *   optionally {@link module:polyhedron.spherical2Mercator transforming} them to Mercator coordinates.</li>
 *   <li>To draw the lines, use the {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo lineTo()} from
 *       HTML5 by placing an element &lt;canvas&gt; on top of the element &ltimg&gt.</li>
 *   <li>This is simple to accomplish by {@link https://stackoverflow.com/questions/14824747/overlay-html5-canvas-over-image nesting}
 *       the &lt;canvas&gt; element with {@link https://developer.mozilla.org/en-US/docs/Web/CSS/position position}
 *       absolute in a &lt;div&gt; element with position relative and the {@link newTexture same size} as the image element.</li>
 *   <li>The &lt;canvas&gt; element should have a higher {@link https://developer.mozilla.org/en-US/docs/Web/CSS/z-index z-index}
 *       than the image element and ignore
 *       {@link https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events pointer events}.</li>
 *    <li>Finally, define a {@link event:pointerdown-textimg pointerdown} event handler to set
 *        the {@link currentLocation} as the {@link gpsCoordinates} "Unknown" and draw the lines
 *        by calling {@link drawLinesOnImage} in {@link draw}.</li>
 * </ul>
 * </li>
 *
 * <li>A bigger challenge would be to pick the point directly onto the model's surface, but you'll have to implement a 3D pick in this case
 *     by casting a ray and finding its closest (first) intersection (relative to the viewer) with the polygonal surface of the model.</li>
 * <ul>
 *  <li>The easiest way is shooting the ray from the mouse position and intersecting it against the surface of an implicit sphere
 *      by {@link lineSphereIntersection solving} a {@link https://en.wikipedia.org/wiki/Line–sphere_intersection second-degree equation}.</li>
 *  <li>The other way is to intersect the ray against each face of the polygonal surface by testing if the ray intersects the plane
 *      of a face and then checking if the intersection point is inside the corresponding triangle.</li>
 *  <li>We select a position on the globe by {@link event:pointerdown-theCanvas clicking} the right mouse button in the WebGL canvas.</li>
 * </ul>
 *
 * <li>
 * To determine a ship's latitude at sea without a {@link https://en.wikipedia.org/wiki/Global_Positioning_System GPS},
 * it is necessary to have a {@link https://www.youtube.com/watch?v=00ZEIZsl5xk sextant}.
 * What is necessary to get the ship's longitude?
 * What calculation should be done (it is simpler than you might think)?
 * </li>
 * <li>
 * What does the obliquity of the earth have to do with the {@link https://en.wikipedia.org/wiki/Timeline_of_glaciation glacial} periods?
 * </li>
 * </ol>
 *
 * @author {@link https://krotalias.github.io Paulo Roma}
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}.
 * @copyright © 2024 Paulo R Cavalcanti.
 * @since 30/01/2016
 * @see <a href="/cwdc/13-webgl/extras/LightingWithTexture.html">link</a> - Texture coordinates sampled at each pixel in the {@link https://raw.githubusercontent.com/krotalias/cwdc/main/13-webgl/extras/LightingWithTexture.html fragment shader}
 * @see <a href="/cwdc/13-webgl/extras/LightingWithTexture2.html">link2</a> - Texture coordinates sampled at each vertex in the {@link https://raw.githubusercontent.com/krotalias/cwdc/main/13-webgl/extras/LightingWithTexture2.html vertex shader}
 * @see <a href="/cwdc/13-webgl/extras/LightingWithTexture.js">source</a>
 * @see <a href="/cwdc/13-webgl/extras/textures">textures</a>
 * @see <a href="https://math.rice.edu/~polking/cartography/cart.pdf">Mapping the Sphere<a/>
 * @see <a href="../doc/Apostol - A Fresh Look at the Method of Archimedes.pdf">A Fresh Look at the Method of Archimedes</a>
 * @see <a href="https://djalil.chafai.net/blog/wp-content/uploads/2011/11/Letac-From-Archimedes-to-Statistics-The-area-of-the-sphere.pdf">From Archimedes to statistics: the area of the sphere</a>
 * @see <a href="https://cuhkmath.wordpress.com/2018/01/05/archimedes-and-the-area-of-sphere/">Archimedes and the area of sphere</a>
 * @see <a href="https://arxiv.org/pdf/1905.11214">On some information geometric structures concerning Mercator projections</a>
 * @see <a href="https://math.uit.no/ansatte/dennis/MoMS2017-Lec3.pdf">The Mathematics of Maps</a>
 * @see <a href="https://kartoweb.itc.nl/geometrics/Map projections/mappro.html">Map projections</a>
 * @see {@link https://paulbourke.net/dome/distortion/ "Distortion", the incorrect and correct usage of the word}
 * @see {@link https://ccv.eng.wayne.edu/reference/mercator-15dec2015.pdf#page=35 The Mercator Projections}
 * @see {@link https://personal.math.ubc.ca/~israel/m103/mercator/mercator.html The Mercator Projection from a Historic Point of View}
 * @see {@link https://www.sco.wisc.edu/2022/01/21/how-big-is-a-degree/ How Big is a Degree?}
 * @see {@link https://bestcase.wordpress.com/2014/05/18/the-mercator-saga-part-1/ The Mercator Saga (part 1)}
 * @see <a href="https://globe-3d-2m2vlb3ft.now.sh">Globe 3D</a>
 * @see <a href="https://en.wikipedia.org/wiki/Earth's_circumference">Earth's circumference</a>
 * @see {@link https://www.thetruesize.com/ The True Size of ...}
 * @see {@link https://truesizeofcountries.com/ The True Size of Countries}
 * @see {@link https://github.com/wbkd/leaflet-truesize leaflet-truesize plugin}
 * @see {@link https://en.wikipedia.org/wiki/Sextant Navigational Sextant}
 * @see {@link https://www.youtube.com/c/CasualNavigationAcademy CasualNavigationAcademy}
 * @see <iframe title="Mercator World Map" style="width: 970px; height: 600px; transform-origin: 70px 80px; transform: scale(0.45);" src="/cwdc/13-webgl/extras/LightingWithTexture2.html"></iframe>
 * @see <iframe title="Equirectangular World Map" style="position: relative; top: -280px; margin-bottom: -600px; width: 970px; height: 600px; transform-origin: 70px 0px; transform: scale(0.45);" src="/cwdc/13-webgl/extras/LightingWithTexture.html"></iframe>
 * @see <figure>
 *      <img src="../images/teapot.png" height="310" title="Utah teapot">
 *      <img src="../textures/check1024border.png" title="1024x1024 checkboard texture" height="310">
 *      <img src="../images/sphere2.png" height="309" title="Sphere">
 *      <img src="../textures/uv_grid_opengl.jpg" title="1024x1024 grid texture" height="310">
 *      <figcaption style="font-size: 200%">{@link cartesian2Spherical North Pole - Y axis}</figcaption>
 *      </figure>
 * @see <figure>
 *      <img src="../textures/BigEarth.jpg" height="340" title="earth from nasa">
 *      <img src="../images/spherical-projection.png" height="340" title="spherical projection">
 *      <figcaption style="font-size: 200%">
 *      <a href="https://en.wikipedia.org/wiki/Equirectangular_projection">Equirectangular projection</a>
 *      </figcaption>
 *      </figure>
 * @see <figure>
 *      <img src="../images/mercator-projection-world-map-political.png" height="340" title="mercator world map">
 *      <img src="../images/Globe-Earth-land-distortion-projection-Mercator-latitudes.jpg" height="340" title="mercator projection">
 *      <figcaption style="font-size: 200%">
 *      <a href="https://www.britannica.com/science/Mercator-projection">Mercator Projection</a><br>
 *      <a href="https://www.youtube.com/watch?v=kIID5FDi2JQ&pp=0gcJCdgAo7VqN5tD">(not a cylindrical <u>radial</u> projection)</a>
 *      </figcaption>
 *      </figure>
 * @see <figure>
 *      <img src="../images/twoproj.gif" title="mercator projection">
 *      <figcaption style="font-size: 200%">
 *      <a href="https://www.youtube.com/watch?v=CPQZ7NcQ6YQ">Wrong (left) x Correct (right)</a>
 *      </figcaption>
 *      </figure>
 * @see <figure>
 *      <img src="../images/country-sizes.png" height="512" title="mercator world map">
 *      <figcaption style="font-size: 200%">
 *      <a href="https://engaging-data.com/country-sizes-mercator/">Real Country Sizes Shown on Mercator Projection</a>
 *      </figcaption>
 *      </figure>
 * @see  <figure>
 *      <img src="../images/sphere-earth.png" height="340" title="equirectangular projection">
 *      <img src="../images/teapot-earth.png" height="340" title="sphere projected onto a teapot">
 *      <figcaption style="font-size: 200%"><a href="https://people.computing.clemson.edu/~dhouse/courses/405/notes/texture-maps.pdf">Spherical (Equirectangular) Projection</a></figcaption>
 *      </figure>
 * @see <figure>
 *      <img src="../images/aliasing-no-correction.png" height="340" title="spherical mapping discontinuity">
 *      <img src="../images/GB.png" height="340" title="GhostBusters Seam">
 *      <figcaption style="font-size: 200%">{@link module:polyhedron.Polyhedron#tetrahedron Subdivision Sphere} Seam -
 *        <a href="https://vcg.isti.cnr.it/Publications/2012/Tar12/jgt_tarini.pdf">Mipmapping Artifact</a></figcaption>
 *      </figure>
 * @see <figure>
 *      <img src="../images/north-pole-seam.png" height="340" title="world-map-mercator.jpg">
 *      <img src="../images/north-pole-seam2.png" height="340" title="uv_grig512.jpg">
 *      <figcaption style="font-size: 200%">{@link uvSphereND Sphere No Duplication} Seam -
 *        <a href="https://math.hws.edu/graphicsbook/c6/s4.html">north and south pole swirling</a></figcaption>
 *      </figure>
 * @see <figure>
 *      <img src="../images/sphere.png" height="340" title="texture in fragment shader">
 *      <img src="../images/anti-aliasing.png" height="340" title="sampling by pixel"><br>
 *      <img src="../images/Gordon_River.png" height="340" title="Gordon River">
 *      <img src="../images/Milla.png" height="340" title="Milla Jovovich">
 *      <figcaption style="font-size: 200%">{@link https://learnopengl.com/Getting-started/Textures Texture Sampled} in
 *        <a href="/cwdc/13-webgl/showCode.php?f=extras/LightingWithTexture">Fragment Shader</a></figcaption>
 *      <figure>
 */

"use strict";

// import * as THREE from "three";
// import { TeapotGeometry } from "TeapotGeometry";
import * as THREE from "/cwdc/13-webgl/lib/three.module.js";
import { TeapotGeometry } from "/cwdc/13-webgl/lib/TeapotGeometry.js";
import {
  nsegments,
  limit,
  pointsOnParallel,
  pointsOnMeridian,
  setMercatorCoordinates,
  rotateUTexture,
  Polyhedron,
  mercator2Spherical,
  spherical2Mercator,
  cartesian2Spherical,
  spherical2Cartesian,
} from "/cwdc/13-webgl/lib/polyhedron.js";
import {
  vec3,
  vec4,
  mat3,
  mat4,
  glMatrix,
} from "/cwdc/13-webgl/lib/gl-matrix/dist/esm/index.js";

/**
 * 4x4 Matrix
 * @type {glMatrix.mat4}
 * @name mat4
 * @see {@link https://glmatrix.net/docs/module-mat4.html glMatrix.mat4}
 */

/**
 * 3x3 Matrix
 * @type {glMatrix.mat3}
 * @name mat3
 * @see {@link https://glmatrix.net/docs/module-mat3.html glMatrix.mat3}
 */

/**
 * gl-matrix {@link https://glmatrix.net/docs/module-vec3.html 3 Dimensional Vector}.
 * @name vec3
 * @type {glMatrix.vec3}
 */

/**
 * gl-matrix {@link https://glmatrix.net/docs/module-vec4.html 4 Dimensional Vector}.
 * @name vec4
 * @type {glMatrix.vec4}
 */

/**
 * Convert degrees to radians.
 * @param {Number} a angle in degrees.
 * @return {Number} angle in radians.
 * @function
 * @see {@link https://glmatrix.net/docs/module-glMatrix.html glMatrix.toRadian}
 */
const toRadian = glMatrix.toRadian;

/**
 * Convert spherical coordinates to {@link https://en.wikipedia.org/wiki/Geographic_coordinate_system geographic coordinate system}
 * (longitude, latitude).
 * @param {Object<{s:Number,t:Number}>} uv spherical coordinates ∈ [0,1]}.
 * @return {Object<{longitude: Number, latitude: Number}>} longitude ∈ [-180,180], latitude ∈ [-90,90].
 * @function
 */
const spherical2gcs = (uv) => {
  // Convert UV coordinates to longitude and latitude
  return {
    longitude: uv.s * 360 - 180,
    latitude: uv.t * 180 - 90,
  };
};

/**
 * Convert from {@link https://en.wikipedia.org/wiki/Geographic_coordinate_system geographic coordinate system}
 * (longitude, latitude) to spherical coordinates.
 * @param {Object<{longitude:Number,latitude:Number}>} gcs longitude ∈ [-180,180], latitude ∈ [-90,90].
 * @return {Object<{s: Number, t: Number}>} spherical coordinates ∈ [0,1].
 * @function
 */
const gcs2Spherical = (gcs) => {
  // Convert longitude and latitude to spherical coordinates.
  return {
    s: (gcs.longitude + 180) / 360,
    t: (gcs.latitude + 90) / 180,
  };
};

/**
 * Three.js module.
 * @author Ricardo Cabello ({@link https://coopermrdoob.weebly.com/ Mr.doob})
 * @since 24/04/2010
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}
 * @external three
 * @see {@link https://threejs.org/docs/#manual/en/introduction/Installation Installation}
 * @see {@link https://discoverthreejs.com DISCOVER three.js}
 * @see {@link https://riptutorial.com/ebook/three-js Learning three.js}
 * @see {@link https://github.com/mrdoob/three.js github}
 * @see {@link http://cindyhwang.github.io/interactive-design/Mrdoob/index.html An interview with Mr.doob}
 * @see {@link https://experiments.withgoogle.com/search?q=Mr.doob Experiments with Google}
 * @see <a href="/cwdc/13-webgl/lib/three.txt">Notes</a>
 */

/**
 * <p>Main three.js namespace.</p>
 * <a href="/cwdc/13-webgl/examples/three/content/doc-example/index.html">Imported</a> from {@link external:three three.module.js}
 *
 * @namespace THREE
 */

/**
 * <p>A representation of mesh, line, or point geometry.</p>
 * Includes vertex positions, face indices, normals, colors, UVs,
 * and custom attributes within buffers, reducing the cost of
 * passing all this data to the GPU.
 * @class BufferGeometry
 * @memberof THREE
 * @see {@link https://threejs.org/docs/#api/en/core/BufferGeometry BufferGeometry}
 */

// default texture
const defTexture = document
  .getElementById("textures")
  .querySelector("[selected]");

/**
 * Array holding image file names to create textures from.
 * @type {Array<String>}
 */
const imageFilename = [defTexture ? defTexture.text : "BigEarth.jpg"];

/**
 * Current texture index.
 * @type {Number}
 */
let textureCnt = defTexture ? +defTexture.value : 0;

/**
 * Indicates whether not use the texture from the model.
 * @type {Boolean}
 */
let noTexture;

/**
 * Texture image.
 * @type {HTMLImageElement}
 * @see {@link ImageLoadCallback}
 */
let image;

/**
 * Maximum Number of subdivisions to turn a polyhedron into a sphere.
 * @type {Number}
 */
let maxSubdivisions = limit.dod;

/**
 * Number of subdivisions to turn a polyhedron into a sphere.
 * @type {Number}
 */
let numSubdivisions = 0;

/**
 * Scale applied to a model to make its size adequate for rendering.
 * @type {Number}
 */
let mscale = 1;

/**
 * GPS coordinates of the city location to be drawn.
 * @type {Object<String:Object<{latitude:Number,longitude:Number}>>}
 */
const gpsCoordinates = {
  Null_Island: {
    latitude: 0,
    longitude: 0,
  },
  Rio: {
    latitude: -22.9068,
    longitude: -43.1729,
  },
  NYC: {
    latitude: 40.7128,
    longitude: -74.006,
  },
  Syracuse: {
    latitude: 37.075474,
    longitude: 15.286586,
  },
  Calgary: {
    latitude: 51.049999,
    longitude: -114.066666,
  },
  Ames: {
    latitude: 42.034534,
    longitude: -93.620369,
  },
  Rome: {
    latitude: 41.902782,
    longitude: 12.496366,
  },
  Berlin: {
    latitude: 52.520008,
    longitude: 13.404954,
  },
  Hawaii: {
    latitude: 21.3068,
    longitude: -157.7912,
  },
  Tokyo: {
    latitude: 35.6762,
    longitude: 139.6503,
  },
  Sydney: {
    latitude: -33.8688,
    longitude: 151.2093,
  },
  Unknown: {
    latitude: 0,
    longitude: 0,
  },
};

/**
 * Name of the current city location.
 * @type {String}
 */
let currentLocation =
  Object.keys(gpsCoordinates)[
    Math.floor(Math.random() * Object.keys(gpsCoordinates).length)
  ];

/**
 * Display status of the model mesh, texture, axes and paused animation: on/off.
 * @type {Object<{lines:Boolean, texture:Boolean, axes:Boolean, paused:Boolean, intrinsic:Boolean, equator:Boolean, hws:Boolean}>}
 */
const selector = {
  lines: document.getElementById("mesh").checked,
  texture: document.getElementById("texture").checked,
  axes: document.getElementById("axes").checked,
  paused: document.getElementById("pause").checked,
  intrinsic: document.getElementById("intrinsic").checked,
  equator: document.getElementById("equator").checked,
  hws: document.getElementById("hws").checked,
  tooltip: true,
};

/**
 * Arcball.
 * @type {SimpleRotator}
 */
let rotator;

/**
 * Vertex coordinates for creating the axes.
 * @type {Float32Array}
 */
// prettier-ignore
const axisVertices = new Float32Array([
  0.0, 0.0, 0.0,
  1.5, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 1.5, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 1.5
]);

/**
 * Colors for creating the axes.
 * @type {Float32Array}
 */
// prettier-ignore
const axisColors = new Float32Array([
  1.0, 0.0, 0.0, 1.0,
  1.0, 0.0, 0.0, 1.0,
  0.0, 1.0, 0.0, 1.0,
  0.0, 1.0, 0.0, 1.0,
  0.0, 0.0, 1.0, 1.0,
  0.0, 0.0, 1.0, 1.0
]);

// A few global variables...

/**
 * <p>Light properties.</p>
 * Ambient, diffuse and specular.
 * <p>Remember this is column major.</p>
 * @type {Object<String:Float32Array>}
 */
// prettier-ignore
const lightPropElements = {
  // generic white light.
  white_light: new Float32Array([
                    0.5, 0.5, 0.5,
                    0.7, 0.7, 0.7,
                    0.7, 0.7, 0.7
  ]),

  // blue light with red specular highlights
  // (because we can)
  blue_red: new Float32Array([
                0.2, 0.2, 0.2,
                0.0, 0.0, 0.7,
                0.7, 0.0, 0.0
  ])
};

/**
 * <p>Material properties.</p>
 * Ambient, diffuse and specular.
 * <p>Remember this is column major.</p>
 * @type {Object<String:Float32Array>}
 * @see {@link http://devernay.free.fr/cours/opengl/materials.html OpenGL/VRML Materials}
 * @see {@link https://docs.unity3d.com/Manual/StandardShaderMaterialCharts.html Material charts}
 */
// prettier-ignore
const matPropElements = {
  shiny_brass: new Float32Array([
                0.33, 0.22, 0.03,
                0.78, 0.57, 0.11,
                0.99, 0.91, 0.81
  ]),

  shiny_green_plastic: new Float32Array([
                        0.3, 0.3, 0.3,
                        0.0, 0.8, 0.0,
                        0.8, 0.8, 0.8
  ]),

  // very fake looking white
  // useful for testing lights
  fake_white: new Float32Array([
                  1, 1, 1,
                  1, 1, 1,
                  1, 1, 1
  ]),

  // clay or terracotta
  clay: new Float32Array([
        0.75, 0.38, 0.26,
        0.75, 0.38, 0.26,
        0.25, 0.20, 0.15 // weak specular highlight similar to diffuse color
  ]),
};

/**
 * <p>Specular term exponent used in the
 * {@link https://en.wikipedia.org/wiki/Phong_reflection_model Phong reflection model}.</p>
 * One entry for each material property.
 * @type {Array<Number>}
 */
const shininess = [28.0, 30, 20.0, 10.0, 200];

/**
 * The OpenGL context.
 * @type {WebGL2RenderingContext}
 */
let gl;

/**
 * Current model data.
 * @type {modelData}
 */
let theModel;

/**
 * Array with normal end points.
 * @type {Float32Array}
 */
let normal;

/**
 * Array with edges end points.
 * @type {Float32Array}
 */
let lines;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let vertexBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let vertexNormalBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let texCoordBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let indexBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let axisBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let normalBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let lineBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let parallelBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let meridianBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let axisColorBuffer;

/**
 * Handle to the texture object on the GPU.
 * @type {WebGLTexture}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createTexture createTexture() method}
 */
let textureHandle;

/**
 * Handle to the compiled shader program on the GPU.
 * @type {WebGLShader}
 */
let lightingShader;

/**
 * Handle to the compiled shader program on the GPU.
 * @type {WebGLShader}
 */
let colorShader;

/**
 * Model matrix.
 * @type {mat4}
 */
let modelMatrix = mat4.create();

/**
 * Rotation axis.
 * @type {String}
 */
let axis = document.querySelector('input[name="rot"]:checked').value;

/**
 * Whether uv spherical coordinates should be "fixed",
 * when converted from cartesian
 * {@link https://vcg.isti.cnr.it/Publications/2012/Tar12/jgt_tarini.pdf (seamless)}.
 * @type {Boolean}
 * @see {@link https://forum.unity.com/threads/what-is-this-mipmap-artifact.657052/ What is this mipmap artifact?}
 * @see {@link https://bgolus.medium.com/distinctive-derivative-differences-cce38d36797b Distinctive Derivative Differences}
 */
let fixuv = document.querySelector("#fixuv").checked;

/**
 * Whether to use a
 * {@link https://en.wikipedia.org/wiki/Mercator_projection Mercator projection}.
 * @type {Boolean}
 * @see {@link https://globe-3d-2m2vlb3ft.now.sh Globe}
 * @see {@link https://forum.unity.com/threads/unity-shader-map-projection-mercator-to-equirectangular-or-lambert-azimuthal-equal-area.813987/ Unity shader, Mercator to equirectangular}
 */
let mercator = document.querySelector("#mercator").checked;

/**
 * Toggle back face culling on/off.
 * @type {Boolean}
 * @see {@link https://learnopengl.com/Advanced-OpenGL/Face-culling Face culling}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace frontFace() method}
 */
let culling = true;

/**
 * Camera position.
 * @type {vec3}
 */
const eye = vec3.fromValues(0, 0, 5.5);
// const eye = vec3.fromValues(1.77, 3.54, 3.0);

/**
 * <p>Light Position.</p>
 * Phong illumination model will highlight
 * the projection of this position
 * on the current model.
 * <p>In the case of a sphere, it will trace the equator,
 * if no other rotation is applied by the user.</p>
 * @type {Array<Number>}
 */
const lightPosition = [0.0, 0.0, 10.0, 1.0];
// const lightPosition = [2.0, 4.0, 2.0, 1.0];

/**
 * View matrix.
 * @type {mat4}
 * @see <a href="/cwdc/downloads/apostila.pdf#page=109">View matrix</a>
 * @see <a href="/cwdc/downloads/PDFs/06_LCG_Transformacoes.pdf">Mudança de Base</a>
 * @see <a href="https://en.wikipedia.org/wiki/Change_of_basis">Change of Basis</a>
 * @see {@link https://learn.microsoft.com/en-us/windows/win32/direct3d9/view-transform View Transform (Direct3D 9)}
 * @see {@link https://www.youtube.com/watch?v=6Xn1l7_HYfU Changes in Obliquity}
 * @see {@link https://www.khanacademy.org/science/cosmology-and-astronomy/earth-history-topic/earth-title-topic/v/milankovitch-cycles-precession-and-obliquity Milankovitch cycles precession and obliquity}
 */
// prettier-ignore
const viewMatrix = mat4.lookAt(
  [],
  eye,
  // at - looking at the origin
  vec3.fromValues(0, 0, 0),
  // up vector - y axis tilt (obliquity)
  vec3.transformMat4([],vec3.fromValues(0, 1, 0),mat4.fromZRotation([], toRadian(23.44))),
);

/**
 * Projection matrix.
 * @type {mat4}
 */
const projection = mat4.perspectiveNO([], toRadian(30), 1.5, 0.1, 1000);

/**
 * <p>Promise for returning an array with all file names in directory './textures'.</p>
 *
 * <p>Calls a php script via ajax, since Javascript doesn't have access to the filesystem.</p>
 * Please, note that php runs on the server, and javascript on the browser.
 * @type {Promise<Array<String>>}
 * @see <a href="/cwdc/6-php/readFiles_.php">files</a>
 * @see {@link https://stackoverflow.com/questions/31274329/get-list-of-filenames-in-folder-with-javascript Get list of filenames in folder with Javascript}
 * @see {@link https://api.jquery.com/jquery.ajax/ jQuery.ajax()}
 */
const readFileNames = new Promise((resolve, reject) => {
  $.ajax({
    type: "GET",
    url: "/cwdc/6-php/readFiles_.php",
    data: {
      dir: "/cwdc/13-webgl/extras/textures",
    },
  })
    .done(function (fileNames) {
      resolve(JSON.parse(fileNames));
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.log(
        `[jqResponse: ${JSON.stringify(
          jqXHR,
          null,
          4,
        )}], \n[status: ${textStatus}], \n[error: ${errorThrown}]`,
      );
      console.log("Could not get data");
      reject("Could not get data");
    });
});

/**
 * <p>Matrix for taking normals into eye space.</p>
 * Return a matrix to transform normals, so they stay
 * perpendicular to surfaces after a linear transformation.
 * @param {mat4} model model matrix.
 * @param {mat4} view view matrix.
 * @returns {mat3} (𝑀<sup>&#8211;1</sup>)<sup>𝑇</sup> - 3x3 normal matrix (transpose inverse) from the 4x4 modelview matrix.
 * @see <a href="/cwdc/13-webgl/extras/doc/gdc12_lengyel.pdf#page=48">𝑛′=(𝑀<sup>&#8211;1</sup>)<sup>𝑇</sup>⋅𝑛</a>
 */
function makeNormalMatrixElements(model, view) {
  const modelview = mat4.multiply([], view, model);
  return mat3.normalFromMat4([], modelview);
}

/**
 * Translate keydown events to strings.
 * @param {KeyboardEvent} event keyboard event.
 * @return {String | null}
 * @see http://javascript.info/tutorial/keyboard-events
 */
function getChar(event) {
  event = event || window.event;
  const charCode = event.key || String.fromCharCode(event.which);
  return charCode;
}

/**
 * Updates the label (latitude, longitude and secant)
 * of the given {@link gpsCoordinates location}.
 * @param {String} location name of the location.
 */
function labelForLocation(location) {
  const lat = gpsCoordinates[location].latitude;
  const lon = gpsCoordinates[location].longitude;
  const sec = 1 / Math.cos(toRadian(lat));
  $('label[for="equator"]').html(
    `<i>${currentLocation}</i> (lat: ${lat.toFixed(5)},
    long: ${lon.toFixed(5)}, sec(lat): ${sec.toFixed(2)})`,
  );
}

/**
 * <p>Closure for keydown events.</p>
 * Chooses a {@link theModel model} and which {@link axis} to rotate around.<br>
 * The {@link numSubdivisions subdivision level} is {@link maxSubdivisions limited}
 * for a chosen subdivision polyhedron.<br>
 * When a new texture is selected, triggers callback {@link image} load event.
 * @param {KeyboardEvent} event keyboard event.
 * @function
 * @return {key_event} callback for handling a keyboard event.
 */
const handleKeyPress = ((event) => {
  const mod = (n, m) => ((n % m) + m) % m;
  const cities = Object.keys(gpsCoordinates);
  const kbd = document.getElementById("kbd");
  const opt = document.getElementById("options");
  const models = document.getElementById("models");
  let zoomfactor = 0.7;
  let gscale = 1;
  let subPoly = 0;
  let tri;
  let n;
  const poly = {
    d: 0,
    i: 1,
    o: 2,
    w: 3,
  };

  /**
   * <p>Handler for keydown events.</p>
   * @param {KeyboardEvent} event keyboard event.
   * @callback key_event callback to handle a key pressed.
   */
  return (event) => {
    const ch = getChar(event);
    switch (ch) {
      case "m":
      case "M":
        const inc = ch == "m" ? 1 : -1;
        numSubdivisions = mod(numSubdivisions + inc, maxSubdivisions + 1);
        gscale = mscale = 1;
        if (numSubdivisions == 0) {
          models.value = (subPoly + 9).toString();
        } else {
          models.value = "13";
        }
        theModel = createModel({ poly: subPoly });

        tri = theModel.ntri(numSubdivisions);
        kbd.innerHTML = `
          (${theModel.name}
          level ${theModel.level(tri)} →
          ${tri} triangles):`;
        break;
      case " ":
        selector.paused = !selector.paused;
        document.getElementById("pause").checked = selector.paused;
        if (axis === " ") axis = "y";
        if (!selector.paused) document.getElementById(axis).checked = true;
        animate();
        return;
      case "l":
        selector.lines = !selector.lines;
        if (!selector.lines) selector.texture = true;
        document.getElementById("mesh").checked = selector.lines;
        document.getElementById("texture").checked = selector.texture;
        break;
      case "k":
        selector.texture = !selector.texture;
        if (!selector.texture) selector.lines = true;
        document.getElementById("texture").checked = selector.texture;
        document.getElementById("mesh").checked = selector.lines;
        break;
      case "a":
        selector.axes = !selector.axes;
        document.getElementById("axes").checked = selector.axes;
        break;
      case "x":
      case "y":
      case "z":
        axis = ch;
        selector.paused = false;
        document.getElementById(axis).checked = true;
        animate();
        break;
      case "I":
        selector.intrinsic = true;
        document.getElementById("intrinsic").checked = true;
        animate();
        break;
      case "e":
        selector.intrinsic = false;
        document.getElementById("extrinsic").checked = true;
        animate();
        break;
      case "E":
        selector.equator = !selector.equator;
        document.getElementById("equator").checked = selector.equator;
        animate();
        break;
      case "Z":
        gscale = mscale = 1;
        models.value = "5";
        n = numSubdivisions;
        numSubdivisions = 1;
        theModel = createModel({
          shape: uvSphereND(1, 48, 24),
          name: "spherend",
        });
        numSubdivisions = n;
        break;
      case "s":
        gscale = mscale = 1;
        models.value = "5";
        theModel = createModel({
          shape: selector.hws
            ? uvSphere(1, 48, 24)
            : getModelData(new THREE.SphereGeometry(1, 48, 24)),
          name: "sphere",
        });
        break;
      case "S":
        // subdivision sphere
        gscale = mscale = 1;
        models.value = "13";
        numSubdivisions = maxSubdivisions;
        theModel = createModel({ poly: subPoly });
        tri = theModel.ntri(numSubdivisions);
        kbd.innerHTML = `
          (${theModel.name}
          level ${theModel.level(tri)} →
          ${tri} triangles):`;
        break;
      case "T":
        // (2,3)-torus knot (trefoil knot).
        // The genus of a torus knot is (p−1)(q−1)/2.
        gscale = mscale = 0.6;
        models.value = "8";
        theModel = createModel({
          shape: getModelData(new THREE.TorusKnotGeometry(1, 0.4, 128, 16)),
          name: "torusknot",
          chi: 1,
        });
        break;
      case "t":
        gscale = mscale = 1;
        models.value = "7";
        theModel = createModel({
          shape: selector.hws
            ? uvTorus(1, 0.5, 30, 30)
            : getModelData(new THREE.TorusGeometry(0.75, 0.25, 30, 30)),
          name: "torus",
          chi: 0,
        });
        break;
      case "u":
        // capsule from threejs
        gscale = mscale = 1.2;
        models.value = "0";
        theModel = createModel({
          shape: getModelData(new THREE.CapsuleGeometry(0.5, 0.5, 10, 20)),
          name: "capsule",
        });
        break;
      case "c":
        gscale = mscale = 1;
        models.value = "3";
        const r = mercator ? 3 / 8 : 9 / 16;
        const length = 2 * Math.PI * r;
        let height = mercator ? length : length / 2;
        if (noTexture) height -= r;
        theModel = createModel({
          shape: selector.hws
            ? uvCylinder(r, height, 30, 5, false, false)
            : getModelData(
                new THREE.CylinderGeometry(
                  r,
                  r,
                  height,
                  30,
                  5,
                  false,
                  -Math.PI / 2,
                ),
              ),
          name: "cylinder",
        });
        break;
      case "C":
        gscale = mscale = 0.8;
        models.value = "1";
        theModel = createModel({
          shape: selector.hws
            ? uvCone(1, 2, 30, 5, false)
            : getModelData(
                new THREE.ConeGeometry(1, 2, 30, 5, false, -Math.PI / 2),
              ),
          name: "cone",
        });
        break;
      case "v":
        gscale = mscale = 0.6;
        models.value = "2";
        theModel = createModel({
          shape: selector.hws
            ? cube(2)
            : getModelData(new THREE.BoxGeometry(2, 2, 2)),
          name: "cube",
        });
        break;
      case "p":
        // teapot - this is NOT a manifold model - it is a model with borders!
        gscale = mscale = selector.hws ? 0.09 : 0.7;
        models.value = "6";
        theModel = createModel({
          shape: selector.hws
            ? teapotModel
            : getModelData(
                new TeapotGeometry(1, 10, true, true, true, true, true),
              ),
          name: "teapot",
          chi: null,
        });
        break;
      case "d":
      case "i":
      case "o":
      case "w":
        gscale = mscale = 1;
        subPoly = poly[ch];
        numSubdivisions = 0;
        models.value = (subPoly + 9).toString();
        theModel = createModel({ poly: subPoly });
        kbd.innerHTML = ":";
        break;
      case "r":
        gscale = mscale = 1.0;
        models.value = "4";
        const segments = 30;
        theModel = createModel({
          shape: selector.hws
            ? ring(0.3, 1.0, segments)
            : getModelData(
                new THREE.RingGeometry(0.3, 1.0, segments, 1, 0, 2 * Math.PI),
              ),
          name: "ring",
          chi: segments,
        });
        break;
      case "O":
        mat4.identity(modelMatrix);
        rotator.setViewMatrix(modelMatrix);
        mscale = gscale;
        break;
      case "n":
      case "N":
        const incr = ch == "n" ? 1 : -1;
        textureCnt = mod(textureCnt + incr, imageFilename.length);
        selectTexture(false);
        return;
      case "f":
        fixuv = !fixuv;
        // reload texture with or without fixing
        image.src = `./textures/${imageFilename[textureCnt]}`;
        document.getElementById("fixuv").checked = fixuv;
        setUVfix();
        break;
      case "g":
        mercator = !mercator;
        document.getElementById("mercator").checked = mercator;
        break;
      case "b":
        culling = !culling;
        if (culling) gl.enable(gl.CULL_FACE);
        else gl.disable(gl.CULL_FACE);
        document.getElementById("culling").checked = culling;
        break;
      case "ArrowUp":
        mscale *= zoomfactor;
        mscale = Math.max(gscale * 0.1, mscale);
        break;
      case "ArrowDown":
        mscale /= zoomfactor;
        mscale = Math.min(gscale * 3, mscale);
        break;
      case "Meta":
      case "Alt":
        selector.hws = !selector.hws;
        document.getElementById("hws").checked = selector.hws;
        break;
      case "G":
        const cl = cities.indexOf(currentLocation);
        currentLocation = cities[mod(cl + 1, cities.length)];
        setPosition(currentLocation);
        selector.equator = true;
        document.getElementById("equator").checked = selector.equator;
        labelForLocation(currentLocation);
        animate();
        break;
      case "h":
        selector.tooltip = !selector.tooltip;
        break;
      default:
        return;
    }
    opt.innerHTML = `${gl.getParameter(
      gl.SHADING_LANGUAGE_VERSION,
    )}<br>${gl.getParameter(gl.VERSION)}`;
    if (selector.paused) draw();
  };
})();

/**
 * Draw the meridian and parallel lines at the {@link currentLocation}
 * on the texture image.
 */
function drawLinesOnImage() {
  const canvasimg = document.getElementById("canvasimg");

  const ctx = canvasimg.getContext("2d");
  ctx.clearRect(0, 0, canvasimg.width, canvasimg.height);

  if (selector.equator) {
    const uv = gcs2Spherical(gpsCoordinates[currentLocation]);
    uv.t = 1 - uv.t;
    if (mercator) {
      // mercator projection
      uv.t = spherical2Mercator(uv.s, uv.t).y;
    }

    // screen coordinates
    const x = uv.s * canvasimg.width;
    const y = uv.t * canvasimg.height;

    ctx.beginPath();
    ctx.moveTo(x, 0); // meridian
    ctx.lineTo(x, canvasimg.height);
    ctx.moveTo(0, y); // parallel
    ctx.lineTo(canvasimg.width, y);
    ctx.strokeStyle = "red";
    ctx.stroke();
  }
}

/**
 * <p>Closure for selecting a texture from the menu.</p>
 * Tetrahedra and octahedra may need to be reloaded for
 * getting appropriate texture coordinates:
 * <ul>
 *  <li>mercator x equirectangular.</li>
 * </ul>
 * @function
 * @param {Boolean} getCnt indicates the need of getting textureCnt
 * from &lt;select&gt; element in html.
 */
const selectTexture = (() => {
  const selectElement = document.getElementById("textures");
  const chkMerc = document.getElementById("mercator");
  let previousMercator = undefined;

  return (getCnt = true) => {
    if (getCnt) {
      textureCnt = +selectElement.value;
    }
    image.src = `./textures/${imageFilename[textureCnt]}`;
    mercator = imageFilename[textureCnt].includes("Mercator");
    chkMerc.checked = mercator;

    if (previousMercator != mercator) {
      previousMercator = mercator;
      if (!noTexture) {
        selectModel(); // reload subdivision/sphere model
      }
    }
  };
})();

/**
 * Returns a new keyboard event
 * that can be passed to {@link handleKeyPress}.
 * @param {String} key char code.
 * @returns {KeyboardEvent} a keyboard event.
 */
const createEvent = (key) => {
  const code = key.charCodeAt();
  return new KeyboardEvent("keydown", {
    key: key,
    which: code,
    charCode: code,
    keyCode: code,
  });
};

/**
 * Selects a model from a menu and creates an {@link createEvent event} for it.
 * @see {@link https://encyclopediaofmath.org/wiki/Torus_knot Torus Knot}.
 */
function selectModel() {
  const val = document.getElementById("models").value;
  const key = {
    0: "u", // capsule
    1: "C", // cone
    2: "v", // cube
    3: "c", // cylinder
    4: "r", // ring
    5: "s", // sphere
    6: "p", // teapot
    7: "t", // torus
    8: "T", // knot
    9: "d", // dodecahedron
    10: "i", // icosahedron
    11: "o", // octahedron
    12: "w", // tetrahedron
    13: "S", // subdivision sphere
  };
  handleKeyPress(createEvent(key[val]));
}

/**
 * <p>Maps screen coordinates to object coordinates.</p>
 * @param {Array<Number>} out the receiving vector.
 * @param {vec3} vec 3D vector of screen coordinates.
 * @param {mat4} modelMatrix model matrix.
 * @param {mat4} viewMatrix view matrix.
 * @param {mat4} projectionMatrix projection matrix.
 * @param {Number} width viewport width.
 * @param {Number} height viewport height.
 * @returns {Array<Number>} out.
 * @see {@link https://nickthecoder.wordpress.com/2013/01/17/unproject-vec3-in-gl-matrix-library/ unproject vec3 in gl-matrix library}
 * @see {@link https://dondi.lmu.build/share/cg/unproject-explained.pdf “Unproject” Explained}
 * @see {@link https://math.hws.edu/graphicsbook/c7/s1.html#webgl3d.1.3 Transforming Coordinates}
 */
function unproject(
  out,
  vec,
  modelMatrix,
  viewMatrix,
  projectionMatrix,
  width,
  height,
) {
  // normalized [-1,1]
  const x = (2 * vec[0]) / width - 1;
  const y = (2 * vec[1]) / height - 1;
  const z = vec[2];

  const transform = mat4.multiply(
    [],
    projectionMatrix,
    mat4.multiply([], viewMatrix, modelMatrix),
  );
  const invTransform = mat4.invert([], transform);

  const p = vec4.fromValues(x, y, z, 1);

  // unproject
  vec4.transformMat4(p, p, invTransform);

  // perspective division (dividing by w)
  vec4.scale(p, p, 1 / p[3]);

  out[0] = p[0];
  out[1] = p[1];
  out[2] = p[2];

  return out;
}

/**
 * <p>Find point of intersection between a line and a sphere.</p>
 * The line is defined by its origin and an end point.
 * The sphere is defined by its center and radius.
 * @param {vec3} o ray origin.
 * @param {vec3} p ray end point.
 * @param {vec3} c center of the sphere.
 * @param {Number} r radius of the sphere.
 * @returns {vec3} intersection point.
 * @see {@link https://en.wikipedia.org/wiki/Line–sphere_intersection Line–sphere intersection}
 */
function lineSphereIntersection(o, p, c, r) {
  // line direction
  const u = vec3.normalize([], vec3.subtract([], p, o)); // ||p - o||

  const oc = vec3.subtract([], o, c); // o - c
  const a = vec3.dot(u, oc);
  const b = vec3.dot(oc, oc); // ||oc||^2
  const delta = a * a - b + r * r;
  const sqrt_delta = Math.sqrt(delta);
  const d1 = -a + sqrt_delta;
  const d2 = -a - sqrt_delta;
  let dist;
  if (delta > 0) {
    dist = Math.min(d1, d2);
  } else if (delta == 0) {
    dist = -a;
  } else {
    // no intersection
    return null;
  }

  return vec3.scaleAndAdd([], o, u, dist); // o + u * dist
}

/**
 * Select next texture and creates an {@link createEvent event} "n" for it.
 */
function nextTexture() {
  handleKeyPress(createEvent("n"));
}

/**
 * Select previous texture and creates an {@link createEvent event} "N" for it.
 */
function previousTexture() {
  handleKeyPress(createEvent("N"));
}

/**
 * Select next subdivision level and creates an {@link createEvent event} "m" for it.
 */
function nextLevel() {
  handleKeyPress(createEvent("m"));
}

/**
 * Select previous subdivision level and creates an {@link createEvent event} "M" for it.
 */
function previousLevel() {
  handleKeyPress(createEvent("M"));
}

/**
 * Increase zoom level and creates an {@link createEvent event} ↓ for it.
 */
function zoomIn() {
  handleKeyPress(createEvent("ArrowDown"));
}

/**
 * Decrease zoom level and creates an {@link createEvent event} ↑ for it.
 */
function zoomOut() {
  handleKeyPress(createEvent("ArrowUp"));
}

const mesh = document.getElementById("mesh");

/**
 * @summary Executed when the mesh checkbox is checked or unchecked.
 * <p>Appends an event listener for events whose type attribute value is change.<br>
 * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @event changeMeshcheckBox
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
 */
mesh.addEventListener("change", (event) => handleKeyPress(createEvent("l")));

const axes = document.getElementById("axes");

/**
 * @summary Executed when the axes checkbox is checked or unchecked.
 * <p>Appends an event listener for events whose type attribute value is change.<br>
 * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @event changeAxescheckBox
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
 */
axes.addEventListener("change", (event) => handleKeyPress(createEvent("a")));

const equator = document.getElementById("equator");

/**
 * @summary Executed when the equator checkbox is checked or unchecked.
 * <p>Appends an event listener for events whose type attribute value is change.<br>
 * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @event changeEquatorcheckBox
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
 */
equator.addEventListener("change", (event) => handleKeyPress(createEvent("E")));

const hws = document.getElementById("hws");

/**
 * @summary Executed when the hws checkbox is checked or unchecked.
 * <p>Appends an event listener for events whose type attribute value is change.<br>
 * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @event changeHwscheckBox
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
 */
hws.addEventListener("change", (event) => handleKeyPress(createEvent("Alt")));

if (document.querySelector('input[name="rot"]')) {
  document.querySelectorAll('input[name="rot"]').forEach((elem) => {
    /**
     * @summary Executed when the rot input radio is checked (but not when unchecked).
     * <p>Appends an event listener for events whose type attribute value is change.<br>
     * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
     * the event is dispatched.</p>
     *
     * @event changeRotInputRadio
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
     */
    elem.addEventListener("change", function (event) {
      const item = event.target.value;
      handleKeyPress(createEvent(item));
    });
  });
}

if (document.querySelector('input[name="mode"]')) {
  document.querySelectorAll('input[name="mode"]').forEach((elem) => {
    /**
     * @summary Executed when the mode input radio is checked (but not when unchecked).
     * <p>Appends an event listener for events whose type attribute value is change.<br>
     * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
     * the event is dispatched.</p>
     *
     * @event changeModeInputRadio
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
     */
    elem.addEventListener("change", function (event) {
      const item = event.target.value;
      handleKeyPress(createEvent(item));
    });
  });
}

const fix_uv = document.getElementById("fixuv");

/**
 * @summary Executed when the fix_uv checkbox is checked or unchecked.
 * <p>Appends an event listener for events whose type attribute value is change.<br>
 * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @event changeFixUVcheckBox
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
 */
fix_uv.addEventListener("change", (event) => handleKeyPress(createEvent("f")));

const merc = document.getElementById("mercator");

/**
 * @summary Executed when the mercator checkbox is checked or unchecked.
 * <p>Appends an event listener for events whose type attribute value is change.<br>
 * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @event changeMercatorcheckBox
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
 */
merc.addEventListener("change", (event) => handleKeyPress(createEvent("g")));

const cull = document.getElementById("culling");

/**
 * @summary Executed when the cull checkbox is checked or unchecked.
 * <p>Appends an event listener for events whose type attribute value is change.<br>
 * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @event changeCullcheckBox
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
 */
cull.addEventListener("change", (event) => handleKeyPress(createEvent("b")));

const texture = document.getElementById("texture");

/**
 * @summary Executed when the texture checkbox is checked or unchecked.
 * <p>Appends an event listener for events whose type attribute value is change.<br>
 * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @event changeTexturecheckBox
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
 */
texture.addEventListener("change", (event) => handleKeyPress(createEvent("k")));

const textures = document.getElementById("textures");

/**
 * @summary Executed when the textures &lt;select&gt; is changed.
 * <p>Appends an event listener for events whose type attribute value is change.<br>
 * The {@link selectTexture} argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @event changeTextureSelect
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
 */
textures.addEventListener("change", (event) => {
  selectTexture();
  document.activeElement.blur();
});

const models = document.getElementById("models");

/**
 * Executed when the models &lt;select&gt; is changed.
 * <p>Appends an event listener for events whose type attribute value is change.<br>
 * The {@link selectModel} argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @event changeModelsSelect
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
 */
models.addEventListener("change", (event) => selectModel());

const textimg = document.getElementById("textimg");

/**
 * <p>Gets the latitude and longitude on the texture image when clicked upon
 * and draws its position on the map.</p>
 * The pointerdown event is fired when a pointer becomes active.
 * For mouse, it is fired when the device transitions from no buttons pressed to at least one button pressed.
 * For touch, it is fired when physical contact is made with the digitizer.
 * For pen, it is fired when the stylus makes physical contact with the digitizer.
 * @event pointerdown-textimg
 * @param {PointerEvent} event a pointer event.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/offsetX MouseEvent: offsetX property}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/pointerdown_event Element: pointerdown event}
 * @see {@link https://caniuse.com/pointer Pointer events}
 */
textimg.addEventListener("pointerdown", (event) => {
  const x = event.offsetX;
  let y = event.offsetY;
  y = event.target.height - y;

  const uv = {
    s: x / event.target.width,
    t: y / event.target.height,
  };

  if (mercator) {
    // mercator projection
    uv.t = mercator2Spherical(uv.s, uv.t).t;
  }
  // normalized
  console.log(`longitude = ${uv.s}, latitude = ${uv.t}`);

  gpsCoordinates["Unknown"] = spherical2gcs(uv);
  const cities = Object.keys(gpsCoordinates);
  currentLocation = cities[cities.length - 2];
  handleKeyPress(createEvent("G"));
});

/**
 * <p>Displays the u and v normalized coordinates on the texture image
 * when pointer is moved upon.</p>
 * <p>The pointermove event is fired when a pointer changes coordinates,
 * and the pointer has not been canceled by a browser touch-action.
 * It's very similar to the mousemove event, but with more features.</p>
 *
 * These events happen whether or not any pointer buttons are pressed.
 * They can fire at a very high rate, depends on how fast the user moves the pointer,
 * how fast the machine is, what other tasks and processes are happening, etc.
 * @event pointermove-textimg
 * @param {PointerEvent} event a pointer event.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/offsetX MouseEvent: offsetX property}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/pointermove_event Element: pointermove event}
 * @see {@link https://caniuse.com/pointer Pointer events}
 */
textimg.addEventListener("pointermove", (event) => {
  // tooltip on mouse hoover
  const tooltip = document.getElementById("tooltip");

  if (!selector.tooltip) {
    tooltip.innerHTML = "";
    tooltip.style.display = "none";
    return;
  }

  const x = event.offsetX;
  let y = event.offsetY;
  y = event.target.height - y;

  const uv = {
    s: x / event.target.width,
    t: y / event.target.height,
  };

  if (mercator) {
    // mercator projection
    uv.t = mercator2Spherical(uv.s, uv.t).t;
  }

  tooltip.style.top = `${event.offsetY + 15}px`;
  tooltip.style.left = `${x}px`;
  // UV normalized
  tooltip.innerHTML = `(${uv.s.toFixed(3)}, ${uv.t.toFixed(3)})`;
  tooltip.style.display = "block";
});

/**
 * <p>Remove the tooltip when pointer is outside the textimg element.</p>
 *
 * The pointerout event is fired for several reasons including:
 * <ul>
 * <li>pointing device is moved out of the hit test boundaries of an element;</li>
 * <li>firing the pointerup event for a device that does not support hover (see pointerup);</li>
 * <li>after firing the pointercancel event (see pointercancel);</li>
 * <li>when a pen stylus leaves the hover range detectable by the digitizer.</li>
 * </ul>
 * @event pointerout-textimg
 * @param {PointerEvent} event a pointer event.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/pointerout_event Element: pointerout event}
 */
textimg.addEventListener("pointerout", (event) => {
  tooltip.innerHTML = "";
  tooltip.style.display = "none";
});

const canvas = document.getElementById("theCanvas");

/**
 * <p>Variables moving and {@link clicked} are used to distinguish between a simple click
 * and a click followed by drag while using the {@link rotator}.</p>
 * <p>When the pointer is down, moving is set to false and clicked is set to true.
 * When the pointer moves, moving is set to true if clicked is also true.
 * When the pointer is up, if moving is true, both moving and clicked are set to false.</p>
 * @type {Boolean}
 */
let moving = false;

/**
 * We need to know if the pointer is being held down while {@link moving} the globe or not.
 * Otherwise, we would not be able to distinguish between a click and a drag,
 * while using the {@link rotator simpleRotator}.
 * @type {Boolean}
 */
let clicked = false;

/**
 * <p>Sets {@link moving} to false and {@link clicked} to true.</p>
 * The pointerdown event is fired when a pointer becomes active.
 * For mouse, it is fired when the device transitions from no buttons pressed to at least one button pressed.
 * For touch, it is fired when physical contact is made with the digitizer.
 * For pen, it is fired when the stylus makes physical contact with the digitizer.
 * <p>This behavior is different from mousedown events.
 * When using a physical mouse, mousedown events fire whenever any button on a mouse is pressed down.
 * pointerdown events fire only upon the first button press;
 * subsequent button presses don't fire pointerdown events.</p>
 * @event pointerdown-theCanvas
 * @param {PointerEvent} event a pointer event.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/pointerdown_event Element: pointerdown event}
 * @see {@link https://caniuse.com/pointer Pointer events}
 */
canvas.addEventListener("pointerdown", (event) => {
  clicked = true;
  moving = false;
});

/**
 * <p>Displays the GCS coordinates (longitude and latitude )
 * on the globe when pointer is moved upon.</p>
 * <p>Sets {@link moving} to true if {@link clicked} is also true.</p>
 * <p>The pointermove event is fired when a pointer changes coordinates,
 * and the pointer has not been canceled by a browser touch-action.
 * It's very similar to the mousemove event, but with more features.</p>
 *
 * These events happen whether or not any pointer buttons are pressed.
 * They can fire at a very high rate, depends on how fast the user moves the pointer,
 * how fast the machine is, what other tasks and processes are happening, etc.
 * @event pointermove-theCanvas
 * @param {PointerEvent} event a pointer event.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/pointermove_event Element: pointermove event}
 * @see {@link https://caniuse.com/pointer Pointer events}
 */
canvas.addEventListener("pointermove", (event) => {
  if (clicked) {
    moving = true;
    clicked = false; // we are moving the globe
    canvas.style.cursor = "pointer";
    return;
  }

  // tooltip on mouse hoover
  const tooltip = document.getElementById("canvastip");

  if (moving || !selector.tooltip) {
    tooltip.innerHTML = "";
    tooltip.style.display = "none";
  } else {
    const x = event.offsetX;
    let y = event.offsetY;
    y = event.target.height - y;

    // ray origin in world coordinates
    const o = unproject(
      [],
      vec3.fromValues(x, y, 0),
      getModelMatrix(),
      viewMatrix,
      projection,
      event.target.width,
      event.target.height,
    );

    // ray end point in world coordinates
    const p = unproject(
      [],
      vec3.fromValues(x, y, 1),
      getModelMatrix(),
      viewMatrix,
      projection,
      event.target.width,
      event.target.height,
    );

    const intersection = lineSphereIntersection(o, p, [0, 0, 0], 1);
    if (!intersection) {
      tooltip.innerHTML = "";
      tooltip.style.display = "none";
      return;
    }

    const uv = cartesian2Spherical(intersection);
    const gcs = spherical2gcs(uv);

    tooltip.style.top = `${event.offsetY + 15}px`;
    tooltip.style.left = `${x}px`;
    // GCS coordinates
    tooltip.innerHTML = `(${gcs.longitude.toFixed(3)},
                          ${gcs.latitude.toFixed(3)})`;
    tooltip.style.display = "block";
  }
});

/**
 * <p>Sets {@link clicked} to false and if {@link moving} is true, sets it to false and return,
 * because we are moving the globe.</br>
 * Otherwise, gets the latitude and longitude on the globe
 * and draws its position on the map.</p>
 * The pointerup event is fired when a pointer is no longer active.
 * This behavior is different from mouseup events.
 * When using a physical mouse, mouseup events fire whenever any button on a mouse is released.
 * pointerup events fire only upon the last button release; previous button releases,
 * while other buttons are held down, don't fire pointerup events.
 * @event pointerup-theCanvas
 * @param {PointerEvent} event a pointer event.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/pointerup_event Element: pointerup event}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/offsetX MouseEvent: offsetX property}
 * @see {@link https://caniuse.com/pointer Pointer events}
 */
canvas.addEventListener("pointerup", (event) => {
  //if (event.buttons != 2) return;
  canvas.style.cursor = "crosshair";
  clicked = false;

  if (moving) {
    moving = false;
    return; // ignore if moving
  }

  let x = event.offsetX;
  let y = event.offsetY;
  y = event.target.height - y;

  // ray origin in world coordinates
  const o = unproject(
    [],
    vec3.fromValues(x, y, 0),
    getModelMatrix(),
    viewMatrix,
    projection,
    event.target.width,
    event.target.height,
  );

  // ray end point in world coordinates
  const p = unproject(
    [],
    vec3.fromValues(x, y, 1),
    getModelMatrix(),
    viewMatrix,
    projection,
    event.target.width,
    event.target.height,
  );

  const intersection = lineSphereIntersection(o, p, [0, 0, 0], 1);
  if (!intersection) return;

  const uv = cartesian2Spherical(intersection);

  gpsCoordinates["Unknown"] = spherical2gcs(uv);
  const cities = Object.keys(gpsCoordinates);
  currentLocation = cities[cities.length - 2];
  handleKeyPress(createEvent("G"));
});

/**
 * No context menu when pressing the right mouse button.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event Element: contextmenu event}
 * @event contextmenu
 * @param {MouseEvent} event mouse event.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent MouseEvent}
 */
window.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

/**
 * Double click as right click.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/dblclick_event Element: dblclick event}
 * @event dblclick
 * @param {MouseEvent} event mouse event.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent MouseEvent}
 */
canvas.addEventListener("dblclick", (event) => {
  const dblclickEvent = new PointerEvent("pointerdown", {
    pointerType: "mouse",
    pointerId: 1,
    clientX: event.clientX,
    clientY: event.clientY,
    bubbles: true,
    cancelable: true,
    buttons: 2, // right button
  });
  event.preventDefault();
  canvas.dispatchEvent(dblclickEvent);
});

// export for using in the html file.
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.nextTexture = nextTexture;
window.previousTexture = previousTexture;
window.nextLevel = nextLevel;
window.previousLevel = previousLevel;

/**
 * Code to actually render our geometry.
 * Draws axes, applies texture, then draws lines.
 */
function draw() {
  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (selector.axes) drawAxes();
  if (selector.texture) drawTexture();
  if (selector.lines) drawLines();
  if (selector.equator) drawParallel();
  drawLinesOnImage();
}

/**
 * Returns a new scale model matrix, which applies {@link mscale}.
 * @returns {mat4} model matrix.
 */
function getModelMatrix() {
  return mscale != 1
    ? mat4.multiply(
        [],
        modelMatrix,
        mat4.fromScaling([], vec3.fromValues(mscale, mscale, mscale)),
      )
    : modelMatrix;
}

/**
 * <p>Texture render the current model.</p>
 * Uses the {@link lightingShader}.
 *
 * <p>If the attribute "a_TexCoord" is not defined in the vertex shader,
 * texture coordinates will be calculated pixel by pixel
 * in the fragment shader.</p>
 *
 * <p> We can also set a uniform attribute (u_mercator) in the shader,
 * for using a {@link https://hrcak.srce.hr/file/239690 Mercator projection}
 * instead of an {@link https://en.wikipedia.org/wiki/Equirectangular_projection equirectangular projection}.</p>
 */
function drawTexture() {
  // bind the shader
  gl.useProgram(lightingShader);

  // get the index for the a_Position attribute defined in the vertex shader
  const positionIndex = gl.getAttribLocation(lightingShader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  const normalIndex = gl.getAttribLocation(lightingShader, "a_Normal");
  if (normalIndex < 0) {
    console.log("Failed to get the storage location of a_Normal");
    return;
  }

  const texCoordIndex = gl.getAttribLocation(lightingShader, "a_TexCoord");
  noTexture = texCoordIndex < 0;

  const u_mercator = gl.getUniformLocation(lightingShader, "u_mercator");
  gl.uniform1i(u_mercator, mercator);

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(normalIndex);
  // texture coordinates can be calculated in the fragment shader
  if (!noTexture) gl.enableVertexAttribArray(texCoordIndex);

  // bind buffers for points
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  if (!noTexture)
    gl.vertexAttribPointer(texCoordIndex, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // set uniform in shader for projection * view * model transformation
  let loc = gl.getUniformLocation(lightingShader, "model");
  gl.uniformMatrix4fv(loc, false, getModelMatrix());
  loc = gl.getUniformLocation(lightingShader, "view");
  gl.uniformMatrix4fv(loc, false, viewMatrix);
  loc = gl.getUniformLocation(lightingShader, "projection");
  gl.uniformMatrix4fv(loc, false, projection);
  loc = gl.getUniformLocation(lightingShader, "normalMatrix");
  gl.uniformMatrix3fv(
    loc,
    false,
    makeNormalMatrixElements(modelMatrix, viewMatrix),
  );

  loc = gl.getUniformLocation(lightingShader, "lightPosition");
  gl.uniform4f(loc, ...lightPosition);

  // light and material properties
  loc = gl.getUniformLocation(lightingShader, "lightProperties");
  gl.uniformMatrix3fv(loc, false, lightPropElements.white_light);
  loc = gl.getUniformLocation(lightingShader, "materialProperties");
  gl.uniformMatrix3fv(loc, false, matPropElements.shiny_brass);
  loc = gl.getUniformLocation(lightingShader, "shininess");
  gl.uniform1f(loc, shininess[shininess.length - 1]);

  // need to choose a texture unit, then bind the texture to TEXTURE_2D for that unit
  const textureUnit = 1;
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, textureHandle);
  loc = gl.getUniformLocation(lightingShader, "sampler");
  gl.uniform1i(loc, textureUnit);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  if (theModel.indices) {
    gl.drawElements(
      gl.TRIANGLES,
      theModel.indices.length,
      theModel.indices.constructor === Uint32Array
        ? gl.UNSIGNED_INT
        : gl.UNSIGNED_SHORT,
      0,
    );
  } else {
    gl.drawArrays(gl.TRIANGLES, 0, theModel.vertexPositions.length / 3);
  }

  gl.disableVertexAttribArray(positionIndex);
  gl.disableVertexAttribArray(normalIndex);
  if (!noTexture) gl.disableVertexAttribArray(texCoordIndex);
  gl.useProgram(null);
}

/**
 * <p>Draws the lines: mesh + normals.</p>
 * Uses the {@link colorShader}.
 * <p>This code takes too long on mobile - too many API calls.</p>
 * <pre>
 *  // draw edges
 *  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
 *  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
 *  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
 *  for (let i = 0; i < theModel.indices.length; i += 3) {
 *      // offset - two bytes per index (UNSIGNED_SHORT)
 *      gl.drawElements(gl.LINE_LOOP, 3, gl.UNSIGNED_SHORT, i * 2);
 *  }
 * </pre>
 * The solution is having a single {@link lineBuffer buffer} with all lines,
 * which was set in {@link createModel}.
 * @see {@link https://stackoverflow.com/questions/47232671/how-gl-drawelements-find-the-corresponding-vertices-array-buffer How gl.drawElements "find" the corresponding vertices array buffer?}
 */
function drawLines() {
  // bind the shader
  gl.useProgram(colorShader);

  const positionIndex = gl.getAttribLocation(colorShader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  const a_color = gl.getAttribLocation(colorShader, "a_Color");
  if (a_color < 0) {
    console.log("Failed to get the storage location of a_Color");
    return;
  }

  // use yellow as line color in the colorShader
  gl.vertexAttrib4f(a_color, 1.0, 1.0, 0.0, 1.0);

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);

  //  ------------ draw triangle borders
  // set transformation to projection * view * model
  const loc = gl.getUniformLocation(colorShader, "transform");
  const transform = mat4.multiply(
    [],
    projection,
    mat4.multiply([], viewMatrix, getModelMatrix()),
  );
  gl.uniformMatrix4fv(loc, false, transform);

  // draw edges - single pre-computed lineBuffer
  const len = theModel.indices
    ? theModel.indices.length
    : theModel.vertexPositions.length;
  gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.LINES, 0, 2 * len);

  // draw normals
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.LINES, 0, 2 * theModel.vertexPositions.length);

  gl.disableVertexAttribArray(positionIndex);
  gl.useProgram(null);
}

/**
 * <p>Draws the axes. </p>
 * Uses the {@link colorShader}.
 */
function drawAxes() {
  // bind the shader
  gl.useProgram(colorShader);

  const positionIndex = gl.getAttribLocation(colorShader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  const colorIndex = gl.getAttribLocation(colorShader, "a_Color");
  if (colorIndex < 0) {
    console.log("Failed to get the storage location of a_Color");
    return;
  }

  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(colorIndex);
  // draw axes (not transformed by model transformation)
  gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, axisColorBuffer);
  gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // set transformation to projection * view only for extrinsic
  const loc = gl.getUniformLocation(colorShader, "transform");
  const transform = mat4.multiply([], projection, viewMatrix);
  // set transformation to projection * view * model for intrinsic
  if (selector.intrinsic) {
    mat4.multiply(transform, transform, modelMatrix);
  }
  gl.uniformMatrix4fv(loc, false, transform);

  // draw axes
  gl.drawArrays(gl.LINES, 0, 6);

  // unbind shader and "disable" the attribute indices
  // (not really necessary when there is only one shader)
  gl.disableVertexAttribArray(positionIndex);
  gl.disableVertexAttribArray(colorIndex);
  gl.useProgram(null);
}

/**
 * <p>Draws a parallel. </p>
 * Uses the {@link colorShader}.
 */
function drawParallel() {
  // bind the shader
  gl.useProgram(colorShader);
  const positionIndex = gl.getAttribLocation(colorShader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  const a_color = gl.getAttribLocation(colorShader, "a_Color");
  if (a_color < 0) {
    console.log("Failed to get the storage location of a_Color");
    return;
  }
  gl.vertexAttrib4f(a_color, 1.0, 0.0, 0.0, 1.0);

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);

  // set transformation to projection * view * model
  const loc = gl.getUniformLocation(colorShader, "transform");
  const transform = mat4.multiply(
    [],
    projection,
    mat4.multiply([], viewMatrix, getModelMatrix()),
  );
  gl.uniformMatrix4fv(loc, false, transform);

  // draw parallel
  gl.bindBuffer(gl.ARRAY_BUFFER, parallelBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.LINE_LOOP, 0, nsegments);

  // draw meridian
  gl.bindBuffer(gl.ARRAY_BUFFER, meridianBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.LINE_LOOP, 0, nsegments);

  gl.disableVertexAttribArray(positionIndex);
  gl.useProgram(null);
}

/**
 * Get texture file names from an html &lt;select&gt; element
 * identified by "textures".
 * @param {Array<String>} optionNames array of texture file names.
 */
function getTextures(optionNames) {
  const initialTexture = optionNames[0];
  optionNames.length = 0;
  const selectElement = document.getElementById("textures");
  [...selectElement.options].map((o) => optionNames.push(o.text));
  optionNames.sort();
  setTextures(optionNames);
  textureCnt = optionNames.indexOf(initialTexture);
}

/**
 * Set texture file names of an html &lt;select&gt; element identified by "textures".
 * @param {Array<String>} optionNames array of texture file names.
 */
function setTextures(optionNames) {
  const sel = document.getElementById("textures");

  let options_str = "";

  optionNames.forEach((img, index) => {
    options_str += `<option value="${index}">${img}</option>`;
  });

  sel.innerHTML = options_str;
}

/**
 * <p>Loads the texture image asynchronously and defines its {@link ImageLoadCallback load callback function}.</p>
 * @param {Event} event load event.
 * @callback WindowLoadCallback
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event load event}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image Image() constructor}
 * @see {@link https://web.cse.ohio-state.edu/~shen.94/581/Site/Slides_files/texture.pdf Texture Mapping}
 * @see {@link https://www.evl.uic.edu/pape/data/Earth/ Earth images}
 * @event load
 */
window.addEventListener("load", (event) => {
  image = new Image();

  /**
   * <p>Callback after a new texture {@link image} is loaded.</p>
   * When called for the first time, it starts the animation.
   * Otherwise, just loads a new texture.
   * @callback ImageLoadCallback
   */
  image.onload = function () {
    // chain the animation or load a new texture
    if (typeof theModel === "undefined") {
      readFileNames
        .then((arr) => {
          const initialTexture = imageFilename[0];
          if (arr.length > 0) {
            imageFilename.splice(0, imageFilename.length, ...arr.sort());
          }
          setTextures(imageFilename);
          textureCnt = imageFilename.indexOf(initialTexture);
          startForReal(image);
        })
        .catch((error) => {
          console.log(`${error}`);
          // don't return anything => execution goes the normal way
          // in case server does not run php
          getTextures(imageFilename);
          startForReal(image);
        });
    } else {
      newTexture(image);
      draw();
    }
  };
  // starts loading the image asynchronously
  image.src = `./textures/${imageFilename[0]}`;
  mercator = imageFilename[0].includes("Mercator");
  document.getElementById("mercator").checked = mercator;
});

/**
 * <p>Sets up all buffers for the given (triangulated) model (shape).</p>
 *
 * Uses the webgl {@link vertexBuffer vertex buffer},
 * {@link normalBuffer normal buffer}, {@link texCoordBuffer texture buffer}
 * and {@link indexBuffer index buffer}, created in {@link startForReal}.<br>
 * Then, binds each one of them as an array buffer and copies the corresponding shape array data to them.
 *
 * <p>Also, the Euler characteristic for the model is:</p>
 * <ul>
 *  <li>χ = 2 − 2g − b </li>
 * </ul>
 * for a surface with g handles and b boundaries.
 *
 * <p>The number of triangles must be even for a valid triangulation of the sphere:</p>
 * <ul>
 *  <li> V - E + T = 2 ({@link https://en.wikipedia.org/wiki/Sphere sphere}) </li>
 *  <li> V - E + T = 1 ({@link https://en.wikipedia.org/wiki/Trefoil_knot trefoil knot}) </li>
 *  <li> V - E + T = 0 ({@link https://en.wikipedia.org/wiki/Torus torus}) </li>
 * </ul>
 *
 * @param {Object} model model descriptor.
 * @property {modelData} model.shape a <a href="https://en.wikipedia.org/wiki/Boundary_representation">BREP</a> model
 *                    given as an <a href="https://math.hws.edu/graphicsbook/c3/s4.html">IFS</a>.
 * @property {String} model.name="" model name.
 * @property {Number | null} model.chi=2 model <a href="https://en.wikipedia.org/wiki/Euler_characteristic">Euler Characteristic</a>.
 * @property {Number} model.poly=0 initial polyhedron for subdivision:<br>
 *     0 - dodecahedron, <br>
 *     1 - icosahedron, <br>
 *     2 - octahedron, <br>
 *     3 - tetrahedron.
 * @property {Boolean} model.fix_uv=false whether to change uv texture coordinates.
 * @returns {modelData|module:polyhedron~polyData} shape.
 * @see {@link https://en.wikipedia.org/wiki/Platonic_solid Platonic solid}
 * @see {@link https://ocw.mit.edu/courses/18-965-geometry-of-manifolds-fall-2004/pages/lecture-notes/ Geometry Of Manifolds}
 * @see {@link https://nrich.maths.org/1384 Euler's Formula and Topology}
 * @see <a href="http://hans.munthe-kaas.no/protect/Conway/7_Euler s Map Theorem.pdf">Euler’s Map Theorem</a>
 * @see {@link https://math.stackexchange.com/questions/3571483/euler-characteristic-of-a-polygon-with-a-hole Euler characteristic of a polygon with a hole}
 *
 */
function createModel({ shape, name = "", chi = 2, poly = 0, fix_uv = false }) {
  if (typeof shape === "undefined") {
    setUVfix(true);
    if (poly === 0) {
      shape = selector.hws
        ? new Polyhedron(fix_uv).dodecahedronHWS({
            n: numSubdivisions,
          })
        : new Polyhedron(fix_uv).dodecahedron({
            n: numSubdivisions,
          });
    } else if (poly === 1) {
      shape = selector.hws
        ? new Polyhedron(fix_uv).icosahedronHWS({
            n: numSubdivisions,
          })
        : new Polyhedron(fix_uv).icosahedron({
            n: numSubdivisions,
          });
    } else if (poly === 2) {
      shape = selector.hws
        ? new Polyhedron(fix_uv).octahedronHWS({
            n: numSubdivisions,
          })
        : new Polyhedron(fix_uv).octahedron({
            n: numSubdivisions,
          });
    } else if (poly === 3) {
      shape = selector.hws
        ? new Polyhedron(fix_uv).tetrahedronHWS({
            n: numSubdivisions,
          })
        : new Polyhedron(fix_uv).tetrahedron({
            n: numSubdivisions,
          });
    }
    maxSubdivisions = shape.maxSubdivisions;
  } else {
    setUVfix(name == "spherend");
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, shape.vertexPositions, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, shape.vertexNormals, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

  if (["capsule"].includes(name)) {
    rotateUTexture(shape, 90);
  }

  if (!noTexture && !shape.vertexMercatorCoords && name.includes("sphere")) {
    setMercatorCoordinates(shape);
  }

  gl.bufferData(
    gl.ARRAY_BUFFER,
    mercator && shape.vertexMercatorCoords
      ? shape.vertexMercatorCoords
      : shape.vertexTextureCoords,
    gl.STATIC_DRAW,
  );

  const nv = shape.vertexPositions.length;
  normal = new Float32Array(6 * nv);
  for (let i = 0, k = 0; i < nv; i += 3, k += 6) {
    for (let j = 0; j < 3; j++) {
      normal[j + k] = shape.vertexPositions[i + j];
      normal[j + k + 3] =
        normal[j + k] + (0.1 / mscale) * shape.vertexNormals[i + j];
    }
  }

  // number of faces: ni / 3
  // number of edges: ni
  // number of endpoints: ni * 6
  if (shape.indices) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, shape.indices, gl.STATIC_DRAW);

    const ni = shape.indices.length;
    lines = new Float32Array(18 * ni);
    for (let i = 0, k = 0; i < ni; i += 3, k += 18) {
      for (let j = 0; j < 3; j++) {
        const v1 = shape.vertexPositions[shape.indices[i] * 3 + j];
        const v2 = shape.vertexPositions[shape.indices[i + 1] * 3 + j];
        const v3 = shape.vertexPositions[shape.indices[i + 2] * 3 + j];

        lines[j + k] = v1;
        lines[j + k + 3] = v2;

        lines[j + k + 6] = v2;
        lines[j + k + 9] = v3;

        lines[j + k + 12] = v3;
        lines[j + k + 15] = v1;
      }
    }
  } else {
    const ni = shape.vertexPositions.length;
    lines = new Float32Array(18 * ni);
    for (let i = 0, k = 0; i < ni; i += 3, k += 18) {
      for (let j = 0; j < 3; j++) {
        const v1 = shape.vertexPositions[i * 3 + j];
        const v2 = shape.vertexPositions[(i + 1) * 3 + j];
        const v3 = shape.vertexPositions[(i + 2) * 3 + j];

        lines[j + k] = v1;
        lines[j + k + 3] = v2;

        lines[j + k + 6] = v2;
        lines[j + k + 9] = v3;

        lines[j + k + 12] = v3;
        lines[j + k + 15] = v1;
      }
    }
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, lines, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normal, gl.STATIC_DRAW);

  const obj = document.getElementById("object");

  const faces = shape.indices
    ? shape.indices.length / 3
    : shape.vertexPositions.length / 9;
  let edges = (faces * 3) / 2;
  let vertices = faces / 2 + chi;
  const vertReal = shape.vertexPositions.length / 3;

  if (chi === null) {
    edges = `??`;
    vertices = `??`;
  }

  if (name == "ring") {
    edges = (faces * 3) / 2 + chi;
    vertices = edges - faces;
  }

  obj.innerHTML = `(${faces} ▲, ${edges} ―, ${vertices} •, ${vertReal} 🔴)`;
  return shape;
}

/**
 * Returns whether a given value is a power of two.
 * @param {Number} value number to check.
 * @returns {Boolean} true if value is a power of two: value = 2<sup>n</sup>
 */
function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}

/**
 * Load a new parallel and merdian into the GPU
 * corresponding to the given location.
 * @param {String} location a {@link gpsCoordinates city name}.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferSubData bufferSubData() method}
 */
function setPosition(location) {
  const parallelVertices = pointsOnParallel(gpsCoordinates[location].latitude);
  gl.bindBuffer(gl.ARRAY_BUFFER, parallelBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, parallelVertices);

  const meridianVertices = pointsOnMeridian(gpsCoordinates[location].longitude);
  gl.bindBuffer(gl.ARRAY_BUFFER, meridianBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, meridianVertices);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

/**
 * <p>Creates a textured model and triggers the animation.</p>
 *
 * Basically this function does setup that "should" only have to be done once,<br>
 * while {@link draw draw()} does things that have to be repeated each time the canvas is
 * redrawn.
 * @param {HTMLImageElement} image texture.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL Using textures in WebGL}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/generateMipmap generateMipmap() method}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter texParameter[fi]() method}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D texImage2D() method}
 * @see {@link https://www.khronos.org/webgl/wiki/WebGL_and_OpenGL WebGL and OpenGL Differences}
 * @see {@link https://learnopengl.com/Getting-started/Textures Textures}
 * @see {@link https://artincontext.org/shades-of-teal/ 38 Shades of Teal Color}
 * @see {@link https://www.khronos.org/opengl/wiki/Common_Mistakes Common Mistakes}
 * @see {@link https://www.youtube.com/watch?v=qMCOX3m-R28 What are Mipmaps?}
 */
function startForReal(image) {
  console.log("Started...");

  // retrieve <canvas> element
  const canvas = document.getElementById("theCanvas");

  /**
   * <p>Appends an event listener for events whose type attribute value is keydown.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event keydown
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event Element: keydown event}
   */
  window.addEventListener("keydown", (event) => {
    if (
      ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(
        event.code,
      ) > -1
    ) {
      event.preventDefault();
    }
    handleKeyPress(event);
  });

  gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL2");
    gl = canvas.getContext("webgl");
    if (!gl) {
      console.log("Failed to get the rendering context for WebGL");
      return;
    }
  }

  // load and compile the shader pair, using utility from the teal book
  let vshaderSource = document.getElementById("vertexColorShader").textContent;
  let fshaderSource = document.getElementById(
    "fragmentColorShader",
  ).textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log("Failed to initialize shaders.");
    return;
  }
  colorShader = gl.program;
  gl.useProgram(null);

  // load and compile the shader pair, using utility from the teal book
  vshaderSource = document.getElementById("vertexLightingShader").textContent;
  fshaderSource = document.getElementById("fragmentLightingShader").textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log("Failed to initialize shaders.");
    return;
  }
  lightingShader = gl.program;
  gl.useProgram(null);

  // buffer for vertex positions for triangles
  vertexBuffer = gl.createBuffer();
  indexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return null;
  }

  // buffer for vertex normals
  vertexNormalBuffer = gl.createBuffer();
  if (!vertexNormalBuffer) {
    console.log("Failed to create the buffer object");
    return null;
  }

  // buffer for texture coords
  texCoordBuffer = gl.createBuffer();
  if (!texCoordBuffer) {
    console.log("Failed to create the buffer object");
    return null;
  }

  // axes
  axisBuffer = gl.createBuffer();
  normalBuffer = gl.createBuffer();
  lineBuffer = gl.createBuffer();
  parallelBuffer = gl.createBuffer();
  meridianBuffer = gl.createBuffer();
  if (!axisBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, axisVertices, gl.STATIC_DRAW);

  // buffer for axis colors
  axisColorBuffer = gl.createBuffer();
  if (!axisColorBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, axisColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, axisColors, gl.STATIC_DRAW);

  const parallelVertices = pointsOnParallel(
    gpsCoordinates[currentLocation].latitude,
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, parallelBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, parallelVertices, gl.STATIC_DRAW);

  const meridianVertices = pointsOnMeridian(
    gpsCoordinates[currentLocation].longitude,
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, meridianBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, meridianVertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // ask the GPU to create a texture object
  textureHandle = gl.createTexture();

  // choose a texture unit to use during setup, defaults to zero
  // (can use a different one when drawing)
  // max value is MAX_COMBINED_TEXTURE_IMAGE_UNITS
  gl.activeTexture(gl.TEXTURE0);

  newTexture(image);

  // specify a teal like fill color for clearing the framebuffer
  gl.clearColor(0.0, 0.4, 0.4, 1.0);

  gl.enable(gl.DEPTH_TEST);
  if (culling) gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  // normals pointing outward
  gl.frontFace(gl.CCW);

  // add some thickness
  // https://alteredqualia.com/tmp/webgl-linewidth-test/
  gl.lineWidth(3);
  console.log(
    `line width range: ${gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)}`,
  );

  rotator = new SimpleRotator(canvas, animate);
  rotator.setViewMatrix(modelMatrix);
  rotator.setViewDistance(0);

  labelForLocation(currentLocation);
  selectModel();

  // start drawing!
  animate();
}

/**
 * <p>A closure holding the type of the model.</p>
 * {@link https://vcg.isti.cnr.it/Publications/2012/Tar12/jgt_tarini.pdf Tarini's}
 * method does not work for objects like polyhedra.<br>
 * It was meant for objects whose texture coordinates were set by using
 * {@link https://docs.blender.org/manual/en/2.79/editors/uv_image/uv/editing/unwrapping/mapping_types.html cylindrical or spherical uv-mappings}.<br>
 * For instance, a cube's face texture coordinates span from 0 to 1.
 * <p>Therefore, we only use it for subdivision spheres.</p>
 * @return {UVfix}
 * @function
 * @see {@link https://gamedev.stackexchange.com/questions/130888/what-are-screen-space-derivatives-and-when-would-i-use-them What are screen space derivatives}
 * @see <a href="../images/rasterized_triangle.png"><img src="../images/rasterized_triangle.png" width="512"></a>
 */
const setUVfix = (() => {
  let subdivisionModel = false;

  /**
   * Callback to decide whether to fix UV coordinates, based on
   * the model type (subdivision or not), and if it is a textured
   * model or not.
   * @param {Boolean} subModel
   *   true: subdivision model, <br>
   *   false: normal model, <br>
   *   undefined: not known. Use the type saved in the closure.
   * @callback UVfix
   */
  return (subModel) => {
    gl.useProgram(lightingShader);
    const u_fix = gl.getUniformLocation(lightingShader, "u_fix");
    const texCoordIndex = gl.getAttribLocation(lightingShader, "a_TexCoord");

    if (texCoordIndex < 0) {
      // no texture
      gl.uniform1i(u_fix, fixuv);
    } else if (subModel == undefined) {
      if (subdivisionModel) {
        gl.uniform1i(u_fix, fixuv && numSubdivisions > 0);
      } else {
        gl.uniform1i(u_fix, false);
      }
    } else if (subModel) {
      subdivisionModel = true;
      gl.uniform1i(u_fix, fixuv && numSubdivisions > 0);
    } else {
      subdivisionModel = false;
      gl.uniform1i(u_fix, false);
    }
    gl.useProgram(null);
  };
})();

/**
 * <p>Creates a new texture from an image.</p>
 * Uses the {@link lightingShader}.
 * @param {HTMLImageElement} image texture.
 * @see {@link https://webglfundamentals.org/webgl/lessons/webgl-3d-textures.html WebGL Textures}
 * @see {@link https://jameshfisher.com/2020/10/22/why-is-my-webgl-texture-upside-down/ Why is my WebGL texture upside-down?}
 * @see {@link https://registry.khronos.org/webgl/specs/latest/2.0/#4.1.3 Non-Power-of-Two Texture Access}
 * @see {@link https://www.youtube.com/watch?v=qMCOX3m-R28 What are Mipmaps?}
 */
function newTexture(image) {
  gl.useProgram(lightingShader);
  const imgSize = document.getElementById("size");
  imgSize.innerHTML = `${imageFilename[textureCnt]}`;
  const textimg = document.getElementById("textimg");
  textimg.src = image.src;
  textimg.onload = () => {
    const canvasimg = document.getElementById("canvasimg");
    canvasimg.width = textimg.width;
    canvasimg.height = textimg.height;
    if (selector.paused) drawLinesOnImage();
  };
  document.getElementById("figc").textContent =
    `(${image.width} x ${image.height})`;
  document.getElementById("textures").value = String(textureCnt);

  // bind the texture
  gl.bindTexture(gl.TEXTURE_2D, textureHandle);

  /*
   * (0,0) in the image coordinate system is the top left corner,
   * and the (0,0) in the texture coordinate system is bottom left.
   * Therefore, load the image bytes to the currently bound texture,
   * flipping the vertical.
   */
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  if (
    typeof WebGL2RenderingContext !== "undefined" ||
    (isPowerOf2(image.width) && isPowerOf2(image.height))
  ) {
    setUVfix();

    // texture parameters are stored with the texture
    gl.generateMipmap(gl.TEXTURE_2D);
    // texture magnification filter - default is gl.LINEAR (blurred)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // reset defaults

    // texture minification filter
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR,
    );

    // wrapping function for texture coordinate s
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);

    // wrapping function for texture coordinate t
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  } else {
    // NPOT
    setUVfix();

    // texture minification filter
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR, // default is gl.NEAREST_MIPMAP_LINEAR
    );

    // wrapping function for texture coordinate s (default is gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);

    // wrapping function for texture coordinate t (default is gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  }
  gl.useProgram(null);
}

/**
 * <p>Define an {@link frame animation} loop.</p>
 * Step 0.5° ⇒ 60 fps = 30°/s ⇒ 360° in 12s
 * @see {@link https://dominicplein.medium.com/extrinsic-intrinsic-rotation-do-i-multiply-from-right-or-left-357c38c1abfd Extrinsic & intrinsic rotation}
 */
const animate = (() => {
  // increase the rotation by some amount, depending on the axis chosen
  const increment = toRadian(0.5);
  /** @type {Number} */
  let requestID = 0;
  const rotMatrix = {
    x: mat4.fromXRotation([], increment),
    y: mat4.fromYRotation([], increment),
    z: mat4.fromZRotation([], increment),
  };

  /**
   * Callback to keep drawing frames.
   * @callback frame
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame Window: requestAnimationFrame() method}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame Window: cancelAnimationFrame() method}
   */
  return () => {
    draw();
    if (requestID != 0) {
      cancelAnimationFrame(requestID);
      requestID = 0;
    }
    if (!selector.paused) {
      if (selector.intrinsic) {
        // intrinsic rotation - multiply on the right
        mat4.multiply(modelMatrix, modelMatrix, rotMatrix[axis]);
      } else {
        // extrinsic rotation - multiply on the left
        mat4.multiply(modelMatrix, rotMatrix[axis], modelMatrix);
      }
      rotator.setViewMatrix(modelMatrix);
      // request that the browser calls animate() again "as soon as it can"
      requestID = requestAnimationFrame(animate);
    } else {
      modelMatrix = rotator.getViewMatrix();
    }
  };
})();
