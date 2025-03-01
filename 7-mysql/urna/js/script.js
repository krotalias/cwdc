/**
 * @file
 *
 * Summary.
 * <p>Clone do sistema de votação brasileiro.</p>
 *
 * Description.
 * <p>A votação consiste em escolher um candidato a vereador
 * e outro para prefeito.
 * </p>
 *
 * <p>O frontend é totalmente escrito em javascript/html/css e o backend
 * em <a href="../doc/html/index.html">php</a> e {@link https://www.mysql.com mysql}.
 * </p>
 *
 * <p>Essa versão pode armazenar o banco {@link https://dev.mysql.com/downloads/mysql/ MySQL}
 * no {@link https://railway.app Railway}.<br>
 * </p>
 *
 * É possível hospedar essa <a href="../../urna-vercel/jsdoc/index.html">aplicação</a> no Vercel,
 * que provê planos bastantes generosos na categoria hobby ou usuário gratuito.
 * <ul>
 *  <li>Permite executar funções {@link https://vercel.com/docs/concepts/functions/serverless-functions serverless} por
 * {@link https://vercel.com/docs/concepts/limits/overview#serverless-function-execution-timeout 10s}.</li>
 *  <li>Oferece um máximo de 1024MB de RAM.</li>
 *  <li>O diretório de armazenamento /tmp possui uma capacidade de 512MB.</li>
 *  <li>Não há limite de largura de banda ou qualquer outro tipo de limite para uma aplicação.</p>
 * </ul>
 *
 * <p>Toda aplicação de médio-grande porte deve lidar com informações sensíveis.<br>
 * Exemplos deste tipo de informação são as credenciais para acessar banco de dados e
 * {@link https://www.fortinet.com/resources/cyberglossary/api-key chaves API} de terceiros.</p>
 *
 * Se esse dados não forem criptografados {@link https://brightlineit.com/encryption-at-rest-important-business/ em repouso},
 * atacantes podem conseguir acessá-los e usá-los com propósitos maliciosos.
 * É aí onde entra em cena, uma solução como o
 * {@link https://www.doppler.com/blog/configuring-php-applications-using-environment-variables# Doppler}.
 *
 * <p>Notas:
 * <ol>
 *  <li>Não existe nenhum tipo de validação de eleitores ainda.</li>
 *  <li>É necessário usar PHP 8, porque é a única versão que suporta a autenticação default <em>caching_sha2_password</em>
 * do MySQL 8.</li>
 * </ol>
 *
 *  <pre>
 *  <code>
 *  {@link https://nodejs.org/en Node.js} installation (optional):
 *  - Ubuntu via {@link https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04#option-2-installing-node-js-with-apt-using-a-nodesource-ppa ppa}:
 *     - sudo apt install nodejs
 *  - MacOS via {@link https://www.macports.org MacPorts}:
 *     - sudo port install <a href="https://ports.macports.org/port/nodejs18/details/">nodejs18</a>
 *     - sudo port install <a href="https://ports.macports.org/port/npm9/">npm9</a>
 *  Documentation:
 *  - Ubuntu:
 *     - sudo apt install jsdoc-toolkit
 *        or for a <a href="https://github.com/jsdoc/jsdoc">newer version</a>
 *     - sudo npm install -g <a href="https://www.npmjs.com/package/jsdoc">jsdoc</a>
 *  - MacOS:
 *     - sudo port install npm8 (or npm9)
 *     - sudo npm install -g jsdoc
 *  - jsdoc -r -c ./conf.json -d jsdoc urna/js
 *
 *  Para iniciar o banco no {@link https://docs.railway.app/databases/mysql Railway}, basta fazer:
 *  - mysql -hcontainers-us-west-146.railway.app -uroot -p********************
 *          --port 6990 --protocol=TCP railway < <a href="../migration.sql">migration.sql</a>
 *  </code>
 *  </pre>
 *
 *  <img src="../img/screenshot.jpg">
 *
 * @see <a href="/cwdc/7-mysql/urna/urna.html">link</a>
 * @see <a href="/cwdc/7-mysql/urna/js/script.js">source</a>
 * @see https://www.youtube.com/watch?v=hF_VMWnsY00
 * @see https://github.com/ivanfilho21/bonieky-live-javascript
 * @see https://www.tse.jus.br/videos/tse-simule-como-votar-na-urna-eletronica-no-site-do-tse
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement/Audio
 * @see https://docs.railway.app/databases/mysql
 * @see https://www.mongodb.com/developer/technologies/vercel/
 * @see https://www.postman.com
 * @see https://dev.to/jorenrui/6-ways-to-deploy-your-personal-websites--php-mysql-web-apps-for-free-4m3a
 * @author Bonieky Lacerda e modificado por Paulo Roma Cavalcanti
 * @since 01/08/2022
 */

