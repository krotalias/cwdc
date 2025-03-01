# Trabalho Final - Desenvolvimento Web (ICP-601) 2021/2

**Nome: Gabriel Rodrigues Cunha\
DRE: 119143696**

## Servir a aplicação

Para servir a aplicação deve-se seguir as seguintes etapas:

1. Criar um servidor Apache e um banco de dados MySQL e extrair todos os arquivos no servidor Apache.
2. No banco de dados MySQL, executar o script no arquivo `migration.sql`.
3. Após verificar se o script foi executado com sucesso. No arquivo `connect.php` é nescessário atualizar o valor das seguintes variáveis
    - `$servername` - Nome ou endereço do servidor.
    - `$database` - Nome do banco de dados criado.
    - `$username` - Nome de um usuário que tenha total acesso ao banco de dados.
    - `$password` - Senha do usuário.
4. Para testar a conexão da aplicação com o banco de dados, acesse a rota \
   `[ENDEREÇO_DA_APLICAÇÃO]/connect.php?teste=1`

Se o teste da etapa 4 indica uma conexão bem sucedida, então a aplicação já deve estar funcionando.

## Rotas da aplicação

-   `[ENDEREÇO_DA_APLICAÇÃO]/index.html` - Urna para o usuário registrar os seus votos.
-   `[ENDEREÇO_DA_APLICAÇÃO]/resultado.php` - Página contendo o resultado da eleição (com os vencedores marcados em verde) e com um botão que reinicia a contagem dos votos.

## Rotas de documentação

-   `[ENDEREÇO_DA_APLICAÇÃO]/jsdoc` - Documentação do código em javascript.
-   `[ENDEREÇO_DA_APLICAÇÃO]/doxygen/html` - Documentação do código em php.
