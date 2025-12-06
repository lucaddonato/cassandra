-- =====================================
-- 🎬 Script de Inicialização do Banco
-- Projeto: Avaliação de Filmes
-- =====================================

-- 1. Criar o keyspace
CREATE KEYSPACE IF NOT EXISTS filmes
WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
};

-- 2. Usar o keyspace
USE filmes;

-- 3. Criar tabela de catálogo de filmes
-- Armazena informações básicas dos filmes
CREATE TABLE IF NOT EXISTS catalogo (
    id UUID PRIMARY KEY,
    titulo TEXT,
    ano INT,
    genero TEXT
);

-- 4. Criar tabela de avaliações
-- Armazena as avaliações dos filmes com nota e data
CREATE TABLE IF NOT EXISTS avaliacao (
    id UUID PRIMARY KEY,
    id_filme UUID,
    nota INT,
    data TIMESTAMP
);

-- 5. Criar índice para facilitar consultas por id_filme
-- Isso permite buscar todas as avaliações de um filme específico
CREATE INDEX IF NOT EXISTS avaliacao_id_filme_idx ON avaliacao (id_filme);

-- =====================================
-- ✅ Banco inicializado com sucesso!
-- =====================================
-- Execute este script no cqlsh:
-- docker exec -it cassandra cqlsh < init.cql
-- ou copie e cole os comandos no cqlsh
-- =====================================

-- Verificar se as tabelas foram criadas:
DESCRIBE TABLES;

-- Exemplo de inserção de dados de teste (opcional):
-- INSERT INTO catalogo (id, titulo, ano, genero) VALUES (uuid(), 'Matrix', 1999, 'Ficção Científica');
-- INSERT INTO catalogo (id, titulo, ano, genero) VALUES (uuid(), 'O Poderoso Chefão', 1972, 'Drama');
-- INSERT INTO catalogo (id, titulo, ano, genero) VALUES (uuid(), 'Pulp Fiction', 1994, 'Crime');
