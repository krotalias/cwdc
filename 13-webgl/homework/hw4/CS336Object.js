/**
 * @file
 *
 * Summary.
 * <p>Encapsulation of key attributes of a 3D object.</p>
 *
 * @author {@link https://stevekautz.com/cs336f22/cs336f22_archived.html Steve Kautz}
 * @since 30/10/2015
 * @see <a href="/cwdc/13-webgl/homework/hw4/CS336Object.js">source</a>
 */

"use strict";

/**
 * Drawing callback.
 * @callback CS336Object~drawCallback
 * @param {Matrix4} matrix transformation matrix.
 */

/**
 * <p>Each object has a position, rotation, and scale.</p>
 *
 * <p>The object's transformation matrix is defined as the product of
 * three transformations based on position * rotation * scale.</p>
 *
 * Each object has a list of child objects and a hook, drawFunction,
 * for rendering the object and then recursively rendering all the child objects.
 */
export class CS336Object {
  /**
   * @constructs CS336Object
   * @param {CS336Object~drawCallback} drawFunction callback that handles the drawing of this object.
   */
  constructor(drawFunction) {
    /**
     * Children of this object.
     * @type {Array<CS336Object>}
     */
    this.children = [];

    /**
     * Position of this object.
     * @type {Vector3}
     */
    this.position = new Vector3([0, 0, 0]);

    /**
     * <p>Current rotation matrix.</p>
     * This will *always* be an orthogonal matrix whose first three columns
     * are the three basis vectors for this object's.
     * @type {Matrix4}
     */
    this.rotation = new Matrix4();

    /**
     * Scale for this object.
     * @type {Vector3}
     */
    this.scale = new Vector3([1, 1, 1]);

    /**
     * <p>The object's current transformation, to be calculated
     * as translate * rotate * scale.</p>
     *
     * The matrix is cached on call to getMatrix.
     * @type {Matrix4}
     */
    this.matrix = null;

    /**
     * Whether this matrix should be updated.
     * @type {Boolean}
     */
    this.matrixNeedsUpdate = true;

    /**
     * If caller doesn't supply a drawing function,
     * an empty one will be created for dummy objects.
     * @type {function}
     */
    this.drawObject = drawFunction || function () {};
  }

  /**
   * Sets the position.
   * @param {Number} x coordinate.
   * @param {Number} y coordinate.
   * @param {Number} z coordinate.
   */
  setPosition(x, y, z) {
    this.position = new Vector3([x, y, z]);
    this.matrixNeedsUpdate = true;
  }

  /**
   * Sets the scale.
   * @param {Number} x scale along x axis.
   * @param {Number} y scale along y axis.
   * @param {Number} z scale along z axis.
   */
  setScale(x, y, z) {
    this.scale = new Vector3([x, y, z]);
    this.matrixNeedsUpdate = true;
  }

  /**
   * Sets the current rotation matrix.
   * @param {Number} angle rotation angle.
   * @param {Number} x rotation axis x component.
   * @param {Number} y rotation axis y component.
   * @param {Number} z rotation axis z component.
   */
  setRotation(rotationMatrix) {
    this.rotation = new Matrix4(rotationMatrix);
    this.matrixNeedsUpdate = true;
  }

  /**
   * Returns the current transformation matrix, defined as
   * translate * rotate * scale.
   * @returns {Matrix4} transformation matrix.
   */
  getMatrix() {
    if (this.matrixNeedsUpdate) {
      let px, py, pz, sx, sy, sz;
      px = this.position.elements[0];
      py = this.position.elements[1];
      pz = this.position.elements[2];
      sx = this.scale.elements[0];
      sy = this.scale.elements[1];
      sz = this.scale.elements[2];

      this.matrixNeedsUpdate = false;
      this.matrix = new Matrix4()
        .setTranslate(px, py, pz)
        .multiply(this.rotation)
        .scale(sx, sy, sz);
    }
    return this.matrix;
  }

  /**
   * Adds the given CS336Object to this object's list of children.
   * @param {CS336Object} child new child.
   */
  addChild(child) {
    this.children.push(child);
  }

  /**
   * Renders this object using the drawObject callback function and recursing
   * through the children.
   * @param {Matrix4} matrixWorld
   *   frame transformation for this object's parent.
   */
  render(matrixWorld) {
    // clone and update the world matrix
    const currentWorld = new Matrix4(matrixWorld).multiply(this.getMatrix());

    // invoke callback
    this.drawObject(currentWorld);

    // recurse through children using current world matrix
    for (let i = 0; i < this.children.length; ++i) {
      this.children[i].render(currentWorld);
    }
  }

  /**
   * Moves the CS336Object along its negative z-axis by the given amount.
   * @param {Number} distance translation on negative z-axis.
   */
  moveForward(distance) {
    // Third column of rotation is z-axis, position = position - distance * zAxis
    this.position.elements[0] += -distance * this.rotation.elements[8];
    this.position.elements[1] += -distance * this.rotation.elements[9];
    this.position.elements[2] += -distance * this.rotation.elements[10];
    this.matrixNeedsUpdate = true;
  }

