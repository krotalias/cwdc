<?php

/**
 * A set of simple WebGPU programs to develop basic programming skills.
 *
 * \mainpage CWDC WebGPU
 *
 * <p>The set is made up of programs in increasing order of difficulty.</p>
 *
 * PHP version 5.3+
 *
 * @section notes release.notes
 * Each program should run using any modern browser available.
 *
 * For configuring an Apache server to run WebGPU scripts, please, read:
 * - <a href="/python/ADs/cederj/AD1_2021-2.pdf#page=10">Section 1.5</a>
 *
 * @file index.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/15-webgpu
 * @see       <a href="/cwdc/15-webgpu">15-webgpu</a>
 * @since     07/04/2025
 */

$title = "15 - webgpu";
require "../mainPage/header.php";
require "../mainPage/navbar.php";
?>

<div class="lesson ml-0 mr-0">
    <div class="row m-0 p-0">
        <div class="col-sm-8 ml-0">
            <h3>
                <a href="/cwdc/downloads/PDFs/webgl.html">WebGPU</a>
                <a href="https://webgpufundamentals.org">(doc)</a>
                <a href="https://webgpureport.org">(report)</a>
            </h3>
            <ul
                style="
                    list-style-type: lower-greek;
                    padding-left: 3.5em;
                    font-size: 20px;
                "
            >
                <li>
                    <a href="https://sites.google.com/site/webglbook/">(examples)</a>
                    <a
                        href="https://www.rose-hulman.edu/class/csse/csse351/reference/0321902920_WebGL.pdf"
                    >
                        <img
                            width="34"
                            style="border: 0; text-align: center"
                            src="images/teal_book.png"
                            title="WebGL Programming"
                        />
                    </a>
                    <a href="https://math.hws.edu/graphicsbook/">
                        <img
                            width="34"
                            style="border: 0; text-align: center"
                            src="images/graphicstext-cover-180x235.png"
                            title="Introduction to Computer Graphics"
                        />
                    </a>
                    <a
                        href="https://math.hws.edu/graphicsbook/source/webgl/"
                    >
                        (examples)
                    </a>
                </li>
                <li>
                    <a href="https://www.cs.unm.edu/~angel/BOOK/INTERACTIVE_COMPUTER_GRAPHICS/SEVENTH_EDITION/">(examples)</a>
                    <a
                        href="http://csweb.wooster.edu/dbyrnes/cs300/Documents/Interactive%20Computer%20Graphics.pdf"
                    >
                        <img
                            width="34"
                            style="border: 0; text-align: center"
                            src="images/angel.jpg"
                            title="Interactive Computer Graphics"
                        />
                    </a>
                    <a
                        href="https://repository.unimal.ac.id/812/1/-%20Mathematics%20for%203D.pdf"
                    >
                        <img
                            width="34"
                            style="border: 0; text-align: center"
                            src="images/cover.png"
                            title="Mathematics for 3D Game Programming and Computer Graphics"
                        />
                    </a>
                    <a href="https://mathfor3dgameprogramming.com/">
                        (examples)
                    </a>
                </li>
                <li>
                    <a href="/cwdc/13-webgl/videos/Quaternions.html">(videos cg)</a>
                    <a
                        href="https://www.youtube.com/watch?v=mjrdywp5nyE"
                    >
                        <img
                            width="34"
                            style="border: 0; text-align: center"
                            src="images/gaga.jpg"
                            title="Super Bowl LI"
                        />
                    </a>
                    <a href="https://riptutorial.com/ebook/three-js">
                        <img
                            width="34"
                            style="border: 0; text-align: center"
                            src="images/cover-learning.png"
                            title="Three.js"
                        />
                    </a>
                    <a href="/cwdc/13-webgl/extras/doc">(papers cg)</a>
                </li>
                <li>
                    <a
                        href="/cwdc/15-webgpu/examples/index.html"
                    >
                        (Hello Quad)
                    </a>
                    <a href="https://threejs.org/examples/#webgpu_materials">(three.js examples)</a>
                </li>
                <li>
                    <a
                        href="/cwdc/13-webgl/extras/doc/gdc12_lengyel.pdf#page=48"
                    >
                        (𝑛′=(𝑀<sup>&#8211;1</sup>)<sup>𝑇</sup>⋅𝑛)
                    </a>
                </li>
            </ul>
        </div>
        <ol type="1" start="1">
            <li>
                <a
                    href="/cwdc/15-webgpu/TSL_Tutorial_Part_1/index.html"
                >
                    TSL Tutorial Part 1
                </a>
                <a
                    href="/cwdc/15-webgpu/TSL_Tutorial_Part_1/doc-tutorial/index.html"
                >
                    (source)
                </a>
                <a href="showCode.php?f=TSL_Tutorial_Part_1/index">
                    (html)
                </a>
                <a href="TSL_Tutorial_Part_1/main.css">(css)</a>
            </li>
        </ol>
    </div>
</div>
<hr />

<footer class="footer">
    <div class="container-fluid" style="text-align: center">
        <a
            href="https://www.militaryfactory.com/aircraft/detail.php?aircraft_id=300"
        >
            <figure>
                <img
                    class="pimg"
                    title="TBM Avengers"
                    alt="1943"
                    src="TBM Avengers.jpg"
                />
                <figcaption>
                    General Motors TBM Avenger (1942 - 442 kmh)
                </figcaption>
            </figure>
        </a>
    </div>
</footer>

<script src="../mainPage/main.js"></script>

<?php require "../mainPage/footer.php"; ?>

</body>
</html>
