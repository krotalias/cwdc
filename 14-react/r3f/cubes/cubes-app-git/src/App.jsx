/**
 * @file
 *
 * Summary.
 * <p>Two rotating cubes using {@link https://react.dev React}
 * with {@link https://www.digitalocean.com/community/tutorials/how-to-set-up-a-react-project-with-vite Vite}.</p>
 * When the mouse is hovered onto a cube, its color changes from orange to hotpink.<br>
 * When a cube is clicked, its scale is toggled from 1 to 1.5 and its color changes.
 * The process of selecting colors is more complicated than it seems, because
 * {@link external:react.useEffect React useState} is asynchronous!
 *
 * <p>We label the cubes and their colors by calling Text,
 * with Hi-quality rendering w/ signed distance fields (SDF) and antialiasing,
 * using {@link https://protectwise.github.io/troika/troika-three-text/ troika-3d-text}.
 * It is also possible to use Text3D, with {@link https://hyper2.com.br/js/fonts/ type face} fonts.</p>
 *
 * <figure>
 *  <img src="../Text3D.png" width="256">
 *  <figcaption style="font-size: 100%">Text3D with bevel</figcaption>
 * </figure>
 *
 * <p>Finally, {@link https://codesandbox.io/p/sandbox/np6s28 decals}
 * are applied to each face of the cubes.
 *
 * Decals are objects that interfere with the
 * "{@link https://antongerdelan.net/opengl/raycasting.html mouse picking}"
 * and to avoid mistakes,
 * we call {@link https://r3f.docs.pmnd.rs/api/events event.stopPropagation()}
 * to get only the first intersection when a pick ray is cast. Furthermore, if
 * {@link http://drei.docs.pmnd.rs/abstractions/decal#decal no material
 * is specified}, a transparent meshBasicMaterial
 * with a polygonOffsetFactor of -10 will be created,
 * producing an awkward effect when the cubes overlap.</p>
 *
 * <figure>
 *  <img src="../decals.png" width="256">
 *  <figcaption style="font-size: 100%">Overlap with transparent meshBasicMaterial</figcaption>
 * </figure>
 *
 * <figure>
 *  <img src="../cubes2.png" width="256">
 *  <figcaption style="font-size: 100%">meshBasicMaterial specified</figcaption>
 * </figure>
 *
 <p>Usage: </p>
 * <ul>
 *  <li>To install {@link https://www.npmjs.com/package/jsdoc jsdoc},
 * {@link https://www.npmjs.com/package/vite Vite},
 * yarn and {@link https://pnpm.io pnpm}:</li>
 *  <ul>
 *    <li>sudo npm install --global vite</li>
 *    <li>sudo npm install --global yarn</li>
 *    <li>sudo npm install -g jsdoc</li>
 *    <li>sudo npm install -g pnpm</li>
 *  </ul>
 *  <li>To run the version with modules and Node.js version
 *     {@link https://nodejs.org/en/blog/release/v18.19.0 18} or
 *     {@link https://nodejs.org/en/blog/release/v20.10.0 20}:</li>
 *  <ul>
 *    <li>cd cubes</li>
 *    <li>{@link https://www.npmjs.com npm} or {@link https://yarnpkg.com yarn} install</li>
 *    <li>{@link https://www.npmjs.com npm} run dev -- --host (for using vite) <br> or
 *        {@link https://www.npmjs.com npm} start <br> or
 *        {@link https://yarnpkg.com/package/react yarn} start</li>
 *  </ul>
 * </ul>
 *
 * @author Paulo Roma
 * @since 10/10/2024
 * @see <a href="../src/App.jsx">source</a>
 * @see <a href="https://cubes-app.vercel.app/">link</a>
 * @see {@link https://codesandbox.io/p/sandbox/sfypdx original code}
 * @see <img src="../cubes.png" width="340">
 */

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
    Bounds,
    OrbitControls,
    Text,
    Text3D,
    useMatcapTexture,
    Center,
    useTexture,
    Decal,
} from "@react-three/drei";
import "./index.css";