  /**
   * Moves the CS336Object along its positive z-axis by the given amount.
   * @param {Number} distance translation on positive z-axis.
   */
  moveBack(distance) {
    this.moveForward(-distance);
  }

  /**
   * Moves the CS336Object along its positive x-axis by the given amount.
   * @param {Number} distance translation on positive x-axis.
   */
  moveRight(distance) {
    // First column of rotation is x-axis, position = position + distance * xAxis
    this.position.elements[0] += distance * this.rotation.elements[0];
    this.position.elements[1] += distance * this.rotation.elements[4];
    this.position.elements[2] += distance * this.rotation.elements[8];
    this.matrixNeedsUpdate = true;
  }

  /**
   * Moves the CS336Object along its negative x-axis by the given amount.
   * @param {Number} distance translation on negative x-axis.
   */
  moveLeft(distance) {
    this.moveRight(-distance);
  }

  /**
   * Moves the CS336Object along its own y-axis by the given amount.
   * @param {Number} distance translation on positive y-axis.
   */
  moveUp(distance) {
    // second column of rotation is y-axis, position = position + distance * yAxis
    this.position.elements[0] += distance * this.rotation.elements[1];
    this.position.elements[1] += distance * this.rotation.elements[5];
    this.position.elements[2] += distance * this.rotation.elements[9];
    this.matrixNeedsUpdate = true;
  }

  /**
   * Moves the CS336Object along its own negative y-axis by the given amount.
   * @param {Number} distance translation on negative y-axis.
   */
  moveDown(distance) {
    this.moveUp(-distance);
  }

  /**
   * Rotates the CS336Object ccw about its x-axis.
   * @param {Number} degrees rotation angle aboux x-axis.
   */
  rotateX(degrees) {
    // We can do this as an intrinsic x-rotation
    this.rotation.rotate(degrees, 1, 0, 0);

    // Alternatively, multiply on left by a rotation about the object's x-axis,
    // which is the first column of rotation matrix
    //  const x = this.rotation.elements[0];
    //  const y = this.rotation.elements[1];
    //  const z = this.rotation.elements[2];
    //  this.rotation = new Matrix4().setRotate(degrees, x, y, z).multiply(this.rotation);
    this.matrixNeedsUpdate = true;
  }

  /**
   * Rotates the CS336Object ccw about its y-axis.
   * @param {Number} degrees rotation angle aboux y-axis.
   */
  rotateY(degrees) {
    // We can do this as an intrinsic y-rotation
    this.rotation.rotate(degrees, 0, 1, 0);

    // Alternatively, multiply on left by a rotation about the object's y-axis,
    // which is the second column of rotation matrix
    //  const x = this.rotation.elements[4];
    //  const y = this.rotation.elements[5];
    //  const z = this.rotation.elements[6];
    //  this.rotation = new Matrix4().setRotate(degrees, x, y, z).multiply(this.rotation);
    this.matrixNeedsUpdate = true;
  }

  /**
   * Rotates the CS336Object ccw about its z-axis.
   * @param {Number} degrees rotation angle aboux z-axis.
   */
  rotateZ(degrees) {
    // We can do this as an intrinsic z-rotation
    this.rotation.rotate(degrees, 0, 0, 1);

    // Alternatively, multiply on left by a rotation about the object's z-axis,
    // which is the third column of rotation matrix
    //  const x = this.rotation.elements[8];
    //  const y = this.rotation.elements[9];
    //  const z = this.rotation.elements[10];
    //  this.rotation = new Matrix4().setRotate(degrees, x, y, z).multiply(this.rotation);
    this.matrixNeedsUpdate = true;
  }

  /**
   * Rotates the CS336Object ccw about the given axis, specified as a vector.
   * @param {Number} degrees rotation angle.
   * @param {Number} x rotation axis x component.
   * @param {Number} y rotation axis x component.
   * @param {Number} z rotation axis x component.
   */
  rotateOnAxis(degrees, x, y, z) {
    this.rotation = new Matrix4.setRotate(degrees, x, y, z).multiply(
      this.rotation,
    );
    this.matrixNeedsUpdate = true;
  }

  /**
   * Rotates the CS336Object ccw about the given axis, specified in terms of
   * pitch and head angles (as in spherical coordinates).
   * @param {Number} degrees rotation angle.
   * @param {Number} pitch rotation axis pitch angle.
   * @param {Number} head rotation axis head angle.
   */
  rotateOnAxisEuler(degrees, pitch, head) {
    // RotateY(head) * RotateX(pitch) * RotateY(degrees) * RotateX(-pitch) * RotateY(-head)
    const newRotation = new Matrix4()
      .setRotate(head, 0, 1, 0)
      .rotate(pitch, 1, 0, 0)
      .rotate(degrees, 0, 1, 0)
      .rotate(-pitch, 1, 0, 0)
      .rotate(-head, 0, 1, 0);
    this.rotation = newRotation.multiply(this.rotation);
    this.matrixNeedsUpdate = true;
  }

