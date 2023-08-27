/**
 * @file
 *
 * Summary.
 * <p>A mail-delivery robot picking up and dropping off parcels.</p>
 *
 *  Description.
 *  <p>The village of Meadowfield isn’t very big. </p>
 *  <ul>
 *    <li>It consists of 11 places with 14 roads between them.</li>
 *    <li>It can be described with this array of roads:</li>
 *    <br>
 *    const roads = [
 *    <ul style="list-style-type:none">
 *      <li> "Alice's House-Bob's House",   "Alice's House-Cabin", </li>
 *      <li> "Alice's House-Post Office",   "Bob's House-Town Hall", </li>
 *      <li> "Daria's House-Ernie's House", "Daria's House-Town Hall", </li>
 *      <li> "Ernie's House-Grete's House", "Grete's House-Farm", </li>
 *      <li> "Grete's House-Shop",          "Marketplace-Farm", </li>
 *      <li> "Marketplace-Post Office",     "Marketplace-Shop", </li>
 *      <li> "Marketplace-Town Hall",       "Shop-Town Hall" </li>
 *    </ul>
 *    ]
 *  </ul>
 *
 * <p>The village's road network (topology) will be represented by a graph. </p>
 * Each node of the graph represents a place, which is associated with its set of edges,<br>
 * that is, the set of {@link roadGraph roads} emanating from it.
 * <p> <img src="../img/village2x.png"></p>
 *
 *  <pre>
 *  Documentation:
 *  - Ubuntu:
 *     - sudo apt install jsdoc-toolkit or
 *     - sudo npm install -g jsdoc
 *  - MacOS:
 *     - sudo port install npm7 (or npm8)
 *     - sudo npm install -g jsdoc
 *  - jsdoc -d doc-robot 07a_robot.js
 *
 *  Usage:
 *  - npm init
 *  - npm install readline-sync getopts
 *  - node robot.mjs [nparcels] [rtype]
 *  </pre>
 *
 *  @see <a href="/eloquentJavascript/robot/robot.html">Robot</a>
 *  @see <a href="/eloquentJavascript/robot/07a_robot.js">source</a>
 *  @see https://eloquentjavascript.net/07_robot.html
 *  @see https://www.i-programmer.info/programming/javascript/1441-javascript-data-structures-the-associative-array.html
 *  @see <a href="../doc-robot-node">robot in node</a>
 *  @author Marijn Haverbeke ({@link https://marijnhaverbeke.nl}), adapted to ES6 by Paulo Roma
 *  @since 06/07/2021
 */
const roads = [
  "Alice's House-Bob's House",
  "Alice's House-Cabin",
  "Alice's House-Post Office",
  "Bob's House-Town Hall",
  "Daria's House-Ernie's House",
  "Daria's House-Town Hall",
  "Ernie's House-Grete's House",
  "Grete's House-Farm",
  "Grete's House-Shop",
  "Marketplace-Farm",
  "Marketplace-Post Office",
  "Marketplace-Shop",
  "Marketplace-Town Hall",
  "Shop-Town Hall",
];

/**
 * Given an array of edges, creates a map object that,
 * for each node, stores an array of connected nodes.
 *
 * @param {Array<String>} edges "source - destination" pairs.
 * @returns {graph} a graph.
 * @see roadGraph
 */
function buildGraph(edges) {
  let graph = Object.create(null);
  function addEdge(from, to) {
    if (graph[from] == null) {
      graph[from] = [to];
    } else {
      graph[from].push(to);
    }
  }
  for (let [from, to] of edges.map((r) => r.split("-"))) {
    addEdge(from, to);
    addEdge(to, from);
  }
  return graph;
}

/**
 * A graph: a set of vertices (nodes) and edges.
 * @typedef {Object<String:Array<String>>} graph
 */

/**
 * The graph of roads of the village of Meadowfield.
 *
 * <br>
 * {
 * <ul style="list-style-type:none">
 *  <li> Alice's House: ["Bob's House", "Cabin", "Post Office"] </li>
 *  <li> Bob's House: ["Alice's House", "Town Hall"] </li>
 *  <li> Cabin: ["Alice's House"] </li>
 *  <li> Daria's House: ["Ernie's House", "Town Hall"] </li>
 *  <li> Ernie's House: ["Daria's House", "Grete's House"] </li>
 *  <li> Farm: ["Grete's House", "Marketplace"] </li>
 *  <li> Grete's House: ["Ernie's House", "Farm", "Shop"] </li>
 *  <li> Marketplace: ["Farm", "Post Office", "Shop", "Town Hall"] </li>
 *  <li> Post Office: ["Alice's House", "Marketplace"] </li>
 * </ul>
 * }
 * @type {graph}
 */
