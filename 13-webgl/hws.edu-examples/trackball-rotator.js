/**
 * @file
 *
 * Summary.
 *
 * <p>The TrackballRotator class implements an <a href="/cwdc/13-webgl/extras/doc/Arcball.pdf">ArcBall</a> like interface.</p>
 * Create by {@link https://dl.acm.org/profile/81100026146 Ken Shoemake} in 1992,
 * it is the de facto <a href="/cwdc/13-webgl/extras/doc/shoemake92-arcball.pdf">standard</a>
 * for interactive 3D model manipulation and visualization.
 * <p>The class defines the following methods for an object rotator of type TrackballRotator:</p>
 * <ul>
 *    <li>{@link TrackballRotator#getViewMatrix}() <br>
 *        Returns the view transformation matrix as a regular JavaScript
 *        array of 16 elements, in {@link https://en.wikipedia.org/wiki/Row-_and_column-major_order column-major} order,
 *        suitable for use with
 *        {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniformMatrix gl.uniformMatrix4fv}
 *        or for further transformation with the {@link https://glmatrix.net glMatrix} library {@link mat4} class.</li>
 *    <li>{@link TrackballRotator#setViewMatrix}(matrix) <br>
 *        Sets the view matrix.
 *    <li>{@link TrackballRotator#setView}(viewDistance, viewpointDirection, viewUp) <br>
 *        Sets up the view, where the
 *        parameters are optional and are used in the same way as the corresponding parameters
 *        in the constructor.</li>
 *    <li>{@link TrackballRotator#setViewDistance}(viewDistance) <br>
 *        Sets the distance of the viewer from the origin without
 *        changing the direction of view. <br>
 *        The parameter must be a positive number.
 *    <li>{@link TrackballRotator#getViewDistance}() <br>
 *        Returns the current value.</li>
 *    <li>{@link TrackballRotator#setRotationCenter}(vector) <br>
 *        Sets the center of rotation. <br>
 *        The parameter must be an array of (at least) three numbers.
 *        The view is rotated about this point. <br>
 *        Usually, you want the rotation center to be the point that
 *        appears at the middle of the canvas, but that is not a requirement. <br>
 *        The initial value is effectively equal to [0,0,0].</li>
 *    <li>{@link TrackballRotator#getRotationCenter}() <br>
 *        Returns the current value.</li>
 * </ul>
 *
 * @since 19/11/2022
 * @author David J. Eck and modified by Paulo Roma
 * @see <a href="/cwdc/13-webgl/hws.edu-examples/trackball-rotator.js">source</a>
 * @see https://math.hws.edu/graphicsbook/source/webgl/cube-with-trackball-rotator.html
 * @see https://math.hws.edu/graphicsbook/source/webgl/trackball-rotator.js
 * @see https://math.hws.edu/graphicsbook/source/webgl/skybox-and-env-map.html
 * @see <img src="/cwdc/13-webgl/lib/arcball4.png" width="256">
 */

/**
 * <p>An object of type TrackballRotator can be used to implement a
 * {@link https://www.xarg.org/2021/07/trackball-rotation-using-quaternions/ trackball}-like mouse rotation
 * of a WebGL scene about the origin. </p>
 *
 * Only the first parameter to the constructor is required.
 * When an object is created, mouse event handlers are set up on the canvas to respond to rotation.<br>
 * It will also work with a touchscreen.
 */
