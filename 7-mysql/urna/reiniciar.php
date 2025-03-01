<?php

/**
 * Zera o contador de votos de todos os candidatos.
 *
 * PHP version 5.3+
 *
 * @file reiniciar.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      <a href="/cwdc/7-mysql/urna/reiniciar.php">link</a>
 * @see       <a href="/cwdc/7-mysql/urna/reiniciar.php">link</a>
 * @see       https://www.w3schools.com/php/php_mysql_update.asp
 * @since     31/07/2022
 */

// Conecta com o banco de dados
require('connect.php');

/**
 * Requisição que reinicia a contagem de votos no banco de dados.
 */
$r = $conn->query(
    "UPDATE `Candidato`
    SET votos = 0"
);

/*
 * Retorna erro em caso de falha na query.
 * Caso contrário, redireciona de volta para a página de resultados.
 */
/// @cond ERROR
if (!$r) {
    http_response_code(500);
    die("Erro ao reiniciar votos.");
} else {
    header("Location: ./resultado.php");
    die();
}
/// @endcond
