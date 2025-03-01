<?php

/**
 * Gera uma tabela com o resultados das eleições.
 *
 * A linha com o candidato mais votado é realçada com a cor verde.
 *
 * PHP version 5.3+
 *
 * @file resultado.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      <a href="/cwdc/7-mysql/urna/resultado.php">link</a>
 * @see       <a href="/cwdc/7-mysql/urna/resultado.php">link</a>
 * @see       https://www.php.net/manual/en/mysqli.set-charset.php
 * @since     31/07/2022
 */

 /**
  * Exibe a tabela com os resultados das eleições para vereador e prefeito.
  *
  * @return void
  */
function displayTable()
{
    echo("
    <div>
        <h1> Resultado das eleições</h1>
    ");

    // Desenha a tabela de vereadores
    tabelaVereadores();

    // Desenha a tabela de prefeitos e vice-prefeitos
    tabelaPrefeitos();

    // Insere o botão que reinicia a eleição
    botaoReiniciar();

    echo("
    </div>
    ");
}

/**
 * Desenha na tela uma tabela contendo todos os vereadores na eleição ordenados
 * por número de votos. O(s) vereador(es) com maior número de votos é(são) marcado(s)
 * em verde para indicar o vencedor ou vencedores no caso de empate.
 *
 * @see https://www.php.net/manual/en/mysqli-result.fetch-assoc.php
 */
function tabelaVereadores()
{
    // Conecta com o banco de dados
    require('connect.php');

    $conn->set_charset("utf8mb4");

    // Executa a query para obter os resultados das eleições para vereador
    $vereadores = $conn->query(
        "SELECT *
        FROM `Candidato`
        WHERE `titulo` = 'vereador'
        ORDER BY `votos` DESC, nome ASC"
    );

    // Retorna erro em caso de falha na query
    if (!$vereadores) {
        http_response_code(500);
        die("Erro ao obter vereadores.");
    }

    // Executa a query para obter o número de votos do vereador mais votado
    $max_votos_vereador = $conn->query(
        "SELECT max(votos)
        FROM `Candidato`
        WHERE `titulo` = 'vereador'"
    );

    // Retorna erro em caso de falha na query
    if (!$max_votos_vereador) {
        http_response_code(500);
        die("Erro ao obter número de votos do vereador mais votado.");
    }

    // Número de votos do vereador mais votado
    $max_votos_vereador = intval($max_votos_vereador->fetch_row()[0]);

    // Cabeçalho da tabela
    echo ("
        <table>
            <tr>
                <th colspan=\"4\">Vereador</th>
            </tr>
            <tr>
                <th>Numero</th>
                <th>Nome</th>
                <th>Partido</th>
                <th>Votos</th>
            </tr>
    ");

    // Insere os vereadores na tabela
    while ($row = $vereadores->fetch_assoc()) {
        if (intval($row['votos']) == $max_votos_vereador and $max_votos_vereador != 0) {
            $tr = "
            <tr class=\"vencedor\">";
        } else {
            $tr = "
            <tr>";
        }

        $tr .= sprintf(
            "
                <td>%s</td>
                <td>%s</td>
                <td>%s</td>
                <td>%s</td>
            </tr>",
            $row['numero'],
            $row['nome'],
            $row['partido'],
            $row['votos']
        );
        echo($tr);
    }

    echo("
        </table>");
}


/**
 * Desenha na tela uma tabela contendo todos os prefeitos e vice-prefeitos na eleição
 * ordenados por número de votos. O(s) prefeito(s) com maior número de votos
 * é(são) marcado(s) em verde para indicar o vencedor ou vencedores no caso de empate.
 *
 * @see https://www.php.net/manual/en/mysqli-result.fetch-row.php
 */
function tabelaPrefeitos()
{
    // Conecta com o banco de dados
    require('connect.php');

    $conn->set_charset("utf8mb4");

     // Executa a query para obter os resultados das eleições para prefeito
    $prefeitos = $conn->query(
        "SELECT *
        FROM `Candidato` INNER JOIN `Vice` USING (numero)
        WHERE `titulo` = 'prefeito'
        ORDER BY `votos` DESC, Candidato.nome ASC"
    );

    // Retorna erro em caso de falha na query
    if (!$prefeitos) {
        http_response_code(500);
        die("Erro ao obter prefeitos.");
    }

    // Executa a query para obter o número de votos do prefeito mais votado
    $max_votos_prefeito = $conn->query(
        "SELECT max(votos)
        FROM `Candidato`
        WHERE `titulo` = 'prefeito'"
    );

    // Retorna erro em caso de falha na query
    if (!$max_votos_prefeito) {
        http_response_code(500);
        die("Erro ao obter número de votos do prefeito mais votado.");
    }

    // Número de votos do prefeito mais votado
    $max_votos_prefeito = intval($max_votos_prefeito->fetch_row()[0]);

    // Cabeçalho da tabela
    echo ("
        <table>
            <tr>
                <th colspan=\"3\">Prefeito</th>
                <th colspan=\"2\">Vice-prefeito</th>
            </tr>
            <tr>
                <th>Numero</th>
                <th>Nome</th>
                <th>Partido</th>
                <th>Nome</th>
                <th>Partido</th>
                <th>Votos</th>
            </tr>
    ");

    // Insere os vereadores na tabela
    while ($row = $prefeitos->fetch_row()) {
        if (intval($row[5]) == $max_votos_prefeito and $max_votos_prefeito != 0) {
            $tr = "
            <tr class=\"vencedor\">";
        } else {
            $tr = "
            <tr>";
        }

        $tr .= sprintf(
            "
                <td>%s</td>
                <td>%s</td>
                <td>%s</td>
                <td>%s</td>
                <td>%s</td>
                <td>%s</td>
            </tr>",
            $row[0],
            $row[1],
            $row[3],
            $row[6],
            $row[7],
            $row[5]
        );
        echo($tr);
    }

    echo("
        </table>");
}

/**
 * Insere na tela um botão que reinicia a contagem dos votos de todos os candidatos
 */
function botaoReiniciar()
{
    echo("
        <a href=\"./reiniciar.php\">
            <button>Reiniciar Eleição</button>
        </a>
    ");
}

?>

<!DOCTYPE html>
<html lang="pt-BR">
    <head>
        <meta charset="UTF-8" />
        <title>Resultado</title>
        <style>
            body {
                background-color: lightgray;
            }

            h1 {
                text-align: center;
            }

            div {
                margin-left: auto;
                margin-right: auto;
                width: fit-content;
            }

            table {
                margin-left: auto;
                margin-right: auto;
                margin-top: 40px;
                width: 100%;
            }

            table, th, td {
                border: 1px solid;
            }

            .vencedor {
                background-color: lightgreen;
            }

            a {
                margin-left: auto;
                margin-right: auto;
                display: table;
            }

            button {
                margin-top: 40px;
                font-size: 18px;
            }
        </style>
    </head>
    <body>
        <?php displayTable(); ?>
    </body>
</html>