class TrackballRotator {
    /**
     * <p>Constructor of TrackballRotator.</p>
     * @param {HTMLCanvasElement} canvas the HTML canvas element used for WebGL drawing.
     *    The user will rotate the scene by dragging the mouse on this canvas.
     *    This parameter is required.
     * @param {function} callback if present must be a function, which is called whenever the rotation changes.
     *    It is typically the function that draws the scene.
     * @param {Number} viewDistance if present must be a positive number. Gives the distance of the viewer
     *    from the origin. If not present, the length is zero, which can be OK for orthographic projection,
     *    but never for perspective projection.
     * @param {Array<Number>} viewpointDirection if present must be an array of three numbers, not all zero.
     *    The view is from the direction of this vector towards the origin (0,0,0). If not present,
     *    the value [0,0,10] is used. This is just the initial value for viewpointDirection; it will
     *    be modified by rotation.
     * @param {Array<Number>} viewUp if present must be an array of three numbers. Gives a vector that will
     *    be seen as pointing upwards in the view. If not present, the value is [0,1,0].
     *    Cannot be a multiple of viewpointDirection. This is just the initial value for
     *    viewUp; it will be modified by rotation.
     */
    constructor(canvas, callback, viewDistance, viewpointDirection, viewUp) {
        var unitx = new Array(3);
        var unity = new Array(3);
        var unitz = new Array(3);

        /**
         * View distance, that is, the z-coord in eye coordinates.
         * @type {Number}
         */
        var viewZ;

        /**
         * <p>Center of view and rotation is about this point.</p>
         * Default is [0,0,0].
         * @type {Array<Number>}
         */
        var center;

        /**
         * Set up the view, where the parameters are optional,
         * and are used in the same way, <br>
         * as the corresponding parameters in the constructor.
         * @param {Number} viewDistance distance of the viewer from the origin.
         * @param {Array<Number>} viewpointDirection direction of view is from this point towards the origin (0,0,0).
         * @param {Array<Number>} viewUp view up vector.
         */
        this.setView = function (viewDistance, viewpointDirection, viewUp) {
            unitz =
                viewpointDirection === undefined
                    ? [0, 0, 10]
                    : viewpointDirection;
            viewUp = viewUp === undefined ? [0, 1, 0] : viewUp;
            viewZ = viewDistance;
            normalize(unitz, unitz);
            copy(unity, unitz);
            scale(unity, unity, dot(unitz, viewUp));
            subtract(unity, viewUp, unity);
            normalize(unity, unity);
            cross(unitx, unity, unitz);
        };

        /**
         * Returns the view transformation matrix as a regular JavaScript
         * array of 16 elements, in column-major order, <br>
         * suitable for use with
         * {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniformMatrix gl.uniformMatrix4fv}
         * or, for further transformation, with the glMatrix library {@link https://glmatrix.net/docs/module-mat4.html mat4} class.
         * @return {Array<Number>} view matrix.
         */
        this.getViewMatrix = function () {
            var mat = [
                unitx[0],
                unity[0],
                unitz[0],
                0,
                unitx[1],
                unity[1],
                unitz[1],
                0,
                unitx[2],
                unity[2],
                unitz[2],
                0,
                0,
                0,
                0,
                1,
            ];
            if (center !== undefined) {
                // multiply on left by translation by rotationCenter, on right by translation by -rotationCenter
                var t0 =
                    center[0] -
                    mat[0] * center[0] -
                    mat[4] * center[1] -
                    mat[8] * center[2];
                var t1 =
                    center[1] -
                    mat[1] * center[0] -
                    mat[5] * center[1] -
                    mat[9] * center[2];
                var t2 =
                    center[2] -
                    mat[2] * center[0] -
                    mat[6] * center[1] -
                    mat[10] * center[2];
                mat[12] = t0;
                mat[13] = t1;
                mat[14] = t2;
            }
            if (viewZ !== undefined) {
                mat[14] -= viewZ;
            }
            return mat;
        };

        /**
         * Sets the view matrix.
         * @param {Float32Array} matrix view matrix.
         */
        this.setViewMatrix = function (matrix) {
            unitx[0] = matrix[0];
            unity[0] = matrix[1];
            unitz[0] = matrix[2];
            unitx[1] = matrix[4];
            unity[1] = matrix[5];
            unitz[1] = matrix[6];
            unitx[2] = matrix[8];
            unity[2] = matrix[9];
            unitz[2] = matrix[10];
        };

        /**
         * Returns the viewDistance.
         * @return {Number} view distance.
         */
        this.getViewDistance = function () {
            return viewZ;
        };

        /**
         * Sets the distance of the viewer from the origin without
         * changing the direction of view. <br>
         * The parameter must be a positive number.
         * @param {Number} viewDistance view distance.
         */
        this.setViewDistance = function (viewDistance) {
            viewZ = viewDistance;
        };

        /**
         * Returns the current rotation center.
         * @returns {Array<Number>} center or [0,0,0], if undefined.
         */
        this.getRotationCenter = function () {
            return center === undefined ? [0, 0, 0] : center;
        };

        /**
         * <p>Sets the center of rotation.</p>
         * The parameter must be an array of (at least) three numbers.
         * The view is rotated about this point.
         * <p>Usually, you want the rotation center to be the point that appears
         * at the middle of the canvas, but that is not a requirement.</p>
         * The initial value is effectively equal to [0,0,0].
         * @param {Array<Number>} rotationCenter center of rotation.
         */
        this.setRotationCenter = function (rotationCenter) {
            center = rotationCenter;
        };

        this.setView(viewDistance, viewpointDirection, viewUp);
        canvas.addEventListener("mousedown", doMouseDown, false);
        canvas.addEventListener("touchstart", doTouchStart, false);

        function applyTransvection(e1, e2) {
            // rotate vector e1 onto e2
            function reflectInAxis(axis, source, destination) {
                var s =
                    2 *
                    (axis[0] * source[0] +
                        axis[1] * source[1] +
                        axis[2] * source[2]);
                destination[0] = s * axis[0] - source[0];
                destination[1] = s * axis[1] - source[1];
                destination[2] = s * axis[2] - source[2];
            }
            normalize(e1, e1);
            normalize(e2, e2);
            var e = [0, 0, 0];
            add(e, e1, e2);
            normalize(e, e);
            var temp = [0, 0, 0];
            reflectInAxis(e, unitz, temp);
            reflectInAxis(e1, temp, unitz);
            reflectInAxis(e, unitx, temp);
            reflectInAxis(e1, temp, unitx);
            reflectInAxis(e, unity, temp);
            reflectInAxis(e1, temp, unity);
        }

        var centerX, centerY, radius2;
        var prevx, prevy;
        var dragging = false;
        var touchStarted = false;

        function doMouseDown(evt) {
            if (dragging) return;
            dragging = true;
            centerX = canvas.width / 2;
            centerY = canvas.height / 2;
            var radius = Math.min(centerX, centerY);
            radius2 = radius * radius;
            document.addEventListener("mousemove", doMouseDrag, false);
            document.addEventListener("mouseup", doMouseUp, false);
            var box = canvas.getBoundingClientRect();
            prevx = evt.clientX - box.left;
            prevy = evt.clientY - box.top;
        }
        function doMouseDrag(evt) {
            if (!dragging) return;
            var box = canvas.getBoundingClientRect();
            var x = evt.clientX - box.left;
            var y = evt.clientY - box.top;
            var ray1 = toRay(prevx, prevy);
            var ray2 = toRay(x, y);
            applyTransvection(ray1, ray2);
            prevx = x;
            prevy = y;
            if (callback) {
                callback();
            }
        }
        function doMouseUp(evt) {
            if (dragging) {
                document.removeEventListener("mousemove", doMouseDrag, false);
                document.removeEventListener("mouseup", doMouseUp, false);
                dragging = false;
            }
        }
        function doTouchStart(evt) {
            if (evt.touches.length != 1) {
                doTouchCancel();
                return;
            }
            evt.preventDefault();
            var r = canvas.getBoundingClientRect();
            prevx = evt.touches[0].clientX - r.left;
            prevy = evt.touches[0].clientY - r.top;
            canvas.addEventListener("touchmove", doTouchMove, false);
            canvas.addEventListener("touchend", doTouchEnd, false);
            canvas.addEventListener("touchcancel", doTouchCancel, false);
            touchStarted = true;
            centerX = canvas.width / 2;
            centerY = canvas.height / 2;
            var radius = Math.min(centerX, centerY);
            radius2 = radius * radius;
        }
        function doTouchMove(evt) {
            if (evt.touches.length != 1 || !touchStarted) {
                doTouchCancel();
                return;
            }
            evt.preventDefault();
            var r = canvas.getBoundingClientRect();
            var x = evt.touches[0].clientX - r.left;
            var y = evt.touches[0].clientY - r.top;
            var ray1 = toRay(prevx, prevy);
            var ray2 = toRay(x, y);
            applyTransvection(ray1, ray2);
            prevx = x;
            prevy = y;
            if (callback) {
                callback();
            }
        }
        function doTouchEnd(evt) {
            doTouchCancel();
        }
        function doTouchCancel() {
            if (touchStarted) {
                touchStarted = false;
                canvas.removeEventListener("touchmove", doTouchMove, false);
                canvas.removeEventListener("touchend", doTouchEnd, false);
                canvas.removeEventListener("touchcancel", doTouchCancel, false);
            }
        }
        function toRay(x, y) {
            // converts a point (x,y) in pixel coords to a 3D ray by mapping interior of
            // a circle in the plane to a hemisphere with that circle as equator.
            var dx = x - centerX;
            var dy = centerY - y;
            var vx = dx * unitx[0] + dy * unity[0]; // The mouse point as a vector in the image plane.
            var vy = dx * unitx[1] + dy * unity[1];
            var vz = dx * unitx[2] + dy * unity[2];
            var dist2 = vx * vx + vy * vy + vz * vz;
            if (dist2 > radius2) {
                // Map a point ouside the circle to itself
                return [vx, vy, vz];
            } else {
                var z = Math.sqrt(radius2 - dist2);
                return [
                    vx + z * unitz[0],
                    vy + z * unitz[1],
                    vz + z * unitz[2],
                ];
            }
        }
        function dot(v, w) {
            return v[0] * w[0] + v[1] * w[1] + v[2] * w[2];
        }
        function length(v) {
            return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        }
        function normalize(v, w) {
            var d = length(w);
            v[0] = w[0] / d;
            v[1] = w[1] / d;
            v[2] = w[2] / d;
        }
        function copy(v, w) {
            v[0] = w[0];
            v[1] = w[1];
            v[2] = w[2];
        }
        function add(sum, v, w) {
            sum[0] = v[0] + w[0];
            sum[1] = v[1] + w[1];
            sum[2] = v[2] + w[2];
        }
        function subtract(dif, v, w) {
            dif[0] = v[0] - w[0];
            dif[1] = v[1] - w[1];
            dif[2] = v[2] - w[2];
        }
        function scale(ans, v, num) {
            ans[0] = v[0] * num;
            ans[1] = v[1] * num;
            ans[2] = v[2] * num;
        }
        function cross(c, v, w) {
            var x = v[1] * w[2] - v[2] * w[1];
            var y = v[2] * w[0] - v[0] * w[2];
            var z = v[0] * w[1] - v[1] * w[0];
            c[0] = x;
            c[1] = y;
            c[2] = z;
        }
    }
}
