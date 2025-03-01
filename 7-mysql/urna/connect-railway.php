<?php

/**
 * Conecta com o banco de dados hospedado no <a href="https://railway.app">railway</a>.
 *
 * PHP version 5.3+
 *
 * @file connect-railway.php
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
 * @see       https://railway.app/project/87db567d-6969-4d4e-9c37-bc87f1fb5a26/plugin/4f8ef56c-f768-4e22-b1c4-e0220d326934/data
 * @since     31/07/2022
 */

require_once('../vendor/autoload.php');

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

/** Nome do servidor do banco de dados */
$servername = $_ENV['RAILWAY_URNA_HOST'];

/** Nome do banco de dados */
$database = $_ENV['RAILWAY_URNA_DATABASE'];

/** Nome do usuário */
$username = $_ENV['RAILWAY_URNA_USER'];

/** Senha do usuário */
$password = $_ENV['RAILWAY_URNA_PASSWORD'];

/** Porta */
$port = $_ENV['RAILWAY_URNA_PORT'];

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
        die(" - probably Railway credits are over!!");
    }
}

$conn->set_charset($charset);
