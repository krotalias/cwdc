/**
 * Sample solution for homework 3, problem 3, done in Three.js
 *
 * Same as RotatingSquare.js but uses a "dummy" object to act
 * as the parent of the other three.  Using dummy objects makes
 * it easier to deal with cases in which hierarchical objects
 * have different scales, or need to perform a rotation that
 * is not through the object's center.
 *
 * @since 10/11/2014
 */

"use strict";

/** Entry point when page is loaded. */
function main() {
    var scene = new THREE.Scene();

    // ortho args are left, right, top, bottom (backwards!), near, far
    var camera = new THREE.OrthographicCamera(-1.1, 1.3, 1.1, -1.3, -1, 1);

    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 1;

    var ourCanvas = document.getElementById("theCanvas");

    var renderer = new THREE.WebGLRenderer({ canvas: ourCanvas });
    renderer.setClearColor(0x00cccc);

    // dummy object
    var holder = new THREE.Object3D();

    // create a red square
    var geometry = new THREE.PlaneGeometry(1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    // vertical rectangle
    var rect1 = new THREE.Mesh(geometry, material);
    rect1.scale.set(0.15, 0.4, 1.0);
    holder.add(rect1);

    // horizontal rectangle
    var rect2 = new THREE.Mesh(geometry, material);
    rect2.scale.set(0.4, 0.15, 1.0);
    holder.add(rect2);

    // little square is a child of holder, so it is scaled according
    // to holder's frame just like
    var rect3 = new THREE.Mesh(geometry, material);
    holder.add(rect3);
    rect3.translateY(0.425); // .2 + .15 + .075
    rect3.scale.set(0.15, 0.15, 1);

    scene.add(holder);

    /**
     * A closure to set up an animation loop in which the
     * angle grows by "increment" each frame.
     */
    var runanimation = (() => {
        var angle = 0.0;
        var increment = 1.0;

        return () => {
            var rangle = THREE.MathUtils.degToRad(angle);
            var tx = 0.75 * Math.cos(rangle);
            var ty = 0.75 * Math.sin(rangle);
            holder.position.set(tx, ty, 0.0);
            holder.rotation.z = -2 * rangle;

            renderer.render(scene, camera);

            angle += increment;
            angle %= 360;

            // request that the browser calls animate() again "as soon as it can"
            requestAnimationFrame(runanimation);
        };
    })();

    // draw!
    runanimation();
}