/**
 * Three.js module.
 * @external THREE
 * @see {@link https://threejs.org/docs/#manual/en/introduction/Installation Installation}
 * @see {@link https://discoverthreejs.com DISCOVER three.js}
 * @see {@link https://riptutorial.com/ebook/three-js Learning three.js}
 */

/**
 * <p>React</p>
 * The library for web and native user interfaces
 * @external react
 * @see {@link https://react.dev/ React Top-Level API}
 * @see {@link https://react.dev/reference/react/Suspense Suspense}
 * @see {@link https://react.dev/reference/react/useState useState}
 * @see {@link https://react.dev/reference/react/useRef useRef}
 * @see {@link https://react.dev/reference/react/useEffect useEffect}
 */

/**
 * <p>React DOM.</p>
 * The react-dom package contains methods that are only supported
 * for the web applications (which run in the browser DOM environment).
 * <p>They are not supported for React Native.</p>
 * @external react-dom
 * @see {@link https://react.dev/reference/react-dom React DOM APIs}
 */

/**
 * <p>A React renderer for three.js.</p>
 * Build your scene declaratively with re-usable,
 * self-contained components that react to state,
 * are readily interactive and can participate in React's ecosystem.
 * @external react-three/fiber
 * @see {@link https://r3f.docs.pmnd.rs/api/canvas Canvas}
 * @see {@link https://r3f.docs.pmnd.rs/api/events Events}
 * @see {@link https://r3f.docs.pmnd.rs/api/hooks Hooks}
 * @see {@link https://r3f.docs.pmnd.rs/getting-started/introduction R3F introduction}
 * @see {@link https://byteofdev.com/posts/how-to-use-esm/ How to use ESM}
 * @see {@link https://www.youtube.com/watch?v=DPl34H2ISsk I wish I knew this before using React Three Fiber}
 * @see {@link https://r3f.docs.pmnd.rs/tutorials/how-it-works How does it work?}
 */

/**
 * A growing collection of useful helpers and fully functional,
 * ready-made abstractions for @react-three/fiber.
 * @external react-three/drei
 * @see {@link https://github.com/pmndrs/drei drei}
 * @see {@link https://drei.docs.pmnd.rs/cameras/perspective-camera PerspectiveCamera}
 * @see {@link https://drei.docs.pmnd.rs/controls/introduction Controls}
 * @see {@link https://sbcode.net/react-three-fiber/orbit-controls/ OrbitControls}
 * @see {@link http://drei.docs.pmnd.rs/misc/select Select}
 * @see {@link https://drei.docs.pmnd.rs/staging/bounds Bounds}
 * @see {@link http://drei.docs.pmnd.rs/staging/environment Environment}
 * @see {@link http://drei.docs.pmnd.rs/staging/lightformer Lightformer}
 * @see {@link http://drei.docs.pmnd.rs/abstractions/text Text}
 * @see {@link https://drei.docs.pmnd.rs/abstractions/text3d#text3d Text3D}
 * @see {@link http://drei.docs.pmnd.rs/abstractions/decal#decal Decal}
 * @see {@link http://drei.docs.pmnd.rs/staging/matcap-texture-use-matcap-texture#matcaptexture-/-usematcaptexture useMatcapTexture}
 */

/**
 * <p>Color table.</p>
 * RGB primary colors and their
 * {@link https://en.wikipedia.org/wiki/Complementary_colors complementary}
 * colors, CYM, used for printing.
 * @type {Object<Number, String>}
 */
const colors = {
    0: "red",
    2: "green",
    4: "blue",
    1: "cyan",
    3: "magenta",
    5: "yellow",
    6: "orange",
    7: "hotpink",
};

/**
 * Number of colors used for shading cubes.
 * @type {Number}
 */
