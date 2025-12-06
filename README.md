avaliacao de filmes - cassandra

projeto de avaliacao de filmes usando node.js, express e apache cassandra.

funcionalidades
- cadastrar novos filmes (titulo, ano, genero)
- listar todos os filmes cadastrados
- avaliar filmes com nota de 0 a 10
- ver todas as avaliacoes de um filme
- media das avaliacoes calculada automaticamente

tecnologias
- backend: node.js + express
- banco de dados: apache cassandra 5.0
- frontend: html5 + bootstrap 5 + javascript

pre-requisitos
- node.js (versao 18 ou superior)
- apache cassandra (versao 5.0 ou superior)
- npm ou yarn

instalacao

1. clonar o repositorio
git clone <seu-repositorio>
cd FilmesCassandra

2. instalar dependencias
npm install

3. configurar variaveis de ambiente
cp .env.example .env

edite o arquivo .env:
port=
cassandra_contact_points=
cassandra_port=
cassandra_local_datacenter=
cassandra_keyspace=
cassandra_connect_timeout=30000
node_env=development
log_level=info

para pegar o ip do container:
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' cassandra

4. iniciar cassandra

opcao a - docker (recomendado)
docker network create cassandra-net
docker run -d --name cassandra --network cassandra-net -p 9042:9042 cassandra:latest
docker logs -f cassandra   # aguarde subir

opcao b - local
cassandra -f

5. criar banco de dados
docker exec -it cassandra cqlsh   # ou apenas cqlsh se for local

execute:
create keyspace if not exists filmes with replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
use filmes;

create table if not exists catalogo (
    id uuid primary key,
    titulo text,
    ano int,
    genero text
);

create table if not exists avaliacao (
    id uuid primary key,
    id_filme uuid,
    nota int,
    data timestamp
);

create index if not exists avaliacao_id_filme_idx on avaliacao (id_filme);

6. testar conexao
npm run test
# ou
node testConnect.js

executar o projeto
npm start
# ou com reload automatico
npm run dev

abra no navegador: http://localhost:3000

endpoints da api

filmes
get    /filmes         -> lista todos os filmes
post   /filmes         -> cadastra novo filme

exemplo post filme:
{"titulo":"matrix","ano":1999,"genero":"ficcao cientifica"}

avaliacoes
get    /avaliacoes                -> todas as avaliacoes
get    /avaliacoes/:id_filme      -> avaliacoes de um filme
post   /avaliacoes                -> nova avaliacao

exemplo post avaliacao:
{"id_filme":"uuid-do-filme","nota":9}

testar com curl
curl http://localhost:3000/filmes
curl -X POST http://localhost:3000/filmes -H "Content-Type: application/json" -d "{\"titulo\":\"inception\",\"ano\":2010,\"genero\":\"ficcao\"}"
curl -X POST http://localhost:3000/avaliacoes -H "Content-Type: application/json" -d "{\"id_filme\":\"uuid-aqui\",\"nota\":10}"

estrutura do banco
keyspace: filmes (SimpleStrategy, replication_factor 1)

tabela catalogo
id uuid      (primary key)
titulo text
ano int
genero text

tabela avaliacao
id uuid       (primary key)
id_filme uuid
nota int
data timestamp

problemas comuns
- nao conecta: verifique docker ps ou nodetool status, ip correto no .env e teste com cqlsh <ip> 9042
- keyspace nao existe: execute novamente os comandos do init.cql
- porta 3000 ocupada: altere no .env ou index.js

autor
projeto desenvolvido como exercicio final do curso de nosql com apache cassandra.