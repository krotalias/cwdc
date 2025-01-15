<?php

/**
 * CPF and CNPJ validation.
 *
 * <p>CPF validation</p>
 *
 * Some valid CPFs:
 *     1. 757.331.783-29
 *     2. 841.315.629-79
 *     3. 635.111.771-20
 *     4. 348.536.715-01
 *
 * Para exemplificar o processo de validação, serão
 * calculados os dígitos verificadores de um CPF hipotético, 111.444.777-XX.
 *
 * Calculando o Primeiro Dígito Verificador.
 *
 * O primeiro dígito verificador do CPF é calculado utilizando-se
 * o seguinte algoritmo:
 *
 * 1. Distribua os 9 primeiros dígitos em um quadro colocando os pesos
 *    10, 9, 8, 7, 6, 5, 4, 3, 2, <br>
 *    da esquerda para a direita, conforme indicado abaixo:
 *    <PRE>
 *        1       1       1       4       4       4       7       7       7
 *        10      9       8       7       6       5       4       3       2
 *    </PRE>
 * 2. Multiplique os valores de cada coluna:
 *    <PRE>
 *        1       1       1       4       4       4       7       7       7
 *        10      9       8       7       6       5       4       3       2
 *        10      9       8       28      24      20      28      21      14
 *    </PRE>
 * 3. Calcule o somatório dos resultados (10+9+...+21+14) = 162.
 * 4. O resultado obtido (162) será divido por 11. <br>
 *    O resto da divisão indicará o primeiro dígito verificador: 162 % 11 = 8.
 *
 * Se o resto da divisão for menor do que 2,
 * o primeiro dígito verificador se torna zero. <br>
 * Caso contrário, subtraia o valor obtido de 11,
 * para obter o primeiro dígito verificador: 11-8 = 3. <br>
 * Portanto, o CPF até agora está assim: 111.444.777-3X.
 *
 * Calculando o Segundo Dígito Verificador
 *
 * Para o cálculo do segundo dígito, será usado o
 * primeiro dígito verificador já encontrado:
 *
 * 1. Monte uma tabela semelhante à anterior, só que desta vez
 *    usando na segunda linha os valores <br>
 *    11,10,9,8,7,6,5,4,3,2, já que foi incorporado mais um algarismo ao cálculo.
 *    <PRE>
 *        1       1       1       4       4       4       7       7       7       3
 *        11      10      9       8       7       6       5       4       3       2
 *    </PRE>
 * 2. Multiplique os valores de cada coluna e efetue o somatório
 *     dos resultados obtidos: (11+10+...+21+6) = 204.
 *    <PRE>
 *        1       1       1       4       4       4       7       7       7       3
 *        11      10      9       8       7       6       5       4       3       2
 *        11      10      9       32      28      24      35      28      21      6
 *    </PRE>
 * 3. Divida o total do somatório por 11 e considere
 *    o resto da divisão: 204 % 11 = 6.
 * 4. Se o resto da divisão for menor do que 2,
 *    o segundo dígito verificador se torna zero.<br>
 *    Caso contrário, é necessário subtrair o valor obtido de 11,
 *    para gerar o segundo dígito verificador: 11-6 = 5.
 *
 * Ao final dos cálculos, descobre-se que os dígitos verificadores do CPF hipotético
 * são os números 3 e 5.<br>
 * Portanto, o CPF completo é: 111.444.777-35.
 *
 * <hr>
 *
 * <p>CNPJ validation.</p>
 *
 * Some valid cnpjs:
 *
 *     1.  14.358.805/0001-16
 *     2.  72.181.240/0001-40
 *     3.  91.655.845/0001-70
 *     4.  72.060.999/0001-75
 *
 * Para exemplificar o processo de validação, serão
 * calculados os dígitos verificadores de um CNPJ hipotético, 11.444.777/0001-XX.
 *
 * Calculando o Primeiro Dígito Verificador.
 *
 * O primeiro dígito verificador do CNPJ é calculado utilizando-se
 * o seguinte algoritmo:
 *
 * 1. Distribua os 9 primeiros dígitos em um quadro colocando os pesos
 *    5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 <br>
 *    da esquerda para a direita, conforme indicado abaixo:
 *    <PRE>
 *        1       1       4       4       4       7       7       7       0      0      0       1
 *        5       4       3       2       9       8       7       6       5      4      3       2
 *    </PRE>
 * 2. Multiplique os valores de cada coluna:
 *    <PRE>
 *        1       1       4       4       4       7       7       7       0      0       0       1
 *        5       4       3       2       9       8       7       6       5      4       3       2
 *        5       4       12      8       36      56      49      42      0      0       0       2
 *    </PRE>
 * 3. Calcule o somatório dos resultados (5+4+...+0+2) = 214.
 * 4. O resultado obtido (214) será divido por 11. <br>
 *    O resto da divisão indicará o primeiro dígito verificador: 214 % 11 = 5.
 *
 * Se o resto da divisão for menor do que 2,
 * o primeiro dígito verificador se torna zero.<br>
 * Caso contrário, subtraia o valor obtido de 11,
 * para obter o primeiro dígito verificador: 11-5 = 6. <br>
 * Portanto, o CNPJ até agora está assim: 11.444.777/0001-6X.
 *
 * Calculando o Segundo Dígito Verificador
 *
 * Para o cálculo do segundo dígito, será usado o primeiro
 * dígito verificador já encontrado:
 *
 * 1. Monte uma tabela semelhante à anterior,
 *   só que desta vez usando na segunda linha os valores <br>
 *   11,10,9,8,7,6,5,4,3,2, já que foi incorporado mais um algarismo ao cálculo.
 *   <PRE>
 *        1       1       4       4       4       7       7       7       0       0      0       1       6
 *        6       5       4       3       2       9       8       7       6       5      4       3       2
 *   </PRE>
 * 2. Multiplique os valores de cada coluna e efetue o somatório dos
 *   resultados obtidos: (11+10+...+21+6) = 204.
 *   <PRE>
 *        1       1       4       4       4       7       7       7       0      0       0       1      6
 *        6       5       4       3       2       9       8       7       6      5       4       3      2
 *        6       5       16      12      8       63      56      49      0      0       0       3      12
 *   </PRE>
 * 3. Divida o total do somatório por 11 e considere o resto da divisão:
 *    221 % 11 = 10.
 * 4. Se o resto da divisão for menor do que 2,
 *    o segundo dígito verificador se torna zero. <br>
 *    Caso contrário, é necessário subtrair o valor obtido de 11,
 *    para gerar o segundo dígito verificador: 11-10 = 1.
 *
 * Ao final dos cálculos, descobre-se que os dígitos verificadores do CNPJ
 * hipotético são os números 6 e 1.  <br>
 * Portanto, o CNPJ completo é: 11.444.777/0001-61.
 *
 * PHP version 5.3+
 *
 * @file cadastro_nacional.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/6-php/cadastro_nacional.php
 * @see       <a href="/cwdc/6-php/cadastro_nacional.php">link</a>
 * @see       https://wiki.php.net/rfc/short_list_syntax
 * @see       https://www.geradorcpf.com/
 * @see       https://www.geradorcnpj.com/
 * @since     01/02/2021
 */