const ncolors = Object.keys(colors).length - 2;

/**
 * Box component.
 * @param {Object} props information that you pass to a JSX tag.
 * @param {React.MutableRefObject} props.color.State color state.
 * @param {Array<Number>} props.position box position.
 * @param {String} props.name box name.
 * @returns {ThreeElements} view as regular three.js elements expressed in JSX.
 */
function Box({ colorState, position, name } = props) {
    /**
     * This reference will give us direct access to a Box mesh.
     * @type {React.MutableRefObjec}
     * @global
     */
    const meshRef = useRef();

    const [color, setColor] = colorState;

    /**
     * Set up the clicked and active states.
     * States are pairs with an stateful value,
     * and a function to update it.
     */
    const [clicked, setClick] = useState(false);
    const [active, setActive] = useState(false);
    const root = document.querySelector(":root");
    /**
     * Element identified by "#output".
     * @type {Element}
     * @global
     */
    const output = document.querySelector("#output");
    const [pmndrsImg, reactImg, threeImg] = useTexture([
        "/pmndrs.png",
        "/react.png",
        "/three.png",
    ]);

    /**
     * Returns the next color index (key) in the range [0, {@link ncolors}] from the {@link colors color Object}.
     * @global
     * @param {Number} c color index.
     * @returns {Number} next color index.
     */
    const nextColor = (c) => (c >= ncolors ? 0 : (1 + c) % ncolors);

    // Subscribe this component to the render-loop, to rotate the mesh in each frame.
    useFrame((state, delta) => (meshRef.current.rotation.x += delta));

    /**
     * Sets the {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML innerHTML}
     * and {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style style.color}
     * properties of the Element {@link output}.
     * @global
     * @param {String} txt output setter id.
     * @param {Number} cor color index.
     */
    const setOutput = (txt, cor) => {
        if (output) {
            output.style.color = colors[cor];
            output.innerHTML = `${txt}<br /> name: ${meshRef.current.name}, color: ${cor} → ${colors[cor]}`;
        }
    };

    /**
     * <p>React {@link https://react.dev/reference/react/useState useState}
     * hook is asynchronous!</p>
     * <p>Basically, you don't get update value right after updating state.</p>
     *
     * The {@link https://react.dev/reference/react/useEffect useEffect}
     * hook executes after the function returns
     * the generated component instance within it,
     * which means that any ref or state will be assigned before
     * the useEffect hook gets called.
     *
     * <p>This code will always use the latest value of clicked,
     * which will be used in the next draw.</p>
     *
     * @function useEffect
     * @memberof external:react
     *
     * @see {@link https://making.close.com/posts/state-management-with-async-functions The Pitfalls of useState with Asynchronous Functions in React}
     * @see {@link https://dev.to/shareef/react-usestate-hook-is-asynchronous-1hia React useState hook is asynchronous!}
     */
    useEffect(() => {
        const cor = color === false ? ncolors : nextColor(color);
        setColor(cor);
        setOutput("useEffect", cor);
        console.log(
            `useEffect: clicked ${clicked}, name: ${meshRef.current.name}, color: ${cor} → ${colors[cor]}`,
        );
    }, [clicked]);

    return (
        <mesh
            position={position}
            name={name}
            ref={meshRef}
            scale={active ? 1.5 : 1}
            /**
             * Gets the picked (clicked) object (Box) and sets its color.
             * The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML innerHTML}
             * property of the Element {@link output} is also updated.
             * @param {PointerEvent} event pointer ThreeEvent.
             * @event click - fires after both the mousedown and mouseup events have fired in that order.
             * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event Element: click event}
             */
            onClick={(event) => {
                const cubeName = event.eventObject.name;
                event.stopPropagation();
                setActive(!active);
                // either way does work
                if (cubeName.includes("1")) {
                    setClick(!clicked);
                } else {
                    // functional update
                    setColor((prevColor) => nextColor(prevColor));
                    const cor = nextColor(color);
                    setOutput("functional update", cor);
                }
            }}
            /**
             * Gets the hovered object (Box) and sets its color.
             * The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML innerHTML}
             * property of the Element {@link output} is also updated.
             * @param {PointerEvent} event pointer ThreeEvent.
             * @event pointover - fired when a pointing device is moved into an element's hit test boundaries.
             * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/pointerover_event Element: pointerover event}
             */
            onPointerOver={(event) => {
                setColor(ncolors + 1);
                setOutput("Hovered", ncolors + 1);
            }}
            /**
             * Gets the unhovered object (Box) and sets its color.
             * The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML innerHTML}
             * property of the Element {@link output} is also updated.
             * @param {PointerEvent} event pointer ThreeEvent.
             * @event pointout - fired when a pointing device is moved out of the hit test boundaries of an element.
             * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/pointerout_event Element: pointerout event}
             */
            onPointerOut={(event) => {
                setColor(ncolors);
                setOutput("Unhovered", ncolors);
            }}
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={colors[color]} />
            <Decal position={[0.5, 0, 0]} scale={0.75}>
                <meshBasicMaterial
                    map={reactImg}
                    polygonOffset
                    polygonOffsetFactor={-1}
                />
            </Decal>
            <Decal position={[-0.5, 0, 0]} scale={0.75}>
                <meshBasicMaterial
                    map={reactImg}
                    polygonOffset
                    polygonOffsetFactor={-1}
                />
            </Decal>
            <Decal
                position={[0, 0.5, 0]}
                rotation={[Math.PI / 3, 0, 0]}
                scale={[0.75, 0.65, 1]}
            >
                <meshBasicMaterial
                    map={threeImg}
                    polygonOffset
                    polygonOffsetFactor={-1}
                />
            </Decal>
            <Decal
                position={[0, -0.5, 0]}
                rotation={[Math.PI / 3, 0, 0]}
                scale={[0.75, 0.65, 1]}
            >
                <meshBasicMaterial
                    map={threeImg}
                    polygonOffset
                    polygonOffsetFactor={-1}
                />
            </Decal>
            <Decal position={[0, 0, 0.5]} rotation={[0, 0, 0]} scale={0.75}>
                <meshBasicMaterial
                    map={pmndrsImg}
                    polygonOffset
                    polygonOffsetFactor={-2}
                />
            </Decal>
            <Decal
                position={[0, 0, -0.5]}
                rotation={[0, 0, -Math.PI / 2]}
                scale={0.75}
            >
                <meshBasicMaterial
                    map={pmndrsImg}
                    polygonOffset
                    polygonOffsetFactor={-2}
                />
            </Decal>
        </mesh>
    );
}

