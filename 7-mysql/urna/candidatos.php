<?php

/**
 * Retorna a lista de candidatos: prefeitos + vereadores.
 *
 * Um array contendo todos os candidatos é enviado na forma
 * de um arquivo json.
 *
 * PHP version 5.3+
 *
 * @file candidatos.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      <a href="/cwdc/7-mysql/urna/candidatos.php">link</a>
 * @see       <a href="/cwdc/7-mysql/urna/candidatos.php">link</a>
 * @see       https://www.php.net/manual/en/mysqli.set-charset.php
 * @since     31/07/2022
 */

// Gera um objeto com os dados dos vereadores, prefeitos e seus respectivos vice-prefeitos.
$candidatos['0'] = getVereadores();
$candidatos['1'] = getPrefeitos();

// print_r($candidatos);

// Retorna um json contendo os dados dos candidatos
header('Content-Type: application/json; charset=utf-8');
echo json_encode($candidatos);

/**
 * Retorna um objeto contendo o nome, título e número de todos os vereadores
 * no banco de dados. No objeto também é inserido o nome do título (vereador)
 * e o número de dígitos no número de cada candidato.
 *
 * @return dados dos vereadores.
 */
function getVereadores()
{
    // Conecta com o banco de dados
    require('connect.php');

    $conn->set_charset("utf8mb4");

    // Executa a query para obter vereadores
    $vereadores_query = $conn->query(
        "SELECT `numero`, `nome`, `partido`, `foto`
        FROM `Candidato`
        WHERE `titulo` = 'vereador'"
    );

    // Retorna erro em caso de falha na query
    if (!$vereadores_query) {
        http_response_code(500);
        die("Erro ao obter vereadores.");
    }

    $row = $vereadores_query->fetch_assoc();

    $vereadores['titulo'] = 'vereador';
    $vereadores['numeros'] = strlen($row['numero']);

    do {
        $vereadores['candidatos'][$row['numero']] = $row;
        unset($vereadores['candidatos'][$row['numero']]['numero']);
        $row = $vereadores_query->fetch_assoc();
    } while ($row != null);

    return $vereadores;
}

/**
 * Retorna um objeto contendo o nome, título e número de todos os prefeitos
 * e seus respectivos vice-prefeitos no banco de dados.
 * No objeto também é inserido o nome do título (prefeito)
 * e o número de dígitos no número de cada candidato.
 *
 * @return dados dos prefeitos e vice-prefeitos.
 */
function getPrefeitos()
{
    // Conecta com o banco de dados
    require('connect.php');

    $conn->set_charset("utf8mb4");

    // Executa a query para obter prefeitos e vice-prefeitos
    $prefeitos_query = $conn->query(
        "SELECT *
        FROM `Candidato` INNER JOIN `Vice` USING (numero)
        WHERE `titulo` = 'prefeito'"
    );

    // Retorna erro em caso de falha na query
    if (!$prefeitos_query) {
        http_response_code(500);
        die("Erro ao obter prefeitos.");
    }

    $row = $prefeitos_query->fetch_row();

    $prefeitos['titulo'] = 'prefeito';
    $prefeitos['numeros'] = strlen($row[0]);

    do {
        $prefeitos['candidatos'][$row[0]]['nome'] = $row[1];
        $prefeitos['candidatos'][$row[0]]['partido'] = $row[3];
        $prefeitos['candidatos'][$row[0]]['foto'] = $row[4];
        $prefeitos['candidatos'][$row[0]]['vice']['nome'] = $row[6];
        $prefeitos['candidatos'][$row[0]]['vice']['partido'] = $row[7];
        $prefeitos['candidatos'][$row[0]]['vice']['foto'] = $row[8];
        $row = $prefeitos_query->fetch_row();
    } while ($row != null);

    return $prefeitos;
}
