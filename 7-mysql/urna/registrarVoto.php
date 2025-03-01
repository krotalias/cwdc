<?php

/**
 * Recebe um voto através de uma string json obtida via um POST request.
 *
 * PHP version 5.3+
 *
 * @file registrarVoto.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      <a href="/cwdc/7-mysql/urna/registrarVoto.php">link</a>
 * @see       <a href="/cwdc/7-mysql/urna/registrarVoto.php">link</a>
 * @see       https://www.php.net/manual/en/function.file-get-contents.php
 * @see       https://www.php.net/manual/en/function.empty.php
 * @see       https://www.php.net/manual/en/function.is-null.php
 * @see       https://www.geeksforgeeks.org/how-to-receive-json-post-with-php/
 * @since     31/07/2022
 */

// Conecta com o banco de dados
require('connect.php');

/**
 * Objeto com os votos do usuário.
 *
 * Receive JSON string as post data,
 * by taking raw data from the request and
 * converting it into a PHP object.
 *
 * <pre>
 * $votos: Array
 *   (
 *       [0] => stdClass Object
 *           (
 *               [etapa] => vereador
 *               [numero] => 55555
 *           )
 *
 *       [1] => stdClass Object
 *           (
 *               [etapa] => prefeito
 *               [numero] => 15
 *           )
 *   )
 * </pre>
*/
$votos = json_decode(file_get_contents('php://input'))->votos;

// Registra os votos no banco de dados
foreach ($votos as $v) {
    // Voto branco ou nulo
    if (empty($v->numero) or is_null($v->numero)) {
        $numero = $v->etapa === "prefeito" ? "nulop" : "nulov";
    } else {
        $numero = $v->numero;
    }

    $query = sprintf(
        "UPDATE `Candidato`
        SET `votos` = votos + 1
        WHERE `titulo` = '%s' and numero = '%s'",
        mysqli_real_escape_string($conn, $v->etapa),
        mysqli_real_escape_string($conn, $numero)
    );

    // Retorna erro caso a query falhe
    if (!$conn->query($query)) {
        http_response_code(207);
        echo ("Erro ao registrar voto de " . $v->etapa . "<br>");
    };
}