/**
 * Creates a text with the Box identifier and color used.
 * <pre>
 *    Box 1 (Text)
 *  color: 5 → yellow
 * </pre>
 * @param {String} txt text.
 * @param {Number} color text color index.
 * @returns {String} composed text.
 */
function createText(txt, color) {
    const arrow = txt.includes("3D") ? "-->" : "→";
    const cor = colors[color];
    const str = `${color} ${arrow} ${cor}`;
    const len = Math.abs(7 + str.length - txt.length);

    return `${" ".repeat(len) + txt}\ncolor: ${str}`;
}

/**
 * Display a {@link external:react-three/drei 3D text}.
 * @param {Object} props information that you pass to a JSX tag.
 * @param {Array<Number>} props.position text position.
 * @param {String} props.txt text.
 * @param {String} props.color text color.
 * @returns {ThreeElements} view as regular three.js elements expressed in JSX.
 * @see {@link https://codesandbox.io/p/sandbox/r3f-drei-3d-text-de86ih?file=%2Fsrc%2FApp.js%3A35%2C15-35%2C27 3f-drei-3d-text}
 */
function DisplayText3D({ position, txt, color } = props) {
    const { viewport } = useThree();

    const w = viewport.width;
    const h = viewport.height;
    const d = Math.min(w, h);
    const fsize = Math.max(d / 30, 0.08);

    // const [matcapTexture] = useMatcapTexture("CB4E88_F99AD6_F384C3_ED75B9");
    // <meshMatcapMaterial color={cor} matcap={matcapTexture} />
    return (
        <Text3D
            position={position}
            scale={[1, 1, 0.1]}
            size={fsize}
            maxWidth={[w / 5, h * 2, 1]}
            font={"./helvetiker_regular.typeface.json"}
            curveSegments={24}
            bevelEnabled
            bevelSegments={1}
            bevelSize={0.005}
            bevelThickness={0.03}
            height={0.5}
            lineHeight={1.9}
            letterSpacing={0.02}
        >
            {txt}
            <meshStandardMaterial color={color} />
        </Text3D>
    );
}

