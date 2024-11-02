/**
 * @file
 *
 * @example
 * <!-- The recommended way of importing three.js is by using an importmap in the HTML file -->
 * <script type="importmap">
 *    {
 *      "imports": {
 *          "three": "https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js",
 *          "three/addons/": "https://cdn.jsdelivr.net/npm/three@latest/examples/jsm/"
 *      }
 *    }
 * </script>
 *
 * @example
 * // Then, in the javascript file:
 * import * as THREE from "three";
 * import { OrbitControls } from "three/addons/controls/OrbitControls.js";
 *
 * @example
 * // Or, if you do not want an importmap:
 * import * as THREE from "https://unpkg.com/three@latest/build/three.module.js?module";
 * import { OrbitControls } from "https://unpkg.com/three@latest/examples/jsm/controls/OrbitControls.js?module";
 */