"use strict";

const rVotoPara = document.querySelector(".esquerda .rotulo.r1 span");
const rCargo = document.querySelector(".esquerda .rotulo.r2 span");
const numeros = document.querySelector(".esquerda .rotulo.r3");
const rDescricao = document.querySelector(".esquerda .rotulo.r4");
const rMensagem = document.querySelector(".esquerda .rotulo.r4 .mensagem");
const rNomeCandidato = document.querySelector(
  ".esquerda .rotulo.r4 .nome-candidato"
);
const rPartidoPolitico = document.querySelector(
  ".esquerda .rotulo.r4 .partido-politico"
);
const rNomeVice = document.querySelector(".esquerda .rotulo.r4 .nome-vice");
const rRodape = document.querySelector(".tela .rodape");

const rCandidato = document.querySelector(".direita .candidato");
const rVice = document.querySelector(".direita .candidato.menor");

const votos = [];

/**
 * 0: vereador, 1: prefeito
 * @type {Number}
 */
var etapaAtual = 0;

/**
 * Array com os candidatos a vereador, na posição 0, e prefeito, na posição 1.
 * <ul>
 * <li>0 {titulo: "vereador", numeros: 5, candidatos: Object}</li>
 * <li>1 {titulo: "prefeito", numeros: 2, candidatos: Object}</li>
 * </ul>
 * candidatos:
 * <pre>
 * {
 *    15123: {nome: "Filho", partido: "MDB", foto: "cv4.jpg"},
 *    27222: {nome: "Joel Varão", partido: "PSDC", foto: "cv5.jpg"},
 *    43333: {nome: "Dandor", partido: "PV", foto: "cv3.jpg"},
 *    45000: {nome: "Professor Clebson Almeida", partido: "PSDB", foto: "cv6.jpg"},
 *    51222: {nome: "Christianne Varão", partido: "PEN", foto: "cv1.jpg"},
 *    55555: {nome: "Homero do Zé Filho", partido: "PSL", foto: "cv2.jpg"},
 *    nulov: {nome: "NULO", partido: "Nenhum", foto: "cv5.jpg"}
 * }
 * </pre>
 *
 * @type {Array<{titulo: String, numeros: Number, candidatos: {String: {nome: String, partido: String, foto: String}}}>}
 * @see https://flexiple.com/javascript/associative-array-javascript/
 * @see https://linuxhint.com/javascript-associative-array/
 */
var etapas = null;

/**
 * Número de candidato digitado.
 * @type {String}
 */
var numeroDigitado = "";

/**
 * Se votou em branco ou não.
 * @type {Boolean}
 */
var votoEmBranco = false;

/**
 * Acessa o servidor, que retorna uma resposta em json, contendo
 * os candidatos. O servidor monta o json a partir do banco de dados.
 * O arquivo etapas.json não é mais necessário.
 */
ajax("candidatos.php", "GET", (response) => {
  etapas = JSON.parse(response);
  console.log(etapas);

  comecarEtapa();
});

window.onload = () => {
  let btns = document.querySelectorAll(".teclado--botao");
  for (let btn of btns) {
    btn.onclick = () => {
      clicar(btn.innerHTML);
    };
  }

  document.querySelector(".teclado--botao.branco").onclick = () => branco();
  document.querySelector(".teclado--botao.laranja").onclick = () => corrigir();
  document.querySelector(".teclado--botao.verde").onclick = () => confirmar();
};

/**
 * Inicia a etapa atual.
 */
function comecarEtapa() {
  let etapa = etapas[etapaAtual];
  console.log("Etapa atual: " + etapa["titulo"]);

  numeroDigitado = "";
  votoEmBranco = false;

  numeros.style.display = "flex";
  numeros.innerHTML = "";
  rVotoPara.style.display = "none";
  rCandidato.style.display = "none";
  rVice.style.display = "none";
  rDescricao.style.display = "none";
  rMensagem.style.display = "none";
  rNomeCandidato.style.display = "none";
  rPartidoPolitico.style.display = "none";
  rNomeVice.style.display = "none";
  rRodape.style.display = "none";

  for (let i = 0; i < etapa["numeros"]; i++) {
    let pisca = i == 0 ? " pisca" : "";
    numeros.innerHTML += `
      <div class="numero${pisca}"></div>
    `;
  }

  rCargo.innerHTML = etapa["titulo"];
}

/**
 * Procura o candidato pelo número digitado,
 * se encontrar, mostra os dados dele na tela.
 */
