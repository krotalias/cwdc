/**
 * @file
 *
 * Summary.
 * <p>Equirectangular and Mercator projection viewer using lighting combined with
 * {@link https://web.engr.oregonstate.edu/~mjb/cs550/PDFs/TextureMapping.4pp.pdf texture mapping}
 * written in Vanilla Javascript and WebGL.</p>
 *
 * <p><b>For educational purposes only.</b></p>
 * <p>This is just a <b><a href="../images/mapViewer.mp4">demo</a></b> for teaching {@link https://en.wikipedia.org/wiki/Computer_graphics CG},
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
 * in all of these models that precludes mipmapping artifacts.
 * The theoretical number of vertices, <mark>𝑣</mark>, for a {@link https://en.wikipedia.org/wiki/Manifold manifold model}
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
 * Although this discontinuity is what causes the mipmapping artifacts, it has nothing to do with the topology of the model
 * but how mipmapping is {@link https://developer.nvidia.com/gpugems/gpugems2/part-iii-high-quality-rendering/chapter-28-mipmap-level-measurement implemented} on the GPU.
 *
 * However, since an entire line is mapped onto the vextex at the north or south pole,
 * and a vertex can have only one pair of texture coordinates (u,v),
 * no matter what value we use for the "u" coordinate (e.g., 0 or 0.5),
 * the interpolation will produce an awkward swirl effect at the poles.</p>
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
 * <li>The application selects a random {@link gpsCoordinates city} and displays its
 * <a href="/cwdc/13-webgl/extras/locations.json">location</a> (when its name is checked in the interface)
 * as the intersection of its line of latitude (parallel) and line of longitude (meridian) on the model surface (preferably a map onto a sphere).
 * Your task is to pick a point in the texture image (using the mouse or any pointer device) and display its location
 * on the texture image (map) and on the 3D model.
 * <ul>
 *   <li>To do this, you need to convert the screen coordinates of the mouse pointer into texture coordinates (u, v), then
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
 *     by casting a ray, {@link unproject unprojecting} it, and finding its closest
 *     (first) intersection (relative to the viewer) with the polygonal surface of the model.</li>
 * <ul>
 *  <li>The easiest way is shooting the ray from the mouse position and {@link pixelRayIntersection intersecting}
 *      it against the surface of an implicit sphere
 *      by {@link lineSphereIntersection solving} a {@link https://en.wikipedia.org/wiki/Line–sphere_intersection second-degree equation}.</li>
 *  <li>The other way is to intersect the ray against each face of the polygonal surface by testing if the ray intersects the plane
 *      of a face and then checking if the intersection point is inside the corresponding triangle.</li>
 *  <li>We select a position on the globe by {@link event:pointerdown-theCanvas clicking} a mouse button in the WebGL canvas.</li>
 *  <li>To display the GCS coordinates of the pointer while the globe is spinning, we need to keep track of the
 *     {@link cursorPosition cursor position}
 *     and then shoot a ray through this position to find its {@link pixelRayIntersection intersection} on the globe.</li>
 *  <li>Because a {@link isTouchDevice touch device} does not have a cursor position, we can use the Phong {@link phongHighlight highlight}
 *      position on the globe as a cursor.
 *      To do this, we need to know the initial position of the highlight in world coordinates
 *      (0, 0, 1)—or in GCS coordinates (-90°, 0°)—and then transform it into {@link gcs2Screen screen coordinates}.</li>
 * <li>
 *  To exhibit a location name in 3D, it is necessary to {@link project transform} its
 * {@link https://www.ibm.com/docs/en/informix-servers/12.10.0?topic=data-geographic-coordinate-system GCS} coordinates
 * into {@link https://olegvaraksin.medium.com/convert-world-to-screen-coordinates-and-vice-versa-in-webgl-c1d3f2868086 screen coordinates}
 * (pixels) and use the {@link https://developer.mozilla.org/en-US/docs/Web/CSS/position position}
 * HTML properties "top" and "left" of the WebGL {@link canvas &lt;canvas&gt;} element (plus a
 * {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/tooltip_role tooltip} element) to display the text.
 * </li>
 * </ul>
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
 * gl-matrix {@link https://glmatrix.net/docs/module-vec2.html 2 Dimensional Vector}.
 * @name vec2
 * @type {glMatrix.vec2}
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
 * A {@link https://en.wikipedia.org/wiki/Geographic_coordinate_system geographic coordinate system} (GCS) is a spherical or
 * geodetic coordinate system for measuring and communicating positions
 * directly on Earth as latitude and longitude.
 * @typedef GCS
 * @property {Number} longitude a geographic coordinate ∈ [-180°,180°] that specifies the east-west position of a point on Earth.
 * @property {Number} latitude a geographic coordinate ∈ [-90°,90°] that specifies a location's north-south position on Earth.
 * @see {@link https://www.ibm.com/docs/en/informix-servers/12.10.0?topic=data-geographic-coordinate-system Geographic coordinate system}
 * @see {@link https://desktop.arcgis.com/en/arcmap/latest/map/projections/about-geographic-coordinate-systems.htm What are geographic coordinate systems?}
 * @see {@link https://www.e-education.psu.edu/natureofgeoinfo/c2_p10.html The Nature of Geographic Information}
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
 * <p>Canvas element and its tooltip.</p>
 * <p>Canvas is used for drawing the globe and its tooltip is used for displaying
 * the GCS coordinates (longitude and latitude) on the globe when pointer is moved upon.</p>
 * <p>Canvas is a bitmap element that can be used to draw graphics on the fly via scripting (usually JavaScript).
 * It is a part of the HTML5 specification and is supported by all modern browsers.</p>
 * <p>Tooltip is a small pop-up box that appears when the user hovers over an element.
 * It is used to provide additional information about the element, such as its coordinates.</p>
 * <p>Both canvas and tooltip are used to provide a better user experience
 * by allowing the user to interact with the globe and see its coordinates.</p>
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("theCanvas");

/**
 * <p>Tooltip element for displaying GCS coordinates on the globe.</p>
 * <p>Tooltip is a small pop-up box that appears when the user hovers over
 * an element. It is used to provide additional information about the element,
 * such as its coordinates.</p>
 * <p>Tooltip is used to provide a better user experience by allowing the user
 * to interact with the globe and see its coordinates.</p>
 * @type {HTMLElement}
 */
const canvastip = document.getElementById("canvastip");

/**
 * HTML elements in the interface.
 * @type {Object}
 * @property {HTMLInputElement} mesh checkbox
 * @property {HTMLInputElement} axes radio
 * @property {HTMLInputElement} equator checkbox
 * @property {HTMLInputElement} hws checkbox
 * @property {HTMLInputElement} fix_uv checkbox
 * @property {HTMLInputElement} merc checkbox
 * @property {HTMLInputElement} cull checkbox
 * @property {HTMLInputElement} texture checkbox
 * @property {HTMLSelectElement} textures select
 * @property {HTMLSelectElement} models select
 * @property {HTMLImageElement} textimg img
 * @property {HTMLInputElement} tooltip checkbox
 * @property {HTMLInputElement} tip checkbox
 * @property {HTMLInputElement} php checkbox
 * @property {HTMLButtonElement} closest button
 * @property {HTMLButtonElement} animation button
 * @property {HTMLInputElement} byDate checkbox
 * @property {HTMLInputElement} locations checkbox
 * @property {HTMLInputElement} timeline range
 * @property {HTMLLabelElement} lblTimeline label
 * @property {HTMLDataListElement} steplist list
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement HTMLElement}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement HTMLInputElement}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement HTMLSelectElement}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement HTMLImageElement}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement HTMLCanvasElement}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLLabelElement HTMLLabelElement}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLDataListElement HTMLDataListElement}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLButtonElement HTMLButtonElement}
 */
