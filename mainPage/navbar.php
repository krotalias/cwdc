<?php

// only get in from localhost, claro-net or vivo
set_include_path(".:/usr/share/pear:/usr/share/php':/Users/roma/html/cwdc/6-php/");
require "blockIPs.php";
?>

<nav class="navbar fixed-top navbar-expand-lg navbar-custom">
    <a class="navbar-brand" href="https://www.lcg.ufrj.br">
        <img src="/cwdc/mainPage/logo.png" style="height:48px;" alt="logo">
    </a>
    <button
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarTogglerDemo02"
        aria-controls="navbarTogglerDemo02"
        aria-expanded="false"
        aria-label="Toggle navigation"
    >
        <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarTogglerDemo02">
        <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
            <li class="nav-item active">
                <a class="nav-link" href="/cwdc/">Home<span class="sr-only">(current)</span></a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/cwdc/1-html/index.php">html</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/cwdc/2-css/index.php">css</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/cwdc/3-javascript/index.php">javascript</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/cwdc/4-jquery/index.php">jquery</a>
            </li>
            <li class="nav-item">
                <div class="dropdown mt-2 p-0" id="add_dropdown">
                    <button
                        type="button"
                        class="btn border-0 dropdown-toggle"
                        role="button"
                        data-toggle="dropdown"
                        style="padding: 0; color: lightgray"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        bootstrap
                    </button>
                    <div
                        class="dropdown-menu lcg-menu"
                        aria-labelledby="add_dropdown"
                    >
                        <a
                            class="dropdown-item"
                            href="/cwdc/5-bootstrap4/index.php"
                        >
                            Bootstrap 4
                        </a>
                        <a
                            class="dropdown-item"
                            href="/cwdc/5-bootstrap/index.php"
                        >
                            Bootstrap 5
                        </a>
                        <a
                            class="dropdown-item"
                            href="javascript:togglePlanes()"
                        >
                            show/hide footer
                        </a>
                    </div>
                </div>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/cwdc/6-php/index.php">php</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/cwdc/7-mysql/index.php">mysql</a>
            </li>
            <!--
            <li class="nav-item">
                <a class="nav-link" href="/cwdc/8-apis/index.php">apis</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/cwdc/9-mobileapps/index.php">mobileapps</a>
            </li>
            -->
            <li class="nav-item">
                <a class="nav-link" href="/cwdc/10-html5css3/index.php">html5css3</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/cwdc/11-python/index.php">python</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/cwdc/12-twitter/index.php">mvc</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/cwdc/13-webgl/index.php">webgl</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/cwdc/14-react/index.php">react</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/cwdc/15-webgpu/index.php">webgpu</a>
            </li>
        </ul>

        <form
            class="search form-inline navbar-form navbar-right"
            action="https://www.google.com/search"
            method="get"
            role="search"
            onSubmit="Gsitesearch(this)"
        >
            <div class="input-group">
                <input name="q" type="hidden" />
                <input
                    class="form-control mr-sm-2"
                    name="qfront"
                    type="search"
                    class="searchField"
                    placeholder="Google Site Search"
                    maxlength="50"
                    required
                >
                <span class="input-group-btn">
                    <button class="btn btn-outline-success my-2 my-sm-0"
                            type="submit"> Search <span class="glyphicon glyphicon-search"></span>
                    </button>
                </span>
            </div>
        </form>
    </div>
</nav>