  /**
   * Rotates the CS336Object counterclockwise about an axis through its center that is
   * parallel to the vector (0, 1, 0).
   * @param {Number} degrees rotation angle.
   */
  turnLeft(degrees) {
    this.rotation = new Matrix4()
      .setRotate(degrees, 0, 1, 0)
      .multiply(this.rotation);
    this.matrixNeedsUpdate = true;
  }

  /**
   * Rotates the CS336Object clockwise about an axis through its center that is
   * parallel to the vector (0, 1, 0).
   * @param {Number} degrees rotation angle.
   */
  turnRight(degrees) {
    this.turnLeft(-degrees);
  }

  /**
   * <p>Moves the CS336Object the given number of degrees along a great circle.</p>
   *
   * The axis of rotation is parallel to the CS336Object's x-axis and intersects the CS336Object's
   * positive z-axis the given distance in front of the CS336Object. <br>
   * (This operation is equivalent to a moveForward, lookDown and then moveBack.
   * @param {Number} degrees rotation angle.
   * @param {Number} distance radius.
   */
  orbitUp(degrees, distance) {
    this.moveForward(distance);
    this.rotateX(degrees);
    this.moveBack(distance);
  }

  /**
   * <p>Moves the CS336Object the given number of degrees along a great circle.</p>
   *
   * The axis of rotation is parallel to the CS336Object's x-axis and intersects the CS336Object's
   * positive z-axis the given distance in front of the CS336Object. <br>
   * (This operation is equivalent to a moveForward, lookUp and then moveBack.
   * @param {Number} degrees rotation angle.
   * @param {Number} distance radius.
   */
  orbitDown(degrees, distance) {
    this.orbitUp(-degrees, distance);
  }

  /**
   * <p>Moves the CS336Object the given number of degrees around a circle of latitude. </p>
   *
   * The axis of rotation is parallel to the world up vector and intersects the
   * CS336Object's positive z-axis the given distance in front of the CS336Object. <br>
   * (This operation is equivalent to a moveForward, turnLeft, and moveBack.)
   * @param {Number} degrees rotation angle.
   * @param {Number} distance radius.
   */
  orbitRight(degrees, distance) {
    this.moveForward(distance);
    this.turnLeft(degrees);
    this.moveBack(distance);
  }

  /**
   * <p>Moves the CS336Object the given number of degrees around a circle of latitude. </p>
   *
   * The axis of rotation is parallel to the world up vector and intersects the
   * CS336Object's positive z-axis the given distance in front of the CS336Object. <br>
   * (This operation is equivalent to a moveForward, turnRight, and moveBack.)
   * @param {Number} degrees rotation angle.
   * @param {Number} distance radius.
   */
  orbitLeft(degrees, distance) {
    this.orbitRight(-degrees, distance);
  }

  /**
   * <p>Orients the CS336Object at its current location to face the given position,
   * i.e., its positive z-axis is aligned with the given position.</p>
   *
   * This is essentially the same as the lookAt function in matrix4, but
   * <ol>
   * <li> we don't invert it</li>
   * <li> there is no translation to worry about</li>
   * </ol>
   *
   * The given x, y, z are the coordinates of the look-at point.
   * We use the world up vector (0, 1, 0) for up.
   *
   * @param {Number} x view direction x component.
   * @param {Number} y view direction y component.
   * @param {Number} z view direction z component.
   */
  lookAt(x, y, z) {
    let fx, fy, fz, rlf, sx, sy, sz, rls, ux, uy, uz;

    fx = x - this.position.elements[0];
    fy = y - this.position.elements[1];
    fz = z - this.position.elements[2];

    // Normalize f.
    rlf = 1 / Math.sqrt(fx * fx + fy * fy + fz * fz);
    fx *= rlf;
    fy *= rlf;
    fz *= rlf;

    //Define up
    upX = 0;
    upY = 1;
    upZ = 0;

    // Calculate cross product of f and up.
    sx = fy * upZ - fz * upY;
    sy = fz * upX - fx * upZ;
    sz = fx * upY - fy * upX;

    // Normalize s.
    rls = 1 / Math.sqrt(sx * sx + sy * sy + sz * sz);
    sx *= rls;
    sy *= rls;
    sz *= rls;

    // Calculate cross product of s and f.
    ux = sy * fz - sz * fy;
    uy = sz * fx - sx * fz;
    uz = sx * fy - sy * fx;

    // Set the three columns of the rotation matrix
    this.rotation.elements[0] = sx;
    this.rotation.elements[1] = sy;
    this.rotation.elements[2] = sz;

    this.rotation.elements[4] = ux;
    this.rotation.elements[5] = uy;
    this.rotation.elements[6] = uz;

    this.rotation.elements[8] = -fx;
    this.rotation.elements[9] = -fy;
    this.rotation.elements[10] = -fz;

    this.matrixNeedsUpdate = true;
  }
}