/**
 * Dot product of v1 and v2.
 */
function dotProd($v1, $v2)
{
    return array_sum(
        array_map(
            function ($a, $b) {
                return $a * $b;
            },
            $v1,
            $v2
        )
    );
}

/**
 * Validates a CPF using the verification digits (DV).
 *
 * @param $cpf CPF.
 * @param $dv  verification digits.
 *
 * @return an array: [True/False if the cpf is valid/invalid, correct dv].
 */
function validateCPF($cpf, $dv)
{
    $cpf2 = [10, 9, 8, 7, 6, 5, 4, 3, 2];
    $cpf1 = array_merge([11], $cpf2);

    // transform a string to an array of integers
    $d = array_map("intval", str_split($cpf));

    $getDigit = function ($n) {
        return $n <= 1 ? 0 : 11 - $n;
    };

    $v2 = dotProd($cpf2, $d);
    $v2 = $getDigit($v2 % 11);

    $d[] = $v2; // insert v2 at the end of d

    $v1 = dotProd($cpf1, $d);
    $v1 = $getDigit($v1 % 11);

    $DV = $v2 * 10 + $v1;

    return [$DV == $dv, $DV];
}

/**
 * Validates a CNPJ using the verification digits (DV).
 *
 * @param $cnpj CNPJ.
 * @param $dv   verification digits.
 *
 * @return an array: [True/False if the cnpj is valid/invalid, correct dv].
 */
