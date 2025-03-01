<?php

/**
 * \mainpage Urna eletrônica - Simula o sistema de votação brasileiro.
 *
 * <img src="../img/screenshot.jpg" height="420px" align="left"/>
 *
 * \image html resultado.png width=394px
 *
 */

/**
 * Conecta com o banco de dados.
 *
 * PHP version 5.3+
 *
 * @file connect1.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      <a href="/cwdc/7-mysql/urna/connect.php">link</a>
 * @see       <a href="/cwdc/7-mysql/urna/connect.php">link</a>
 * @see       https://www.php.net/manual/en/mysqli.construct.php
 * @since     31/07/2022
 */

require_once('../vendor/autoload.php');

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

/** Nome do servidor do banco de dados */
$servername = $_ENV['MYSQLHOST'];

/** Nome do banco de dados */
$database = $_ENV['MYSQLDATABASE'];

/** Nome do usuário */
$username = $_ENV['MYSQLUSER'];

/** Senha do usuário */
$password = $_ENV['MYSQLPASSWORD'];

/** Porta */
$port = $_ENV['MYSQLPORT'];

/** Protocolo */
$protocol = 'TCP';

/** Conjunto de caracteres válidos */
$charset = 'utf8mb4';

/** Conexão com o banco de dados */
try {
    $conn = new mysqli($servername, $username, $password, $database, $port);
} catch (Exception $e) {
    echo "Caught exception: {$e->getMessage()}\n";
} finally {
    // Verifica a conexão
    if (!isset($conn) || $conn->connect_error) {
        die(" - probably the database is not initialized yet!!");
    }
}

$conn->set_charset($charset);
