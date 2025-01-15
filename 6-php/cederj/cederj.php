<?php

/**
 * Creates an HTML ordered list with the PIG classrooms from cederj.
 *
 * An array in PHP is actually an ordered map.
 * A map is a type that associates values to keys.
 *
 * PHP version 5.3+
 *
 * @file cederj.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/6-php/cederj.php
 * @see       <a href="/cwdc/6-php/cederj.php">link</a>
 * @see       https://www.php.net/manual/en/language.types.array.php
 * @since     26/10/2021
 */

$title = "Cederj";
require "../../mainPage/header.php";
require "../../mainPage/navbar.php";

/**
 * Returns a PIG (Programação com Interfaces Gráficas) classroom URL:
 * - e.g.: https://videoaula.rnp.br/v.php?f=/cederj/sistemas_comp/ead05030/Aula_001/Aula_001.xml
 *
 * @param $g a classroom number with 3 digits: 001 ... 014
 *
 * @return URL.
 */
function getUrl($g)
{
    $classNumber = [
        112693,
        112697,
        117191,
        136551,
        136554,
        136555,
        136556,
        136558,
        136561,
        136564,
        168426,
        162038,
        162113,
        136573,
    ];
    // return "https://videoaula.rnp.br/v.php?f=/cederj/sistemas_comp/ead05030/Aula_0{$g}/Aula_0{$g}.xml";
    return "https://eduplay.rnp.br/portal/video/{$classNumber[$g]}";
}

/**
 * Creates an HTML ordered list with all classroom titles in a local array $arr.
 *
 * @return void
 */
function createList()
{
    $arr = [
        "Introdução",
        "Classes",
        "Exceções",
        "Projeto 1: Frações",
        "Módulos",
        "Arquivos",
        "Projeto 2: Frações com Arquivos👎 (no Safari apenas)",
        "Projeto 3: Impressora",
        "Projeto 4: Calcular o Consumo de um Carro",
        "Projeto 5: Ordenar as Linhas de um Arquivo",
        "Interfaces Gráficas com Tk",
        "Programação com Eventos",
        "Menus",
        "Canvas",
    ];

    echo "<ol>";
    foreach ($arr as $i => $title) {
        //$url = getUrl(sprintf("%02d", $i + 1));
        $url = getUrl($i);
        echo "
            <li>
                <a href=\"{$url}\">{$title}</a>
            </li>
        ";
    }
    echo "
    <li>
        <a href=\"/python/ADs/cederj\">ADs (2017-2022)</a>
    </li>
    <li>
        <a href=\"/python/provas/cederj\">APs (2017-2022)</a>
    </li>
    ";
    echo "</ol>";
}
?>

<div class="lesson">
    <h3>
        <a href="https://graduacao.cederj.edu.br/ava/login/index.php">
            <img
                title="cecierj"
                src="logo-cecierj-cederj.png"
                alt="cederj"
                width="256"
                style="margin: 0 auto; display: block;"
            />
        </a>
        <br />
        <a href="https://eduplay.rnp.br/portal/playlist/112694">
            Programação com Interfaces Gráficas
        </a>
        <a href="/python">(doc)</a>
        <a href="https://www.youtube.com/watch?v=JSIsoj1QPAc">(video)</a>
    </h3>

    <?php createList(); ?>
</div>

<hr />

<footer class="footer">
    <div class="container-fluid" style="text-align: center;">
        <a href="https://www.militaryfactory.com/aircraft/detail.asp?aircraft_id=299">
            <figure>
                <img
                    title="Martin B-26 Marauder"
                    alt="1941"
                    src="Martin-B-26-Marauder-American-Heavy-Bomber.jpg"
                    class="pimg"
                >
                <figcaption>
                    Martin B-26 Marauder (1941 - 454 kmh)
                </figcaption>
            </figure>
        </a>
    </div>
</footer>

<script src="/cwdc/mainPage/main.js"></script>

<?php require "../../mainPage/footer.php"; ?>

</body>

</html>