/**
 * Display a {@link external:react-three/drei text}.
 * @param {Object} props information that you pass to a JSX tag.
 * @param {Array<Number>} props.position text position.
 * @param {String} props.txt text.
 * @param {String} props.color text color.
 * @returns {ThreeElements} view as regular three.js elements expressed in JSX.
 */
function DisplayText({ position, txt, color } = props) {
    const { viewport } = useThree();
    const d = Math.min(viewport.width, viewport.height);
    const fsize = Math.max(d / 15, 0.18);

    return (
        <Text
            position={position}
            fontSize={fsize}
            color={color}
            anchorX="center"
            anchorY="middle"
        >
            {txt}
        </Text>
    );
}

/**
 * <p>Returns a {@link https://legacy.reactjs.org/docs/introducing-jsx.html JSX}
 * element with a R3F canvas.</p>
 * When you want to aggregate data from multiple children or to have two child components communicate with each other,
 * move the state upwards so that it lives in the parent component.
 * The parent can then pass the state back down to the children via props,
 * so that the child components are always in sync with each other and with the parent.
 * All of this is possible because of {@link https://levelup.gitconnected.com/unlocking-the-power-of-closures-in-react-components-ba5903f4710a closures}.
 * @module
 * @function App
 * @returns {HTMLCanvasElement} R3F {@link external:react-three/fiber Canvas}.
 */
export default function App() {
    const cs1 = useState(false);
    const cs2 = useState(false);
    return (
        <>
            <div id="output"></div>
            <Canvas camera={{ fov: 35, position: [0, 0, 4] }}>
                <OrbitControls />
                <ambientLight intensity={Math.PI / 2} />
                <spotLight
                    position={[10, 10, 10]}
                    angle={0.15}
                    penumbra={1}
                    decay={0}
                    intensity={Math.PI}
                />
                <pointLight
                    position={[-10, -10, -10]}
                    decay={0}
                    intensity={Math.PI}
                />
                <Suspense>
                    <Bounds fit clip margin={1.2} damping={0}>
                        <Box
                            position={[-1.2, 0, 0]}
                            name={"Box1"}
                            colorState={cs1}
                        />
                        <Box
                            position={[1.2, 0, 0]}
                            name={"Box2"}
                            colorState={cs2}
                        />
                        <DisplayText
                            position={[-1.2, 1.5, 0]}
                            txt={createText("Box 1 (Text)", cs1[0])}
                            color={colors[cs1[0]]}
                        />
                        <DisplayText
                            position={[1.2, 1.5, 0]}
                            txt={createText("Box 2 (Text)", cs2[0])}
                            color={colors[cs2[0]]}
                        />
                        <Center top center>
                            <DisplayText3D
                                position={[0, 0, 0]}
                                txt={"R3F (Text3D)"}
                                color={"#C0C0C0"}
                            />
                        </Center>
                    </Bounds>
                </Suspense>
            </Canvas>
        </>
    );
}