const element = {
  mesh: document.getElementById("mesh"),
  axes: document.getElementById("axes"),
  equator: document.getElementById("equator"),
  hws: document.getElementById("hws"),
  fix_uv: document.getElementById("fixuv"),
  merc: document.getElementById("mercator"),
  cull: document.getElementById("culling"),
  texture: document.getElementById("texture"),
  textures: document.getElementById("textures"),
  models: document.getElementById("models"),
  textimg: document.getElementById("textimg"),
  tooltip: document.getElementById("tooltip"),
  tip: document.getElementById("tip"),
  php: document.getElementById("php"),
  closest: document.getElementById("cls"),
  animation: document.getElementById("anim"),
  byDate: document.getElementById("cities"),
  locations: document.getElementById("locs"),
  timeline: document.getElementById("timeline"),
  lblTimeline: document.getElementById("lblTimeline"),
  steplist: document.getElementById("steplist"),
};

/**
 * Convert spherical coordinates to {@link GCS}
 * (longitude, latitude).
 * @param {Object<{s:Number,t:Number}>} uv spherical coordinates ∈ [0,1]}.
 * @return {Object<{longitude: Number, latitude: Number}>} longitude ∈ [-180°,180°], latitude ∈ [-90°,90°].
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
 * Convert from {@link GCS}
 * (longitude, latitude) to UV coordinates.
 * @param {GCS} gcs longitude ∈ [-180°,180°], latitude ∈ [-90°,90°].
 * @return {Object<{s: Number, t: Number}>} UV coordinates ∈ [0,1].
 * @function
 */
const gcs2UV = (gcs) => {
  // Convert longitude and latitude to UV coordinates.
  return {
    s: (gcs.longitude + 180) / 360,
    t: (gcs.latitude + 90) / 180,
  };
};

/**
 * Convert from {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL UV coordinates}
 * (s, t) to {@link https://en.wikipedia.org/wiki/Spherical_coordinate_system spherical coordinates}.
 * @param {Object<{s: Number,t:Number}>} uv ∈ [0,1].
 * @return {Array<{Number, Number}>} spherical coordinates ∈ [0,2π] x [0,π].
 * @function
 */
const UV2Spherical = (uv) => {
  return [uv.s * 2 * Math.PI, -uv.t * Math.PI];
};

/**
 * <p>Calculate distances on the globe using the Haversine Formula.</p>
 * Usage:
 * <pre>
 *  const distance = haversine(
 *        gpsCoordinates["Alexandria"],
 *        gpsCoordinates["Aswan"],
 *  );
 *  console.log(`Distance: ${Math.round(distance.m, 3)} m`);
 *  console.log(`Distance: ${Math.round(distance.km, 3)} km`);
 *
 *  >> Distance: 843754 m
 *  >> Distance: 844 km
 * </pre>
 * @param {GCS} gcs1 first pair of gcs coordinates.
 * @param {GCS} gcs2 second pair of gcs coordinates.
 * @return {Number} distance between gcs1 and gcs2.
 * @see {@link https://en.wikipedia.org/wiki/Haversine_formula Haversine formula}
 * @see {@link https://community.esri.com/t5/coordinate-reference-systems-blog/distance-on-a-sphere-the-haversine-formula/ba-p/902128 Distance on a sphere: The Haversine Formula}
 * @see {@link https://www.distancecalculator.net/from-alexandria-to-aswan Distance from Alexandria to Aswan}
 */
function haversine(gcs1, gcs2) {
  // Coordinates in decimal degrees (e.g. 2.89078, 12.79797)
  const { latitude: lat1, longitude: lon1 } = gcs1;
  const { latitude: lat2, longitude: lon2 } = gcs2;

  const R = 6371000; // radius of Earth in meters
  const phi_1 = toRadian(lat1);
  const phi_2 = toRadian(lat2);

  const delta_phi = toRadian(lat2 - lat1);
  const delta_lambda = toRadian(lon2 - lon1);

  const a =
    Math.sin(delta_phi / 2.0) ** 2 +
    Math.cos(phi_1) * Math.cos(phi_2) * Math.sin(delta_lambda / 2.0) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const m = R * c; // distance in meters
  const km = m / 1000.0; // distance in kilometers

  return { m, km };
}

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
let image = null;

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
 * <p>A set of world locations given by their GPS coordinates.</p>
 * These locations are {@link event:load read} from a <a href="/cwdc/13-webgl/extras/locations.json">json file</a>.
 * @type {Object<location:String, attributes:Object>}
 * @property {String} location name of the site, e.g., "Paris".
 * @property {Object} attributes
 * @property {String} attributes.country country of the site.
 * @property {String} attributes.remarkable site's historical figure.
 * @property {Number} attributes.longitude site's longitude.
 * @property {Number} attributes.latitude site's latitude.
 */
let gpsCoordinates = null;

/**
 * Array of city names, that is, the gpsCoordinates keys.
 * @type {Object}
 * @property {Array<String>} byLongitude city names ordered by longitude.
 * @property {Array<String>} byDate city names ordered by date.
 * @property {Array<String>} current current city names.
 */
const cities = {
  byLongitude: null,
  byDate: null,
  current: null,
  timeline: null,
};

/**
 * Name of the current city location.
 * @type {String}
 */
let currentLocation = null;

/**
 * Current cursor position onto globe.
 * @type {Object<{x:Number,y:Number}>}
 */
let cursorPosition = {
  x: 0,
  y: 0,
};

/**
 * Current meridian onto globe.
 * @type {GCS}
 */
const currentMeridian = { longitude: 0, latitude: 0 };

/**
 * Phong highlight position on screen.
 * @type {vec2}
 */
const phongHighlight = [];

/**
 * Turn display status of the model on/off.
 * @type {Object}
 * @property {Boolean} lines mesh and normals.
 * @property {Boolean} texture lines x texture.
 * @property {Boolean} axes coordinate axes.
 * @property {Boolean} paused Arcball x rotation.
 * @property {Boolean} intrinsic rotation around global x local axes.
 * @property {Boolean} equator parallel and meridian of the current location.
 * @property {Boolean} hws model's trigulation algorithm source: three.js x hws.
 * @property {Boolean} tootip location information.
 * @property {Boolean} cities sequential location traversal order.
 * @property {Boolean} locations location points.
 */