function atualizarInterface() {
  console.log("Número Digitado:", numeroDigitado);

  let etapa = etapas[etapaAtual];
  let candidato = null;

  for (let num in etapa["candidatos"]) {
    if (num == numeroDigitado) {
      candidato = etapa["candidatos"][num];
      break;
    }
  }

  console.log("Candidato: " + candidato);

  rVotoPara.style.display = "inline";
  rDescricao.style.display = "block";
  rNomeCandidato.style.display = "block";
  rPartidoPolitico.style.display = "block";

  if (candidato) {
    let vice = candidato["vice"];

    rRodape.style.display = "block";
    rNomeCandidato.querySelector("span").innerHTML = candidato["nome"];
    rPartidoPolitico.querySelector("span").innerHTML = candidato["partido"];

    rCandidato.style.display = "block";
    rCandidato.querySelector(".imagem img").src = `img/${candidato["foto"]}`;
    rCandidato.querySelector(".cargo p").innerHTML = etapa["titulo"];

    if (vice) {
      rNomeVice.style.display = "block";
      rNomeVice.querySelector("span").innerHTML = vice["nome"];
      rVice.style.display = "block";
      rVice.querySelector(".imagem img").src = `img/${vice["foto"]}`;
    } else {
      rNomeVice.style.display = "none";
    }

    return;
  }

  if (votoEmBranco) return;

  // Anular o voto
  rNomeCandidato.style.display = "none";
  rPartidoPolitico.style.display = "none";
  rNomeVice.style.display = "none";

  rMensagem.style.display = "block";
  rMensagem.classList.add("pisca");
  rMensagem.innerHTML = "VOTO NULO";
}

/**
 * Verifica se pode usar o teclado e atualiza o número.
 *
 * @param {String} value numerical value of the key pressed.
 */
function clicar(value) {
  console.log(value);

  let elNum = document.querySelector(".esquerda .rotulo.r3 .numero.pisca");
  if (elNum && !votoEmBranco) {
    numeroDigitado += value;
    elNum.innerHTML = value;
    elNum.classList.remove("pisca");

    let proximoNumero = elNum.nextElementSibling;
    if (proximoNumero) {
      proximoNumero.classList.add("pisca");
    } else {
      atualizarInterface();
    }

    // audio element can't play again.
    new Audio("audio/se1.mp3").play();
  }
}

/**
 * Verifica se há número digitado, se não,
 * vota em branco.
 */
function branco() {
  console.log("branco");

  // Verifica se há algum número digitado,
  // se sim, não vota
  if (!numeroDigitado) {
    votoEmBranco = true;

    numeros.style.display = "none";
    rVotoPara.style.display = "inline";
    rDescricao.style.display = "block";
    rMensagem.style.display = "block";
    rMensagem.innerHTML = "VOTO EM BRANCO";

    new Audio("audio/se1.mp3").play();
  }
}

/**
 * Reinicia a etapa atual.
 */
function corrigir() {
  console.log("corrigir");
  new Audio("audio/se2.mp3").play();
  comecarEtapa();
}

/**
 * Confirma o número selecionado.
 */
function confirmar() {
  console.log("confirmar");

  let etapa = etapas[etapaAtual];

  if (numeroDigitado.length == etapa["numeros"]) {
    if (etapa["candidatos"][numeroDigitado]) {
      // Votou em candidato
      votos.push({
        etapa: etapa["titulo"],
        numero: numeroDigitado,
      });
      console.log(`Votou em ${numeroDigitado}`);
    } else {
      // Votou nulo
      votos.push({
        etapa: etapa["titulo"],
        numero: null,
      });
      console.log("Votou Nulo");
    }
  } else if (votoEmBranco) {
    // Votou em branco
    votos.push({
      etapa: etapa["titulo"],
      numero: "",
    });
    console.log("Votou em Branco");
  } else {
    // Voto não pode ser confirmado
    console.log("Voto não pode ser confirmado");
    return;
  }

  new Audio("audio/se3.mp3").play();
  if (etapas[etapaAtual + 1]) {
    etapaAtual++;
    comecarEtapa();
  } else {
    // A única coisa que muda:
    // Registra os votos do usuário no servidor
    enviarVotos();

    document.querySelector(".tela").innerHTML = `
      <div class="fim">FIM</div>
    `;
  }
}

/**
 * Envia os votos do usuário para o servidor php
 */
function enviarVotos() {
  ajax(
    "registrarVoto.php",
    "POST",
    (response) => {
      console.log("Voto registrado no MySQL: " + response);
    },
    JSON.stringify({ votos: votos })
  );
}