export const roadGraph = buildGraph(roads);

/** @class
 * Let’s condense the village’s state down to the minimal set of values that define it.
 * There’s the robot’s current location and the collection of undelivered parcels,
 * each of which has a current location and a destination address. That’s it.
 *
 * @param {String} place robot location name.
 * @param {Array<parcel>} parcels collection (place-address pairs) of undelivered parcels.
 */
export class VillageState {
  constructor(place, parcels) {
    /** Robot's current location.
     * @type {String}
     */
    this.place = place;

    /** Collection of undelivered parcels.
     * @type {Array<parcel>}
     */
    this.parcels = parcels;
  }

  /**
   * <p>First checks whether there is a road going from the current place to the destination,
   * and if not, it returns the old state since this is not a valid move.</p>
   *
   * Then it creates a new state with the destination as the robot’s new place.</p>
   * <ul>
   *    <li>But it also needs to create a new set of parcels — parcels that the robot is carrying
   *    (that are at the robot’s current place) need to be moved along to the new place.</li>
   *
   *    <li>And parcels that are addressed to the new place need to be delivered—that is,
   *    they need to be removed from the set of undelivered parcels.</li>
   *
   *    <li>The call to map takes care of the moving, and the call to filter does the delivering.</li>
   * </ul>
   *
   * <p>This method does not change the state when the robot moves,
   * but rather computes a new state for the situation after the move.</p>
   *
   * Data structures that don't change are called immutable or persistent.
   * They behave a lot like strings and numbers in that they are what they are,
   * and stay that way, rather than containing different things at different times.
   *
   * @param {String} destination where the robot should go.
   * @returns {VillageState} new state.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
   */
  move(destination) {
    if (!roadGraph[this.place].includes(destination)) {
      return this; // invalid move
    } else {
      // create a new parcel list
      let parcels = this.parcels
        .map((p) => {
          // keep parcels from other locations (places)
          if (p.place != this.place) return p;
          // move parcels at this location (place) to destination (robot will carry them)
          return { place: destination, address: p.address };
        })
        // deliver (remove) parcels addressed to this location (place)
        .filter((p) => p.place != p.address);
      // create new state - execute the move
      return new VillageState(destination, parcels);
    }
  }
}

/**
 * A direction to go, and the rest of the route as the memory.
 * @typedef {Object<direction:String,memory:Array<String>>} RobotState
 * @see mailRoute
 */

/**
 * <p>Parcel current location and destination.</p>
 *
 * E.g.: <p>Array holding undelivered parcels.</p>
 * [
 * <ul style="list-style-type:none">
 *  <li> {place: "Grete's House", address: "Marketplace"}, </li>
 *  <li> {place: "Town Hall", address: "Daria's House"}, </li>
 *  <li> {place: "Bob's House", address: "Shop"}, </li>
 *  <li> {place: "Cabin", address: "Bob's House"}, </li>
 *  <li> {place: "Marketplace", address: "Post Office"} </li>
 * </ul>
 * ]
 *
 * @typedef {Object<{place:String,address:String}>} parcel
 */

/**
 * <p>Consider what a robot has to do to “solve” a given state.</p>
 * It must pick up all parcels by visiting every location that has a parcel,<br>
 * and deliver them by visiting every location that a parcel is addressed to,<br>
 * but only after picking up the parcel.
 *
 * @typedef {function(state,route):RobotState} robotCallback
 * @callback robotCallback
 * @param {VillageState} state village state.
 * @param {Array<String>} route route to be followed (memory).
 * @returns {RobotState} new route.
 */

/**
 * <p>Runs the robot simulation. All movements are printed on the screen.</p>
 *
 * <p>A delivery robot looks at the world and decides in which direction it wants to move. <br>
 * As such, we could say that a robot is a function that takes a VillageState object
 * and returns the name of a nearby place.</p>
 *
 * <p>Because we want robots to be able to remember things, so that they can make and execute plans,<br>
 * we also pass them their memory and allow them to return a new memory.<br>
 * Thus, the thing a robot returns is an object containing both the direction it wants to move in<br>
 * and a memory value that will be given back to it the next time it is called.</p>
 *
 * @param {VillageState} state village state.
 * @param {robotCallback} robot returns the direction to follow based on the robot type.
 * @param {Array<String>} memory route to follow.
 * @see mailRoute
 */