const selector = {
  lines: document.getElementById("mesh").checked,
  texture: document.getElementById("texture").checked,
  axes: document.getElementById("axes").checked,
  paused: document.getElementById("pause").checked,
  intrinsic: document.getElementById("intrinsic").checked,
  equator: document.getElementById("equator").checked,
  hws: document.getElementById("hws").checked,
  tooltip: document.getElementById("tip").checked,
  cities: document.getElementById("cities").checked,
  locations: document.getElementById("locs").checked,
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
let colorBuffer;

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
let locationsBuffer;

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
 * Whether the texture represents a map.
 * @type {Boolean}
 */
let isMap = false;

/**
 * Toggle back face culling on/off.
 * @type {Boolean}
 * @see {@link https://learnopengl.com/Advanced-OpenGL/Face-culling Face culling}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace frontFace() method}
 */
let culling = document.querySelector("#culling").checked;

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
 * <p>Since php runs on the server, and javascript on the browser,
 * a php script is invoked asynchronously via ajax, because Javascript doesn't
 * have access to the filesystem.</p>
 *
 * <p>The JavaScript Fetch API provides a modern, promise-based interface for making
 * network requests, such as fetching data from an API.
 * It is designed to replace older methods like XMLHttpRequest and offers a more
 * streamlined way to handle asynchronous operations.</p>
 *
 * The Response object provides methods to parse the response body in various formats,
 * such as json(), text(), blob(), arrayBuffer(), and formData().
 *
 * @type {Promise<Array<String>>}
 * @see <a href="/cwdc/6-php/readFiles.php">files</a>
 * @see {@link https://stackoverflow.com/questions/31274329/get-list-of-filenames-in-folder-with-javascript Get list of filenames in folder with Javascript}
 * @see {@link https://api.jquery.com/jquery.ajax/ jQuery.ajax()}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch Using the Fetch API}
 */
const readFileNames = new Promise((resolve, reject) => {
  if (false) {
    $.ajax({
      type: "GET",
      url: "/cwdc/6-php/readFiles.php",
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
  } else {
    const params = new URLSearchParams();
    params.append("dir", "/cwdc/13-webgl/extras/textures");
    fetch(`/cwdc/6-php/readFiles.php/dir?${params}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((data) => {
        resolve(JSON.parse(data));
      })
      .catch((error) => {
        console.error("Error:", error);
        console.log("readFileNames: Could not get data");
      });
  }
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
 * Cleans the location name by removing
 * the text in parentheses and the parentheses themselves.
 * @param {String} location name of the location.
 * @return {String} cleaned location name.
 */
const cleanLocation = (location) =>
  location.replace(/\(.*?\)/g, "").replace("_", " ");

/**
 * Updates the label (latitude, longitude and secant)
 * of the given {@link gpsCoordinates location}.
 * @param {String} location name of the location.
 */
function labelForLocation(location) {
  const lat = gpsCoordinates[location].latitude;
  const lon = gpsCoordinates[location].longitude;
  const sec = 1 / Math.cos(toRadian(lat));
  const distance = haversine(
    gpsCoordinates[location],
    gpsCoordinates["Rio"],
  ).km;
  document.querySelector('label[for="equator"]').innerHTML =
    `<i>${cleanLocation(location)}</i> (lat: ${lat.toFixed(5)}°,
    lon: ${lon.toFixed(5)}°), sec(lat): ${sec.toFixed(
      2,
    )}<br>Distance to Rio: ${distance.toFixed(0)} km`;
}

/**
 * Updates the label of the timeline to the given date.
 * @param {Number} dat date.
 */
function labelForTimeline(dat) {
  dat = Math.max(dat, element.timeline.min);
  dat = Math.min(dat, element.timeline.max);
  // element.lblTimeline.style.color = dat < 0 ? "gold" : "red";
  dat = `${Math.abs(dat)} ${dat < 0 ? "BC" : "AD"}`;
  element.lblTimeline.innerHTML = `Timeline: ${dat}`;
}

/**
 * Returns the closest site to the given GCS position (latitude, longitude).
 * @param {GCS} position GCS coordinates.
 * @return {String} closest site name.
 */
function closestSite(position) {
  let minimumDistance = 50e6;
  let closest = "";
  for (const site of cities.current) {
    if (site === "Unknown") continue;
    const distance = haversine(position, gpsCoordinates[site]).m;
    if (distance < minimumDistance) {
      closest = site;
      minimumDistance = distance;
    }
  }
  return closest;
}

/**
 * <p>Convert from {@link GCS}
 * (longitude, latitude) to screen coordinates.</p>
 * This function uses the {@link project WebGL projection}
 * to convert the geographic coordinates to screen coordinates (pixels).
 * <ul>
 * <li>The projection can be either spherical or Mercator.</li>
 * <li>The spherical projection is used for a globe, while the Mercator projection is used for a map.</li>
 * </ul>
 * @param {GCS} location gcs coordinates.
 * @param {Boolean} [mercatorProjection=false] whether to use Mercator projection.
 * @return {Coordinates}
 * @property {Array<{x:Number,y:Number}>} Coordinates.screen screen coordinates.
 * @property {vec3} Coordinates.cartesian cartesian coordinates.
 * @property {Object<{s:Number,t:Number}>} Coordinates.uv spherical coordinates in UV space.
 * @property {Array<Number>} Coordinates.viewport viewport dimensions.
 */
function gcs2Screen(location, mercatorProjection = false) {
  // Convert geographic coordinates to UV coordinates
  // and then to screen coordinates.
  // The UV coordinates are in the range [0, 1].
  const uv = gcs2UV(location);
  const pt = spherical2Cartesian(...UV2Spherical(uv), 1);
  if (mercatorProjection) {
    // mercator projection
    uv.t = spherical2Mercator(uv.s, uv.t).y;
  }
  const viewport = gl.getParameter(gl.VIEWPORT);
  const [x, y] = project(
    [],
    pt,
    getModelMatrix(),
    viewMatrix,
    projection,
    viewport,
  );
  return {
    screen: [x, y],
    cartesian: pt,
    uv: uv,
    viewport: viewport,
  };
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
  const kbd = document.getElementById("kbd");
  const opt = document.getElementById("options");
  const pause = document.getElementById("pause");
  let zoomfactor = 0.7;
  let gscale = 1;
  let subPoly = 0;
  let tri;
  let animationID = null;
  let n, inc;
  const modelM = mat4.identity([]); // model matrix
  const forwardVector = vec3.fromValues(0, 0, 1); // phong highlight
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
        inc = ch == "m" ? 1 : -1;
        numSubdivisions = mod(numSubdivisions + inc, maxSubdivisions + 1);
        gscale = mscale = 1;
        if (numSubdivisions == 0) {
          element.models.value = (subPoly + 9).toString();
        } else {
          element.models.value = "13";
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
        pause.checked = selector.paused;
        if (axis === " ") axis = "y";
        if (!selector.paused) document.getElementById(axis).checked = true;
        animate();
        return;
      case "l":
        selector.lines = !selector.lines;
        if (!selector.lines) selector.texture = true;
        element.mesh.checked = selector.lines;
        element.texture.checked = selector.texture;
        break;
      case "L":
        selector.locations = !selector.locations;
        element.locations.checked = selector.locations;
        break;
      case "k":
        selector.texture = !selector.texture;
        if (!selector.texture) selector.lines = true;
        element.texture.checked = selector.texture;
        element.mesh.checked = selector.lines;
        break;
      case "A":
        if (selector.paused) {
          if (animationID) {
            clearInterval(animationID);
            animationID = null;
          } else {
            animationID = startAnimation();
          }
        }
        break;
      case "a":
        selector.axes = !selector.axes;
        element.axes.checked = selector.axes;
        break;
      case "x":
      case "y":
      case "z":
      case "q":
        axis = ch;
        canvas.style.cursor = "crosshair";
        if (axis == "q") {
          canvas.style.cursor = "wait";
          if (isTouchDevice()) {
            updateCurrentMeridian(...phongHighlight);
          } else {
            updateCurrentMeridian(cursorPosition.x, cursorPosition.y);
          }
        }
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
        element.equator.checked = selector.equator;
        animate();
        break;
      case "Z":
        gscale = mscale = 1;
        element.models.value = "5";
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
        element.models.value = "5";
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
        element.models.value = "13";
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
        element.models.value = "8";
        theModel = createModel({
          shape: getModelData(new THREE.TorusKnotGeometry(1, 0.4, 128, 16)),
          name: "torusknot",
          chi: 1,
        });
        break;
      case "t":
        gscale = mscale = 1;
        element.models.value = "7";
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
        element.models.value = "0";
        theModel = createModel({
          shape: getModelData(new THREE.CapsuleGeometry(0.5, 0.5, 10, 20)),
          name: "capsule",
        });
        break;
      case "c":
        gscale = mscale = 1;
        element.models.value = "3";
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
        element.models.value = "1";
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
        element.models.value = "2";
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
        element.models.value = "6";
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
        element.models.value = (subPoly + 9).toString();
        theModel = createModel({ poly: subPoly });
        kbd.innerHTML = ":";
        break;
      case "r":
        gscale = mscale = 1.0;
        element.models.value = "4";
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
        element.fix_uv.checked = fixuv;
        setUVfix();
        break;
      case "K":
        mercator = !mercator;
        element.merc.checked = mercator;
        break;
      case "b":
        culling = !culling;
        if (culling) gl.enable(gl.CULL_FACE);
        else gl.disable(gl.CULL_FACE);
        element.cull.checked = culling;
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
        element.hws.checked = selector.hws;
        break;
      case "W":
        selector.cities = !selector.cities;
        element.byDate.checked = selector.cities;
        cities.current = element.byDate.checked
          ? cities.byDate
          : cities.byLongitude;
        break;
      case "X":
        const date = +element.timeline.value;
        let dt;
        for (dt of cities.timeline) {
          if (dt >= date) break;
        }
        const index = cities.timeline.indexOf(dt);
        currentLocation = cities.current[index];
        labelForTimeline(dt);
      case "J":
        if (ch == "J") currentLocation = closestSite(gpsCoordinates["Unknown"]);
      case "g":
      case "G":
      case "j":
      case "ArrowRight":
      case "ArrowLeft":
        if (ch == "g" || ch == "ArrowRight") inc = 1;
        else if (ch == "G" || ch == "ArrowLeft") inc = -1;
        else inc = 0;
        if (axis === "q") axis = " "; // current meridian will be lost
        let cl = cities.current.indexOf(currentLocation);
        cl = mod(cl + inc, cities.current.length);
        currentLocation = cities.current[cl];
        setPosition(currentLocation);
        selector.equator = true;
        element.equator.checked = selector.equator;
        labelForLocation(currentLocation);

        const dat = cities.timeline[cl];
        element.timeline.value = dat;
        labelForTimeline(dat);

        if (selector.tooltip) {
          const location = gpsCoordinates[currentLocation];
          const coordinates = gcs2Screen(location, mercator);

          // current location properties
          const country = location.country || "";
          const remarkable = location.remarkable || [];

          let [x, y] = coordinates.screen;
          const pt = coordinates.cartesian;
          const uv = coordinates.uv;
          const viewport = coordinates.viewport;

          if (true) {
            const rotationMatrix = rotateModelTowardsCamera(pt, forwardVector);
            vec3.copy(forwardVector, pt);
            mat4.multiply(modelM, modelM, rotationMatrix);
            rotator.setViewMatrix(modelM);
            [x, y] = project([], pt, modelM, viewMatrix, projection, viewport);
          }

          // on the globe
          y = viewport[3] - y;
          canvastip.style.top = `${y + 5}px`;
          canvastip.style.left = `${x + 35}px`;
          canvastip.innerHTML = `${currentLocation}, ${country}`;
          for (const rem of remarkable) canvastip.innerHTML += `<br>${rem}`;
          canvastip.style.display = "block";
          // on the map
          x = Math.floor(uv.s * textimg.width);
          y = Math.floor(uv.t * textimg.height);
          y = textimg.height - y;
          element.tooltip.style.top = `${y + 5}px`;
          element.tooltip.style.left = `${x + 5}px`;
          element.tooltip.innerHTML = `${cleanLocation(currentLocation)}`;
          element.tooltip.style.display = "block";
        } else {
          element.tooltip.style.display = "none";
          canvastip.style.display = "none";
        }
        animate();
        break;
      case "h":
        selector.tooltip = !selector.tooltip;
        element.tip.checked = selector.tooltip;
        if (!selector.tooltip) {
          element.tooltip.style.display = "none";
          canvastip.style.display = "none";
        } else {
          element.tooltip.style.display = "block";
          canvastip.style.display = "block";
        }
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
 * Rotate the model towards a given vector.
 * @param {vec3} modelPosition model's world coordinates.
 * @param {vec3} modelForward model's forward vector in world coordinates.
 * @returns {mat4} rotation matrix to rotate the model towards the camera.
 * @see {@link https://www.quora.com/How-do-I-calculate-the-angle-between-two-vectors-in-3D-space-using-atan2 How do I calculate the angle between two vectors in 3D space using atan2?}
 */
function rotateModelTowardsCamera(
  modelPosition,
  modelForward = vec3.fromValues(0, 0, 1),
) {
  // Calculate rotation axis (cross product)
  const rotationAxis = vec3.create();
  vec3.cross(rotationAxis, modelPosition, modelForward);

  // Calculate angle between model forward and modelPosition
  const dotProduct = vec3.dot(modelForward, modelPosition);
  // const angle = Math.acos(dotProduct);
  const angle = Math.atan2(vec3.length(rotationAxis), dotProduct);

  // Create rotation matrix
  const rotationMatrix = mat4.create();
  mat4.fromRotation(rotationMatrix, angle, rotationAxis);

  // Return the rotation matrix
  return rotationMatrix;
}

/**
 * Draw the meridian and parallel lines at the {@link currentLocation}
 * on the texture image.
 */
function drawLinesOnImage() {
  const canvasimg = document.getElementById("canvasimg");

  const ctx = canvasimg.getContext("2d");
  ctx.clearRect(0, 0, canvasimg.width, canvasimg.height);

  if (selector.equator) {
    const uv = gcs2UV(gpsCoordinates[currentLocation]);
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
    ctx.closePath();
  }
}

/**
 * Draw the {@link gpsCoordinates} locations
 * on the texture image.
 */
function drawLocationsOnImage() {
  const canvasimg = document.getElementById("canvasimg");

  const ctx = canvasimg.getContext("2d");
  //  ctx.clearRect(0, 0, canvasimg.width, canvasimg.height);

  for (const location of cities.current) {
    const gps = gpsCoordinates[location];
    const uv = gcs2UV(gps);
    uv.t = 1 - uv.t;
    if (mercator) {
      // mercator projection
      uv.t = spherical2Mercator(uv.s, uv.t).y;
    }

    // screen coordinates
    const x = uv.s * canvasimg.width;
    const y = uv.t * canvasimg.height;

    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle =
      location === "Unknown"
        ? "blue"
        : (ctx.fillStyle = gps.remarkable.at(-1).includes(" BC")
            ? "yellow"
            : "red");
    ctx.fill();
    ctx.closePath();
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
    isMap = ["map", "earth", "ndvi"].some((str) =>
      imageFilename[textureCnt].toLowerCase().includes(str),
    );
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
 * <p>Transforms object space coordinates into screen coordinates.</p>
 * @param {Array<Number>} out the receiving vector.
 * @param {vec3} vec 3D vector of object coordinates.
 * @param {mat4} modelMatrix model matrix.
 * @param {mat4} viewMatrix view matrix.
 * @param {mat4} projectionMatrix projection matrix.
 * @param {Array<Number>}viewport the current viewport (as from a gl.getParameter call).
 * @returns {Array<Number>} out.
 * @see {@link https://registry.khronos.org/OpenGL-Refpages/gl2.1/xhtml/gluProject.xml gluProject}
 * @see {@link https://math.hws.edu/graphicsbook/c7/s1.html#webgl3d.1.3 Transforming Coordinates}
 */
function project(
  out,
  vec,
  modelMatrix,
  viewMatrix,
  projectionMatrix,
  viewport,
) {
  const transform = mat4.multiply(
    [],
    projectionMatrix,
    mat4.multiply([], viewMatrix, modelMatrix),
  );

  const p = vec4.fromValues(...vec, 1);

  // project
  vec4.transformMat4(p, p, transform);

  // perspective division (dividing by w)
  vec4.scale(p, p, 1 / p[3]);

  // NDC [-1,1] to screen
  out[0] = viewport[0] + Math.round((p[0] + 1) * 0.5 * viewport[2]);
  out[1] = viewport[1] + Math.round((p[1] + 1) * 0.5 * viewport[3]);
  out[2] = p[2];

  return out;
}

/**
 * <p>Transforms screen coordinates into object space coordinates.</p>
 * @param {Array<Number>} out the receiving vector.
 * @param {vec3} vec 3D vector of screen coordinates.
 * @param {mat4} modelMatrix model matrix.
 * @param {mat4} viewMatrix view matrix.
 * @param {mat4} projectionMatrix projection matrix.
 * @param {Array<Number>} viewport the current viewport (as from a gl.getParameter call).
 * @returns {Array<Number>} out.
 * @see {@link https://nickthecoder.wordpress.com/2013/01/17/unproject-vec3-in-gl-matrix-library/ unproject vec3 in gl-matrix library}
 * @see {@link https://dondi.lmu.build/share/cg/unproject-explained.pdf “Unproject” Explained}
 * @see {@link https://registry.khronos.org/OpenGL-Refpages/gl2.1/xhtml/gluUnProject.xml gluUnProject}
 * @see {@link https://math.hws.edu/graphicsbook/c7/s1.html#webgl3d.1.3 Transforming Coordinates}
 */
function unproject(
  out,
  vec,
  modelMatrix,
  viewMatrix,
  projectionMatrix,
  viewport,
) {
  // normalized [-1,1]
  const x = (2 * vec[0] - viewport[0]) / viewport[2] - 1;
  const y = (2 * vec[1] - viewport[1]) / viewport[3] - 1;
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
 * @returns {vec3|null} intersection point or null, if there is no intersection.
 * @see {@link https://en.wikipedia.org/wiki/Line–sphere_intersection Line–sphere intersection}
 */
function lineSphereIntersection(o, p, c, r) {
  // line direction
  const u = vec3.normalize([], vec3.subtract([], p, o)); // ||p - o||

  const oc = vec3.subtract([], o, c); // o - c
  const a = vec3.dot(u, oc);
  const b = vec3.dot(oc, oc); // ||oc||^2
  const delta = a * a - b + r * r;
  let dist;
  if (delta > 0) {
    const sqrt_delta = Math.sqrt(delta);
    const d1 = -a + sqrt_delta;
    const d2 = -a - sqrt_delta;
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

/**
 * Creates a ray through the pixel at (x, y)
 * on the canvas, unprojects it, and returns its intersection
 * against the sphere of radius 1 centered at the origin (0, 0, 0).
 * @param {Number} x pixel x coordinate.
 * @param {Number} y pixel y coordinate.
 * @returns {vec3|null} intersection point in world coordinates or null if no intersection.
 */
function pixelRayIntersection(x, y) {
  const viewport = gl.getParameter(gl.VIEWPORT);
  y = viewport[3] - y;

  // ray origin in world coordinates
  const o = unproject(
    [],
    vec3.fromValues(x, y, 0),
    getModelMatrix(),
    viewMatrix,
    projection,
    viewport,
  );

  // ray end point in world coordinates
  const p = unproject(
    [],
    vec3.fromValues(x, y, 1),
    getModelMatrix(),
    viewMatrix,
    projection,
    viewport,
  );

  return lineSphereIntersection(o, p, [0, 0, 0], 1);
}

/**
 * <p>Checks if the device is a touch device.</p>
 * It checks for the presence of touch events in the window object
 * and the maximum number of touch points supported by the device.
 * This is useful for determining if the application should use touch-specific
 * features or fall back to mouse events.
 * @returns {Boolean} true if the device is a touch device, false otherwise.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/ Touch events}
 */
const isTouchDevice = () => {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
};

/**
 * Format a number including a plus sign for positive numbers.
 * @param {Number} num number.
 * @param {Number} decimals number of digits to appear after the decimal point.
 * @return {String} a string representing the given number using fixed-point notation.
 */
function formatNumberWithSign(num, decimals) {
  let fixedString = num.toFixed(decimals);
  const eps = 1 / decimals;
  if (num > eps) {
    return `+${fixedString.padStart(decimals + 4, "0")}`;
  } else if (Math.abs(num) < eps) {
    fixedString = `0.${"0".repeat(decimals)}`;
  } else {
    fixedString = `–${fixedString.substring(1).padStart(decimals + 4, "0")}`;
  }
  return fixedString;
}

/**
 * <p>Updates the {@link currentMeridian current meridian} based on the given pixel position.</p>
 * It calculates the {@link pixelRayIntersection intersection} of the pixel ray with the sphere
 * and converts the intersection point to spherical coordinates.
 * If the intersection exists, it updates the {@link currentMeridian} variable
 * and displays the coordinates in the {@link canvastip} element.
 * <p>Note that there is no cursor position on {@link isTouchDevice touch devices}.</p>
 * @param {Number} x pixel x coordinate.
 * @param {Number} y pixel y coordinate.
 * @param {Boolean} setCurrentMeridian if true, updates the currentMeridian variable.
 * @see {@link pixelRayIntersection pixelRayIntersection()}
 */
function updateCurrentMeridian(x, y, setCurrentMeridian = true) {
  const intersection = pixelRayIntersection(x, y);
  if (intersection) {
    const uv = cartesian2Spherical(intersection);
    const gcs = spherical2gcs(uv);
    if (setCurrentMeridian) {
      currentMeridian.longitude = gcs.longitude;
      currentMeridian.latitude = gcs.latitude;
    }
    if (selector.tooltip) {
      canvastip.innerHTML = `(${formatNumberWithSign(gcs.longitude, 2)},
                ${formatNumberWithSign(gcs.latitude, 2)})`;
      canvastip.style.display = "block";
    }
  } else {
    // cursor outside the globe
    updateCurrentMeridian(...phongHighlight, setCurrentMeridian);
  }
}

/**
 * Return cities ordered by date and the timeline.
 * @return {Array<Array>}
 * @property {Array<String>} 0 location names ordered by date.
 * @property {Array<Number>} 1 location corresponding dates.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort Array.prototype.sort()}
 * @see {@link https://www.math.uwaterloo.ca/tsp/index.html Traveling Salesman Problem}
 * @see {@link https://en.wikipedia.org/wiki/Timelines_of_Big_History Timelines of Big History}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getUTCFullYear Date.prototype.getUTCFullYear()}
 */
function sortCitiesByDate() {
  // the array to be sorted
  const data = cities.byLongitude;

  /**
   * <p>Return a {@link gpsCoordinates location} historical figure's last date mentioned.<p>
   * In case it is a range of dates (first-second), it returns the first date.
   *
   * <p>I would like to return Date.parse(date).
   * However, it does not work with BC dates (negative years).</p>
   *
   * @param {String} v location name.
   * @return {Number} year of the date (negative for BC dates).
   * @global
   * @function
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse Date.parse()}
   */
  const getDate = (v) => {
    if (v == "Unknown") return [Number.MAX_VALUE, 0]; // must be the last
    if (v == "Null_Island") return [Number.MIN_SAFE_INTEGER, 0]; // must be the first
    // "American Civil War, 12 April 1861-26 May 1865"
    const remDate = gpsCoordinates[v].remarkable.at(-1).split(",");
    // ["American Civil War", "12 April 1861-26 May 1865"]
    if (remDate.length > 1) {
      let date = remDate.at(-1).split("-");
      // ["12 April 1861", "26 May 1865"]

      date = date[0].trim(); // "12 April 1861"
      // "4 March 1933 BC"
      let bc = false;
      if (remDate.some((s) => s.includes(" BC"))) {
        // if the date is BC, it must be negative
        date = date.replace("BC", "").trim().padStart(4, "0");
        bc = true;
      }

      // date before year 100 is set as 19xx - I gave up...
      const y = date.substring(date.lastIndexOf(" "));
      const d = new Date(date);
      const year = y.length < 4 ? +y : d.getUTCFullYear();

      return [bc ? -year : year, d.getUTCMonth()];
    }
    return [Number.MIN_SAFE_INTEGER, 0];
  };

  // temporary array holds objects with position and sort-value
  const mapped = data.map((v, i) => {
    const d = getDate(v);
    return { i, year: d[0], month: d[1] };
  });

  // sorting the mapped array containing the reduced values
  mapped.sort((a, b) => {
    if (a.year > b.year) {
      return 1;
    }
    if (a.year < b.year) {
      return -1;
    }
    return a.month - b.month;
  });

  // mapped is now sorted by year and month
  const timeline = mapped.map((v) => v.year);
  // and the location names are in the same order
  // as the sorted mapped array
  // so we can map the original data to the sorted order
  // and return the sorted location names
  const location = mapped.map((v) => data[v.i]);

  return [location, timeline];
}

/**
 * <p>Appends event listeners to HTML {@link element elements}.</p>
 * <p>Also appends event listeners to the rot and mode input radio buttons.</p>
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener EventTarget: addEventListener()}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
 */
function addListeners() {
  /**
   * @summary Executed when the mesh checkbox is checked or unchecked.
   * <p>Appends an event listener for events whose type attribute value is change.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event changeMeshcheckBox
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
   */
  element.mesh.addEventListener("change", (event) =>
    handleKeyPress(createEvent("l")),
  );

  /**
   * @summary Executed when the axes checkbox is checked or unchecked.
   * <p>Appends an event listener for events whose type attribute value is change.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event changeAxescheckBox
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
   */
  element.axes.addEventListener("change", (event) =>
    handleKeyPress(createEvent("a")),
  );

  /**
   * @summary Executed when the tooltip checkbox is checked or unchecked.
   * <p>Appends an event listener for events whose type attribute value is change.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event changeTooltipcheckBox
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
   */
  element.tip.addEventListener("change", (event) =>
    handleKeyPress(createEvent("h")),
  );

  /**
   * @summary Executed when the closest element is clicked.
   * <p>Appends an event listener for events whose type attribute value is click.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event clickClosest
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event Element: click event}
   */
  element.closest.addEventListener("click", (event) =>
    handleKeyPress(createEvent("J")),
  );

  /**
   * @summary Executed when the animation element is clicked.
   * <p>Appends an event listener for events whose type attribute value is click.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event clickAnimation
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event Element: click event}
   */
  element.animation.addEventListener("click", (event) => {
    if (!selector.paused) {
      handleKeyPress(createEvent(" "));
    }
    handleKeyPress(createEvent("A"));
  });

  /**
   * <p>Fired when a &lt;input type="range"&gt; is in the
   * {@link https://html.spec.whatwg.org/multipage/input.html#range-state-(type=range) Range state}
   * (by clicking or using the keyboard).</p>
   *
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * Executed when the slider is changed.
   *
   * @summary Appends an event listener for events whose type attribute value is change.
   *
   * @param {Event} event a generic event.
   * @event timeline
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
   */

  element.timeline.addEventListener("change", (event) =>
    handleKeyPress(createEvent("X")),
  );

  /**
   * @summary Executed when the equator checkbox is checked or unchecked.
   * <p>Appends an event listener for events whose type attribute value is change.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event changeEquatorcheckBox
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
   */
  element.equator.addEventListener("change", (event) =>
    handleKeyPress(createEvent("E")),
  );

  /**
   * @summary Executed when the hws checkbox is checked or unchecked.
   * <p>Appends an event listener for events whose type attribute value is change.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event changeHwscheckBox
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
   */
  element.hws.addEventListener("change", (event) =>
    handleKeyPress(createEvent("Alt")),
  );

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

  /**
   * @summary Executed when the fix_uv checkbox is checked or unchecked.
   * <p>Appends an event listener for events whose type attribute value is change.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event changeFixUVcheckBox
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
   */
  element.fix_uv.addEventListener("change", (event) =>
    handleKeyPress(createEvent("f")),
  );

  /**
   * @summary Executed when the mercator checkbox is checked or unchecked.
   * <p>Appends an event listener for events whose type attribute value is change.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event changeMercatorcheckBox
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
   */
  element.merc.addEventListener("change", (event) =>
    handleKeyPress(createEvent("K")),
  );

  /**
   * @summary Executed when the cull checkbox is checked or unchecked.
   * <p>Appends an event listener for events whose type attribute value is change.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event changeCullcheckBox
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
   */
  element.cull.addEventListener("change", (event) =>
    handleKeyPress(createEvent("b")),
  );

  /**
   * @summary Executed when the cities checkbox is checked or unchecked.
   * <p>Appends an event listener for events whose type attribute value is change.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event changeCitiescheckBox
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
   */
  element.byDate.addEventListener("change", (event) =>
    handleKeyPress(createEvent("W")),
  );

  /**
   * @summary Executed when the locations checkbox is checked or unchecked.
   * <p>Appends an event listener for events whose type attribute value is change.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event changeLocationscheckBox
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
   */
  element.locations.addEventListener("change", (event) =>
    handleKeyPress(createEvent("L")),
  );

  /**
   * @summary Executed when the texture checkbox is checked or unchecked.
   * <p>Appends an event listener for events whose type attribute value is change.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event changeTexturecheckBox
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
   */
  element.texture.addEventListener("change", (event) =>
    handleKeyPress(createEvent("k")),
  );

  /**
   * @summary Executed when the textures &lt;select&gt; is changed.
   * <p>Appends an event listener for events whose type attribute value is change.<br>
   * The {@link selectTexture} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event changeTextureSelect
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
   */
  element.textures.addEventListener("change", (event) => {
    selectTexture();
    document.activeElement.blur();
  });

  /**
   * Executed when the models &lt;select&gt; is changed.
   * <p>Appends an event listener for events whose type attribute value is change.<br>
   * The {@link selectModel} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event changeModelsSelect
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
   */
  element.models.addEventListener("change", (event) => selectModel());

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
  element.textimg.addEventListener("pointerdown", (event) => {
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

    const unknown = gpsCoordinates["Unknown"];
    ({ latitude: unknown.latitude, longitude: unknown.longitude } =
      spherical2gcs(uv));
    currentLocation = cities.current.at(-2);
    handleKeyPress(createEvent("g"));
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
  element.textimg.addEventListener("pointermove", (event) => {
    // tooltip on mouse hoover
    if (!selector.tooltip) {
      element.tooltip.innerHTML = "";
      element.tooltip.style.display = "none";
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

    element.tooltip.style.top = `${event.offsetY + 15}px`;
    element.tooltip.style.left = `${x}px`;
    // UV normalized
    element.tooltip.innerHTML = `(${uv.s.toFixed(3)}, ${uv.t.toFixed(3)})`;
    element.tooltip.style.display = "block";
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
  element.textimg.addEventListener("pointerout", (event) => {
    element.tooltip.innerHTML = "";
    element.tooltip.style.display = "none";
  });

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
      if (axis === "q") axis = " ";
      return;
    }

    if (canvas.style.cursor !== "pointer") canvas.style.cursor = "crosshair";

    // tooltip on mouse hoover
    if (moving || !selector.tooltip) {
      canvastip.innerHTML = "";
      canvastip.style.display = "none";
    } else {
      const x = event.offsetX;
      const y = event.offsetY;
      cursorPosition = { x, y };
      const intersection = pixelRayIntersection(x, y);
      if (!intersection) {
        return;
      }

      const uv = cartesian2Spherical(intersection);
      const gcs = spherical2gcs(uv);

      canvastip.style.top = `${y + 15}px`;
      canvastip.style.left = `${x}px`;
      // GCS coordinates
      canvastip.innerHTML = `(${gcs.longitude.toFixed(3)},
                          ${gcs.latitude.toFixed(3)})`;
      canvastip.style.display = "block";
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

    // get the intersection point on the sphere
    const intersection = pixelRayIntersection(event.offsetX, event.offsetY);
    // increment or decrement based on the side of the canvas
    // where the pointer was clicked.
    const ch = event.offsetX > canvas.width / 2 ? "g" : "G";
    if (intersection) {
      const uv = cartesian2Spherical(intersection);
      const unknown = gpsCoordinates["Unknown"];
      ({ latitude: unknown.latitude, longitude: unknown.longitude } =
        spherical2gcs(uv));

      const position = ch === "g" ? -2 : 0;
      currentLocation = cities.current.at(position);
    }
    handleKeyPress(createEvent(ch));
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
}

/**
 * Sets up an interval to check for key presses every 2 seconds.
 * This is useful for simulating key presses or for periodic updates.
 * The interval will call the {@link handleKeyPress} function with a simulated event
 * that has the key 'g' pressed, which is used to trigger the next location in the timeline.
 * This is particularly useful for testing or for automatically cycling through locations.
 * @param {Number} [delay=2000] - The interval time in milliseconds.
 * Defaults to 2000 milliseconds (2 seconds).
 * This function will repeatedly call {@link handleKeyPress} with a simulated event
 * that has the key 'g' pressed, effectively simulating a key press every 2s.
 * @return {Number} The ID of the interval that can be used to clear it later.
 * This ID can be passed to `clearInterval()` to stop the animation.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval Window: setInterval() method}
 * @see {@link createEvent}
 */
function startAnimation(delay = 2000) {
  return window.setInterval(() => {
    // Set interval for checking
    handleKeyPress(createEvent("g"));
  }, delay);
}

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
  if (selector.locations && isMap) drawLocations();
  drawLinesOnImage();
  if (isMap) drawLocationsOnImage();
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
  gl.uniform1f(loc, shininess.at(-1));

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
 * <p>Draws all location points. </p>
 * Uses the {@link colorShader}.
 */
function drawLocations() {
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

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(colorIndex);

  // set transformation to projection * view * model
  const loc = gl.getUniformLocation(colorShader, "transform");
  const transform = mat4.multiply(
    [],
    projection,
    mat4.multiply([], viewMatrix, getModelMatrix()),
  );
  gl.uniformMatrix4fv(loc, false, transform);

  // draw locations
  gl.bindBuffer(gl.ARRAY_BUFFER, locationsBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(colorIndex, 3, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.POINTS, 0, cities.current.length);

  gl.disableVertexAttribArray(positionIndex);
  gl.disableVertexAttribArray(colorIndex);
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
 * Set range tick dates of an html &lt;range&gt; element identified by "steplist".
 * @param {Array<Number>} optionNames array of timeline dates.
 */
function setRangeTicks(optionNames) {
  const sel = element.steplist;

  let options_str = "";

  optionNames.forEach((date, index) => {
    const christ = Math.trunc(
      ((-4 - optionNames[1]) / (optionNames.at(-2) - optionNames[1])) *
        optionNames.length -
        2,
    );
    if (index === 1) {
      options_str += `<option value=${date} label="${Math.abs(
        date,
      )} BC"></option>`;
    } else if (index === optionNames.length - 2) {
      options_str += `<option value=${date} label="${Math.abs(
        date,
      )} AD"></option>`;
    } else if (index === christ) {
      options_str += `<option value=${date} label="4 BC"></option>`;
    } else {
      options_str += `<option value=${date}></option>`;
    }
  });

  sel.innerHTML = options_str;
}

/**
 * <p>Loads the {@link image texture image} and {@link gpsCoordinates} asynchronously
 * and defines its {@link ImageLoadCallback load callback function}.</p>
 * @param {Event} event load event.
 * @callback WindowLoadCallback
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event load event}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image Image() constructor}
 * @see {@link https://web.cse.ohio-state.edu/~shen.94/581/Site/Slides_files/texture.pdf Texture Mapping}
 * @see {@link https://www.evl.uic.edu/pape/data/Earth/ Earth images}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch Using the Fetch API}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse JSON.parse()}
 * @event load
 */
window.addEventListener("load", (event) => {
  fetch(`${location.protocol}/cwdc/13-webgl/extras/locations.json`)
    .then((response) => response.text())
    .then((json) => {
      gpsCoordinates = JSON.parse(json);
      cities.byLongitude = Object.keys(gpsCoordinates);
      cities.current = cities.byLongitude;
      currentLocation =
        cities.current[Math.floor(Math.random() * cities.current.length)];

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
          if (!element.php.checked) {
            getTextures(imageFilename);
            startForReal(image);
          } else {
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
          }
        } else {
          newTexture(image);
          draw();
        }
      };
      // starts loading the image asynchronously
      image.src = `./textures/${imageFilename[0]}`;
      mercator = imageFilename[0].includes("Mercator");
      isMap = ["map", "earth", "ndvi"].some((str) =>
        imageFilename[0].toLowerCase().includes(str),
      );
      document.getElementById("mercator").checked = mercator;
    })
    .catch((err) => {
      console.error(err);
    });
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
  locationsBuffer = gl.createBuffer();
  colorBuffer = gl.createBuffer();
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

  const [locationsVertices, locationsColors] = pointsOnLocations();
  gl.bindBuffer(gl.ARRAY_BUFFER, locationsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, locationsVertices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, locationsColors, gl.STATIC_DRAW);

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
  addListeners();
  [cities.byDate, cities.timeline] = sortCitiesByDate();
  cities.current = selector.cities ? cities.byDate : cities.byLongitude;

  // Phong highlight position: (0,0,1) = {-90,0} in GCS
  const coordinates = gcs2Screen({ longitude: -90, latitude: 0 }, false);
  phongHighlight.push(...coordinates.screen);

  setRangeTicks(cities.timeline);
  handleKeyPress(createEvent("X"));

  // start drawing!
  animate();
}

/**
 * Return an array with all points on {@link gpsCoordinates}.
 * @return {Array<Float32Array>} locations points.
 * @property {Float32Array} 0 locations coordinate array.
 * @property {Float32Array} 1 locations color array.
 */
function pointsOnLocations() {
  const n = cities.current.length;
  const arr = new Float32Array(3 * n);
  const crr = new Float32Array(3 * n);

  for (let i = 0, j = 0; i < n; ++i, j += 3) {
    const gcs = gpsCoordinates[cities.current[i]];
    const uv = gcs2UV(gcs);
    const [theta, phi] = UV2Spherical(uv);
    const p = spherical2Cartesian(theta, phi, 1.01);
    arr[j] = p[0];
    arr[j + 1] = p[1];
    arr[j + 2] = p[2];

    crr[j] = 1;
    crr[j + 1] = gcs.remarkable.at(-1).includes("BC") ? 1 : 0;
    crr[j + 2] = 0;
  }
  return [arr, crr];
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
    if (selector.paused) {
      drawLinesOnImage();
      if (isMap) drawLocationsOnImage();
    }
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
 * Returns a vector perpendicular to the meridian at the given longitude.
 * The meridian is the line of longitude at the given longitude,
 * which is the angle from the prime meridian (0° longitude).
 * The perpendicular vector is in the xz-plane, with y = 0.
 *
 * @param {Number} longitude meridian longitude.
 * @returns {vec3} vector perpendicular to the meridian at the given longitude.
 */
function meridianPerpVec(longitude) {
  const [x, y, z] = spherical2Cartesian(toRadian(longitude), Math.PI / 2, 1);
  return [z, 0, -x];
}

/**
 * <p>Returns a rotation matrix around the vector perpendicular to the
 * given meridian, by the given increment.</p>
 * Ensure longitude is in [0,180) range,
 * so that the perpendicular vector does not change direction
 * if longitude is in the western hemisphere.
 * @param {mat4} out the receiving matrix.
 * @param {GCS} meridian given meridian.
 * @param {Number} increment angle (in radians) to rotate around.
 * @returns {mat4} out.
 */
function meridianMatrix(out, meridian, increment) {
  let longitude = meridian?.longitude || 0;
  if (longitude < 0) {
    longitude += 180;
  }
  const perp = meridianPerpVec(longitude);
  mat4.fromRotation(out, increment, perp);
  return out;
}

/**
 * <p>Define an {@link frame animation} loop.</p>
 * Step 0.5° ⇒ 60 fps = 30°/s ⇒ 360° in 12s
 * @see {@link https://dominicplein.medium.com/extrinsic-intrinsic-rotation-do-i-multiply-from-right-or-left-357c38c1abfd Extrinsic & intrinsic rotation}
 */
const animate = (() => {
  /**
   * Increase the rotation by some amount,
   * irrespective of the axis chosen.
   * @type {Number}
   */
  const increment = toRadian(0.5);

  /**
   * An unsigned long integer value, the request ID,
   * that uniquely identifies the entry in the callback list.
   * You should not make any assumptions about its value.
   * You can pass this value to window.cancelAnimationFrame()
   * to cancel the refresh callback request.
   * @type {Number}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame Window: requestAnimationFrame() method}
   */
  let requestID = 0;

  /**
   * <p>Rotation matrix for the three axes. </p>
   * The rotation matrices are created at compile (loading) time, so that
   * they can be reused in each frame without recalculating them.
   * The rotation matrices are used to rotate the model
   * around the x, y, or z axis, depending on the axis chosen.
   * The rotation is done by multiplying the model matrix with the
   * rotation matrix, either on the left (extrinsic rotation) or
   * on the right (intrinsic rotation).
   * @type {Object}
   * @global
   * @property {mat4} x rotation matrix around the x-axis.
   * @property {mat4} y rotation matrix around the y-axis.
   * @property {mat4} z rotation matrix around the z-axis.
   */
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
      if (!isTouchDevice()) {
        updateCurrentMeridian(cursorPosition.x, cursorPosition.y, false);
      } else {
        // on touch devices, use the phong highlight position
        updateCurrentMeridian(...phongHighlight, false);
      }

      const rotationMatrix =
        axis === "q"
          ? meridianMatrix([], currentMeridian, increment)
          : rotMatrix[axis];

      if (selector.intrinsic) {
        // intrinsic rotation - multiply on the right
        mat4.multiply(modelMatrix, modelMatrix, rotationMatrix);
      } else {
        // extrinsic rotation - multiply on the left
        mat4.multiply(modelMatrix, rotationMatrix, modelMatrix);
      }
      rotator.setViewMatrix(modelMatrix);
      // request that the browser calls animate() again "as soon as it can"
      requestID = requestAnimationFrame(animate);
    } else {
      modelMatrix = rotator.getViewMatrix();
    }
  };
})();
