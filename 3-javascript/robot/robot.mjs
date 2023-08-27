/**
 * @file
 *
 * Summary.
 * <p>A mail-delivery robot picking up and dropping off parcels.</p>
 *
 * <pre>
 *  Usage:
 *  - npm init
 *  - npm install readline-sync getopts
 *  - node robot.mjs --nparcels=15 -t 2 -d
 * </pre>
 *
 * @author Paulo Roma
 * @since 24/07/2021
 * @see <a href="/eloquentJavascript/robot/robot.mjs">source</a>
 * @see https://techsparx.com/nodejs/esnext/dynamic-import-2.html
 * @see https://nodejs.medium.com/announcing-core-node-js-support-for-ecmascript-modules-c5d6dc29b663
 */

import * as readlineSync from "readline-sync";

import * as robot from "./07a_robot.js";

import getopts from "getopts";

/**
 * Counts the number of steps to deliver all parcels.
 *
 * @param {VillageState} state village state.
 * @param {robotCallback} robot returns the direction to follow based on the robot type.
 * @param {Array<string>} memory robot route.
 * @returns {number} steps.
 */
function countSteps(state, robot, memory) {
    for (let steps = 0; ; steps++) {
        if (state.parcels.length == 0) return steps;
        let action = robot(state, memory);
        state = state.move(action.direction);
        memory = action.memory;
    }
}

/**
 * Prints the average number of steps of running a given number of random tasks for each robot to solve.
 *
 * @param {Array<robot>} r robots to be compared.
 * @param {number} n number of parcels in each task.
 * @param {number} t number of random tasks.
 */
function compareRobots(r, n, t) {
    let total = Array(r.length).fill(0);
    for (let i = 0; i < t; i++) {
        let state = robot.VillageState.random(n);
        for (let [index, robot] of r.entries()) {
            total[index] += countSteps(state, robot, []);
        }
    }
    r.forEach((robot, index) => {
        console.log(
            `Robot ${robot.prototype.constructor.name} needed ${
                total[index] / t
            } steps per task`
        );
    });
}

/**
 * <p style="display: inline-block">Main function for reading command line arguments and running robot's comparisons.</p>
 *
 * @name main
 * @function
 * @global
 * @param {Array<String>} argv command line arguments:
 * </ul>
 * <li> -h help</li>
 * <li> -p #parcels</li>
 * <li> -t robot type</li>
 * <li> -d verbose mode</li>
 * </ul>
 *
 * @see https://npm.io/package/getopts
 */
(function main(argv) {
    const rtypes = [
        robot.randomRobot,
        robot.routeRobot,
        robot.goalOrientedRobot,
        robot.lazyRobot,
    ];

    let nparcels = 15,
        type = 2,
        debug = false;

    const options = getopts(
        // argv is (not defined) OR (defined AND uninitialized)
        typeof argv !== "undefined" ? argv : process.argv.slice(2),
        {
            alias: {
                nparcels: ["n", "p"],
                type: "t",
                debug: "d",
                help: "h",
            },
            default: {
                debug: false,
                nparcels: 15,
                type: 2,
            },
        }
    );

    if (options.help) {
        console.log(
            `Usage robot.mjs -p <#parcels> -t <robot type> -d <debugging>`
        );
        return 1;
    }

    debug = options.debug;
    if (typeof options.nparcels !== "boolean")
        nparcels = +options.nparcels || 15;
    if (typeof options.type !== "boolean")
        type = options.type % rtypes.length || 2;

    if (debug)
        console.log(
            `\nGraph = ${JSON.stringify(robot.roadGraph, null, "\t").replaceAll(
                '],\n\t"',
                '],\n\n\t"'
            )}\n`
        );

    console.log(`Robot Type: ${rtypes[type].prototype.constructor.name} `);
    console.log(`Number of Parcels: ${nparcels}`);
    console.log(`debug = ${debug}\n`);

    let task = robot.VillageState.random(nparcels);
    if (debug) robot.runRobot(task, rtypes[type], []);

    compareRobots(rtypes, nparcels, 100);
    console.log();

    let nodes = robot.parcelsNode(task.place, task.parcels, robot.roadGraph);
    if (debug) console.log(task);
    console.log(`Robot location: ${task.place}`);
    if (debug) console.log(nodes);

    let [kin, kout] = robot.maxNode(nodes);
    console.log(
        `Node with more parcels to send: ${kin} (${nodes[kin].index}) → ${nodes[kin].in}`
    );
    console.log(
        `Node with more parcels addressed to: ${kout} (${nodes[kout].index}) ← ${nodes[kout].out}`
    );

    argv = [];
    argv[0] = `--nparcels=${
        readlineSync.question("\nEnter next number of parcels: (15) ") || 15
    }`;
    argv[1] = `--type=${
        readlineSync.question("\nEnter robot type: (2) ") || 2
    }`;
    argv[2] = `--debug=${debug}`;
    main(argv);

    return 0;
})();