function validateCNPJ($cnpj, $dv)
{
    $cnpj2 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    $cnpj1 = array_merge([6], $cnpj2);

    // transform a string to an array of integers
    $d = array_map("intval", str_split($cnpj));

    $getDigit = function ($n) {
        return $n <= 1 ? 0 : 11 - $n;
    };

    $v2 = dotProd($cnpj2, $d);
    $v2 = $getDigit($v2 % 11);

    $d[] = $v2; // insert v2 at the end of d

    $v1 = dotProd($cnpj1, $d);
    $v1 = $getDigit($v1 % 11);

    $DV = $v2 * 10 + $v1;
    return [$DV == $dv, $DV];
}

/**
 * Generates a random CPF.
 *
 * @return an array: [formatted cpf, dv, formatted cpf-dv].
 */
function randomCPF()
{
    $cpf = sprintf("%09s", strval(rand(0, 999999999)));
    $res = validateCPF($cpf, 0);
    $cpf = formatCPF($cpf);
    return array($cpf, $res[1], sprintf("%s-%02d", $cpf, $res[1]));
}

/**
 * Generates a random CNPJ.
 *
 * @return an array: [formatted cnpj, dv, formatted cnpj-dv].
 */
function randomCNPJ()
{
    $cnpj = sprintf("%012s", strval(rand(0, 999999999999)));
    $res = validateCNPJ($cnpj, 0);
    $cnpj = formatCNPJ($cnpj);
    return array($cnpj, $res[1], sprintf("%s-%02d", $cnpj, $res[1]));
}

/**
 * Format a CPF by inserting dots between triples of digits.
 *
 * @param $cpf string representing a CPF: "111444777"
 * @return a formatted CPF: "111.444.777"
 * @see https://www.php.net/manual/en/function.preg-replace.php
 */
function formatCPF($cpf)
{
    $regex = '/(\d{3})\.?(\d{3})\.?(\d{3})/i';
    $pattern = "$1.$2.$3";
    return preg_replace($regex, $pattern, $cpf);
}

/**
 * Format a CNPJ by inserting dots and a slash between group of digits.
 *
 * @param $cnpj string representing a CNPJ: "114447770001"
 * @return a formatted CNPJ: "11.444.777/0001"
 */
function formatCNPJ($cnpj)
{
    $regex = "/(\d{2})\.?(\d{3})\.?(\d{3})\.?(\d{4})/i";
    $pattern = "$1.$2.$3/$4";
    return preg_replace($regex, $pattern, $cnpj);
}

/**
 * Checks the validity of a given CPF.
 * @param $cpfStr string with a CPF.
 * @return a string in the format "(V|Inv)alid CPF: 111.444.777-35"
 */
function checkCPF($cpfStr)
{
    $CPF = str_replace([".","-"], "", $cpfStr);
    $cpf = substr($CPF, 0, 9);
    $dv = substr($CPF, -2);
    $CPF = sprintf("%s-%s", formatCPF($cpf), $dv);
    return sprintf("%salid CPF: %s", validateCPF($cpf, $dv)[0] ? "V" : "Inv", $CPF);
}
/**
 * Checks the validity of a given CNPJ.
 * @param $cnpjStr string with a CNPJ.
 * @return a string in the format "(V|Inv)alid CNPJ: 11.444.777/0001-61"
 */
function checkCNPJ($cnpjStr)
{
    $CNPJ = str_replace([".", "-", "/"], "", $cnpjStr);
    $cnpj = substr($CNPJ, 0, 12);
    $dv = substr($CNPJ, -2);
    $CNPJ = sprintf("%s-%s", formatCNPJ($cnpj), $dv);
    return sprintf("%salid CNPJ: %s", validateCNPJ($cnpj, $dv)[0] ? "V" : "Inv", $CNPJ);
}
