<?php

/**
 * Password hash.
 *
 * When a password has been “hashed” it means it has been turned
 * into a scrambled representation of itself.
 *
 * Password hashing is used to verify the integrity
 * of your password, sent during login, <br>
 * against the stored hash so that your actual password never has to be stored. <br>
 * Not all cryptographic algorithms are suitable for the modern industry.
 *
 * CrackStation uses massive pre-computed lookup tables
 * to crack password hashes. <br>
 * These tables store a mapping between the hash of a password,
 * and the correct password for that hash.
 *
 * The hash values are indexed so that it is possible to quickly
 * search the database for a given hash. <br>
 * If the hash is present in the database, the password can be
 * recovered in a fraction of a second.
 *
 * Dynamic salt: a different salt for each user.
 * - md5(md5($row['id']).'password');
 *
 * PHP version 5.3+
 *
 * @file 8.8.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/7-mysql/8.8.php
 * @see       <a href="/cwdc/7-mysql/8.8.php">link</a>
 * @see       <a href="/cwdc/7-mysql/showcode.php?f=8.8">source</a>
 * @see       https://en.wikipedia.org/wiki/MD5
 * @see       https://en.wikipedia.org/wiki/SHA-1
 * @see       https://www.php.net/manual/en/faq.passwords.php
 * @see       https://nakedsecurity.sophos.com/2013/11/20/serious-security-how-to-store-your-users-passwords-safely/
 * @see       https://www.md5online.org/blog/md5-salt-hash/
 * @see       https://www.theguardian.com/technology/2016/dec/15/passwords-hacking-hashing-salting-sha-2
 * @see       http://crackstation.net
 * @see       https://en.citizendium.org/wiki/One-way_encryption
 * @see       https://www.simms.co.uk/tech-talk/understanding-the-levels-of-encryption/
 * @see       https://www.thesslstore.com/blog/difference-encryption-hashing-salting/
 * @since     09/02/2021
 */

/// Level three encryption.
$salt = 'isefjfehi2736582KUFED';

/**
 * A trick to execute a function within heredoc strings.
 *
 * @param $data possibly a function to be executed.
 *
 * @return $data
 */
$fcn = function ($data) {
    return $data;
};

echo <<<EOT
    <p><b>Password</b> is: 'password' </p>

    <p><b>Salt</b> is: '$salt'</p>

    <p>md5('password'): {$fcn(md5("password"))}</p>
    <ul>
        <li><a href="https://en.wikipedia.org/wiki/MD5">MD5</a> (Message Digest Algorithm 5 - 1992)</li>
        <li>128 bits (32 hexadecimal digits long) digest</li>
        <li><a href="https://en.wikipedia.org/wiki/Birthday_attack">cryptographically broken</a></li>
    </ul>

    <p>md5(sha1('password')): {$fcn(md5(sha1("password")))}</p>
    <ul>
        <li><a href="https://en.wikipedia.org/wiki/Cryptography">cryptography</a>
            is the practice and study of techniques for secure communication
            in the presence of adversarial behavior</li>
        <li>either MD5 or SHA1 hashing are one way cryptographic functions,
            while encryption is a two way cryptographic function</li>
        <li>there is no known way to decrypt an already hashed string</li>
        <li>still <a href="http://crackstation.net">crackable</a></li>
    </ul>

    <p>sha1('password'): {$fcn(sha1("password"))}</p>
    <ul>
        <li><a href="https://en.wikipedia.org/wiki/SHA-1">SHA-1</a> (Secure Hash Algorithm 1 - 1995)</li>
        <li>160 bits (40 hexadecimal digits long) fingerprint</li>
        <li>cryptographically broken</li>
    </ul>

    <p>md5(salt . 'password'): {$fcn(md5($salt . "password"))}</p>
    <ul>
        <li>salt is a unique value that can be added to the start or end of the password
            to create a different hash value</li>
        <li>a better approach - resisted <a href='crackstation.png'>CrackStation</a></li>
    </ul>

    <p>hash('sha224', 'password'): {$fcn(hash('sha224', "password"))}</p>
    <p>hash('sha256', 'password'): {$fcn(hash('sha256', "password"))}</p>
    <p>hash('sha384', 'password'): {$fcn(hash('sha384', "password"))}</p>
    <p>hash('sha512', 'password'): {$fcn(hash('sha512', "password"))}</p>
    <ul>
        <li><a href="https://en.wikipedia.org/wiki/SHA-2">SHA-2</a> (Secure Hash Algorithm 2 - 2001)</li>
        <li>major companies replaced SHA-1 for SHA-2 certificates in authentication services and WEB sites,
        by the end of March 2016, because the SHA-1 certificates were no longer secure</li>
        <li>224 bits (56 hexadecimal digits long) fingerprint</li>
        <li>256 bits (64 hexadecimal digits long) fingerprint is 20-30% slower than MD5 or SHA1
                and authenticates Debian software packages</li>
        <li>384 bits (96 hexadecimal digits long) fingerprint</li>
        <li>512 bits (128 hexadecimal digits long) fingerprint</li>
    </ul>
EOT;