export function runRobot(state, robot, memory) {
  log("Post Office");
  printParcels();
  for (let turn = 0; ; turn++) {
    if (state.parcels.length == 0) {
      log(`Done in ${turn} turns`);
      break;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
    log(`Moved to ${action.direction}`);
    printParcels();
  }

  // Print a message either to the console or the document.
  function log(message) {
    if (typeof document === "undefined") {
      console.log(message);
    } else {
      document.write(`${message} <br>`);
    }
  }

  /**
   * Print the list of parcels, by displaying
   * the first letter of each place and address name.
   * e.g., [B→C, A→M, T→C, F→C, M→B, M→S]
   */
  function printParcels() {
    let parcelString = "";
    state.parcels.forEach((p) => {
      parcelString += `${p.place[0]}→${p.address[0]}, `;
    });
    log(`  [${parcelString.slice(0, -2)}] (${state.parcels.length})`);
  }
}

/**
 * Choose a random element of an array.
 *
 * @param {Array<String>} array given array.
 * @returns random element.
 */
function randomPick(array) {
  let choice = Math.floor(Math.random() * array.length);
  return array[choice];
}

/**
 * A robot that chooses a random edge of the graph emanating from the current place.
 *
 * @param {VillageState} state a place + a parcel set.
 * @returns {String} a random destination.
 * @see randomPick
 */
export function randomRobot(state) {
  return { direction: randomPick(roadGraph[state.place]) };
}

/**
 * Create a new state with some parcels.
 * A static method (written here by directly adding a property to the constructor)
 * is a good place to put that functionality.
 * A number of randon parcels {place,destination} with the robot at the "Post Office".
 *
 * We don’t want any parcels that are sent from the same place that they are addressed to.
 * For this reason, the do loop keeps picking new places when it gets one that’s equal to the address.
 *
 * @param {Number} parcelCount number of parcels to create.
 * @returns {VillageState} created state.
 */
VillageState.random = function (parcelCount = 5) {
  let parcels = [];
  for (let i = 0; i < parcelCount; i++) {
    let address = randomPick(Object.keys(roadGraph)); // where to deliver the parcel (destination)
    let place;
    do {
      place = randomPick(Object.keys(roadGraph)); // where the parcel is (origin)
    } while (place == address);
    parcels.push({ place, address });
  }
  return new VillageState("Post Office", parcels);
};

/**
 * <p>A predefined route. </p>
 * We should be able to do a lot better than the random robot.<br>
 * An easy improvement would be to take a hint from the way real-world mail delivery works.<br>
 * If we find a route that passes all places in the village, the robot could run that route twice,<br>
 * at which point it is guaranteed to be done.<br>
 * <p>Here is one such route (starting from the post office):</p>
 *
 * [
 * <ul style="list-style-type:none">
 * <li> "Alice's House", </li>
 * <li> "Cabin", </li>
 * <li> "Alice's House", </li>
 * <li> "Bob's House", </li>
 * <li> "Town Hall", </li>
 * <li> "Daria's House", </li>
 * <li> "Ernie's House", </li>
 * <li> "Grete's House", </li>
 * <li> "Shop",  </li>
 * <li> "Grete's House", </li>
 * <li> "Farm",  </li>
 * <li> "Marketplace",  </li>
 * <li> "Post Office" </li>
 * </ul>
 * ]
 * @type {Array<String>}
 */
const mailRoute = [
  "Alice's House",
  "Cabin",
  "Alice's House",
  "Bob's House",
  "Town Hall",
  "Daria's House",
  "Ernie's House",
  "Grete's House",
  "Shop",
  "Grete's House",
  "Farm",
  "Marketplace",
  "Post Office",
];

/**
 * <p>To implement the route-following robot, we’ll need to make use of robot memory.</p>
 * The robot keeps the rest of its route in its memory and drops the first element every turn.
 *
 * @param {VillageState} state of the village.
 * @param {Array<String>} memory route to follow.
 * @returns {RobotState} a map (associative array): destination and new route.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
 * @see mailRoute
 */
export function routeRobot(state, memory) {
  if (memory.length == 0) {
    memory = mailRoute;
  }
  return { direction: memory[0], memory: memory.slice(1) }; // remove first address of the route
}

/**
 * <p>Look at short routes before we look at longer ones.
 * A good approach would be to “grow” routes from the starting point,<br>
 * exploring every reachable place that hasn’t been visited yet, until a route reaches the goal.<br>
 * That way, we’ll only explore routes that are potentially interesting, and we’ll find the shortest route<br>
 * (or one of the shortest routes, if there are more than one) to the goal.</p>
 *
 * <p>Basically, this is a breath-first traversal until the destination node is reached.
 * Therefore, it is kept a work list (a queue). <br>
 * This is an array of places that should be explored next, along with the route that got us there.
 * It starts with just the start position and an empty route. </p>
 *
 *
 * <p>The search then operates by taking the next item in the list and exploring that,
 * which means all roads going from that place are looked at.<br>
 * If one of them is the goal, a finished route can be returned.
 * Otherwise, if we haven’t looked at this place before, a new item is added to the list.<br>
 * If we have looked at it before, since we are looking at short routes first,
 * we’ve found either a longer route to that place or one precisely,<br>
 * as long as the existing one, and we don’t need to explore it.</p>
 *
 * <p>You can visually imagine this as a web of known routes crawling out from the start location,
 * growing evenly on all sides (but never tangling back into itself).<br>
 * As soon as the first thread reaches the goal location, that thread is traced back to the start,
 * giving us our route.</p>
 *
 * e.g.: {@link findRoute}(roadGraph, "Grete's House", "Post Office") → ["Farm", "Marketplace", "Post Office"]
 *
 * @param {graph} graph the village graph.
 * @param {String} from origin.
 * @param {String} to destination.
 * @returns {Array<Object<at:String, from:String>>} a map (associative array): destination and new route.
 * @see buildGraph
 * @see https://en.wikipedia.org/wiki/Breadth-first_search
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
 */
function findRoute(graph, from, to) {
  let work = [{ at: from, route: [] }];
  for (let i = 0; i < work.length; i++) {
    let { at, route } = work[i];
    for (let place of graph[at]) {
      if (place == to) return route.concat(place);
      if (!work.some((w) => w.at == place)) {
        // if the vertex has not been visited yet (not in work already)
        work.push({ at: place, route: route.concat(place) });
      }
    }
  }
}

/**
 * <p>This robot uses its memory value as a list of directions to move in,
 * just like the route-following robot. <br>
 * Whenever that list is empty, it has to figure out what to do next. </p>
 * It could take the first undelivered parcel in the set,
 * but it is better go to the place with more parcels to send and:
 * <ul>
 *  <li> if that parcel hasn’t been picked up yet, plots a route toward it. </li>
 *  <li> If the parcel has been picked up, it still needs to be delivered,
 *       so the robot creates a route toward the delivery address instead.</li>
 * </ul>
 * This robot usually finishes the task of delivering 5 parcels in about 16 turns (or 13,
 * if not always taking the first parcel).
 * <p>That’s slightly better than {@link routeRobot} (for a small number of packages),
 * but still definitely not optimal.</p>
 *
 * @param {VillageState} state village state (a destructuring parameter).
 * @param {String} state.place robot location.
 * @param {Array<parcel>} state.parcels collection (place-address pairs) of undelivered parcels.
 * @param {Array<String>} route the route to follow.
 * @returns {RobotState} a map (associative array): destination and new route.
 * @see mailRoute
 */
export function goalOrientedRobot({ place, parcels }, route) {
  if (route.length == 0) {
    let parcel = parcels[0];

    // this is optional, but provides some improvement over the original code from the book
    if (true) {
      let nodes = parcelsNode(place, parcels, roadGraph);
      let [kin, kout] = maxNode(nodes);
      if (nodes[kin].in > 0) {
        parcel = parcels[nodes[kin].index]; // parcels.find(x => x.place == kin);
      } else {
        parcel = parcels[nodes[kout].index];
        console.assert(parcel.place == place, `not on robot's hand`);
      }
    }

    if (parcel.place != place) {
      // go to where the parcel is (pick it up)
      route = findRoute(roadGraph, place, parcel.place);
    } else {
      // the parcel is on the robot's hands, therefore go to where the parcel should be delivered
      route = findRoute(roadGraph, place, parcel.address);
    }
  }
  return { direction: route[0], memory: route.slice(1) };
}

/**
 * <p>The main limitation of {@link goalOrientedRobot} is that it considers only one parcel at a time.<br>
 * It will often walk back and forth across the village, because the parcel it happens to be looking at,<br>
 * happens to be at the other side of the map, even if there are others much closer.</p>
 *
 * One possible solution would be to compute routes for all packages and then take the shortest one.<br>
 * Even better results can be obtained, if there are multiple shortest routes,<br>
 * by preferring the ones that go to pick up a package instead of delivering a package.
 *
 * @param {VillageState} state village state (a destructuring parameter).
 * @param {String} state.place robot location.
 * @param {Array<parcel>} state.parcels collection (place-address pairs) of undelivered parcels.
 * @param {Array<String>} route the route to follow.
 * @returns {RobotState} a map (associative array): destination and new route.
 * @see https://en.wikipedia.org/wiki/Dijkstra's_algorithm
 * @see https://levelup.gitconnected.com/finding-the-shortest-path-in-javascript-dijkstras-algorithm-8d16451eea34
 * @see https://medium.com/@jpena91/dijkstras-algorithm-finding-the-shortest-path-in-javascript-a7247afe93b2
 */
export function lazyRobot({ place, parcels }, route) {
  if (route.length == 0) {
    // Describe a route for every parcel
    let routes = parcels.map((parcel) => {
      if (parcel.place != place) {
        return {
          route: findRoute(roadGraph, place, parcel.place),
          pickUp: true,
        };
      } else {
        return {
          route: findRoute(roadGraph, place, parcel.address),
          pickUp: false,
        };
      }
    });

    // This determines the precedence a route gets when choosing.
    // Route length counts negatively, routes that pick up a package
    // get a small bonus.
    function score({ route, pickUp }) {
      return (pickUp ? 0.5 : 0) - route.length;
    }
    route = routes.reduce((a, b) => (score(a) > score(b) ? a : b)).route;
  }
  return { direction: route[0], memory: route.slice(1) };
}

/**
 * <p>Create an object to totalize the number of parcels in a node to send to another node (in) and
 * parcels to the node addressed from another node (out).</p>
 *
 * We could have used here a Map, instead of an Object, but in this case we should have replace indexing,
 * such as nodes[p.place], for nodes.get(p.place).
 * <pre>
 *   // Map keys can be anything: Objects, arrays, etc.
 *   var nodes = new Map(
 *     Object.keys(graph).map((place) => {
 *       return [place, { in: 0, out: 0 }];
 *     })
 *   );
 *   console.log(nodes);
 *   console.log(nodes.get("Cabin").in);
 * </pre>
 *
 * @param {String} place robot location.
 * @param {Array<parcel>} parcels collection of undeliverd parcels.
 * @param {graph} graph road graph.
 * @returns {Object<String:Object<Number,Number,Number>>} in, out counters for each node
 *           and the last index in parcels where the node was found.
 * @see https://flexiple.com/loop-through-object-javascript/
 * @see https://www.javascripttutorial.net/es6/javascript-map/
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 * @see https://oieduardorabelo.medium.com/javascript-map-vs-object-quando-e-como-usar-5457677b001b
 * @see https://webmobtuts.com/javascript/javascript-keyed-and-indexed-collections-array-map-and-set/
 */
export function parcelsNode(place, parcels, graph) {
  let nodes = {};
  Object.keys(graph).forEach((place) => {
    nodes[place] = { in: 0, out: 0 };
  });

  for (let [i, p] of parcels.entries()) {
    if (p.place != place) {
      // not on robot's hand
      nodes[p.place].in += 1;
      nodes[p.place].index = i;
    }
    nodes[p.address].out += 1;
    if (nodes[p.address].index == undefined) nodes[p.address].index = i;
  }
  return nodes;
}

/**
 * Gets the nodes of the graph with the maximum number of parcels to send
 * and the maximum number of parcels addressed to.
 *
 * @param {Object<String:Object<Number,Number,Number>>} nodes number of parcels in a node, and parcels to a node.
 * @returns {Array<Number,Number>} key of the nodes with maximum 'in' and 'out' values.
 */
export function maxNode(nodes) {
  let keys = Object.keys(nodes);
  return [
    keys.reduce((a, b) => (nodes[a].in > nodes[b].in ? a : b)),
    keys.reduce((a, b) => (nodes[a].out > nodes[b].out ? a : b)),
  ];
}
