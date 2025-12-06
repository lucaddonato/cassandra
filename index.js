// =====================================
// 🎬 Projeto: Avaliação de Filmes
// Backend Node.js + Express + Cassandra
// =====================================

// Carregar variáveis de ambiente
require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();

// Importar cliente Cassandra configurado
const client = require('./db/cassandra');

// Middleware necessário para ler JSON
app.use(express.json());

// Habilitar CORS para desenvolvimento
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

// Servir arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// =====================================
// 💾 Inicializar Conexão com Cassandra
// =====================================
client.connect()
  .then(() => {
    console.log('✅ Conectado ao Cassandra!');
    console.log(`📍 Keyspace: ${process.env.CASSANDRA_KEYSPACE}`);
    console.log(`🌐 Contact Points: ${process.env.CASSANDRA_CONTACT_POINTS}`);
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao Cassandra:', err);
    console.log('\n💡 Verifique se:');
    console.log('   1. O Cassandra está rodando');
    console.log('   2. O keyspace "filmes" foi criado');
    console.log('   3. As configurações no arquivo .env estão corretas');
    console.log('\n🔧 Configurações atuais:');
    console.log(`   - Contact Points: ${process.env.CASSANDRA_CONTACT_POINTS}`);
    console.log(`   - Datacenter: ${process.env.CASSANDRA_LOCAL_DATACENTER}`);
    console.log(`   - Keyspace: ${process.env.CASSANDRA_KEYSPACE}`);
    process.exit(1);
  });

// =====================================
// 🏠 Rota raiz
// =====================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =====================================
// 🎥 Rotas de FILMES
// =====================================

// Cadastrar novo filme
app.post('/filmes', async (req, res) => {
  try {
    const { titulo, ano, genero } = req.body;

    if (!titulo) {
      return res.status(400).json({ erro: "Campo 'titulo' é obrigatório!" });
    }

    await client.execute(
      'INSERT INTO catalogo (id, titulo, ano, genero) VALUES (uuid(), ?, ?, ?)',
      [titulo, ano || null, genero || null],
      { prepare: true }
    );

    if (process.env.LOG_LEVEL !== 'error') {
      console.log(`🎬 Novo filme cadastrado: ${titulo}`);
    }
    res.json({ mensagem: 'Filme cadastrado com sucesso!', titulo });
  } catch (err) {
    console.error('Erro ao cadastrar filme:', err);
    res.status(500).json({ erro: 'Erro ao cadastrar filme.' });
  }
});

// Listar todos os filmes
app.get('/filmes', async (req, res) => {
  try {
    const result = await client.execute('SELECT * FROM catalogo');
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(`📋 Listando ${result.rows.length} filmes`);
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar filmes:', err);
    res.status(500).json({ erro: 'Erro ao buscar filmes.' });
  }
});

// =====================================
// ⭐ Rotas de AVALIAÇÕES
// =====================================

// Cadastrar nova avaliação
app.post('/avaliacoes', async (req, res) => {
  try {
    const { id_filme, nota } = req.body;

    if (!id_filme || typeof nota === 'undefined') {
      return res.status(400).json({ erro: "Campos 'id_filme' e 'nota' são obrigatórios!" });
    }

    if (nota < 0 || nota > 10) {
      return res.status(400).json({ erro: "A nota deve estar entre 0 e 10!" });
    }

    await client.execute(
      'INSERT INTO avaliacao (id, id_filme, nota, data) VALUES (uuid(), ?, ?, toTimestamp(now()))',
      [id_filme, nota],
      { prepare: true }
    );

    if (process.env.LOG_LEVEL !== 'error') {
      console.log(`⭐ Nova avaliação registrada (filme ${id_filme} - nota ${nota})`);
    }
    res.json({ mensagem: 'Avaliação registrada!', nota });
  } catch (err) {
    console.error('Erro ao registrar avaliação:', err);
    res.status(500).json({ erro: 'Erro ao registrar avaliação.' });
  }
});

// Listar todas as avaliações
app.get('/avaliacoes', async (req, res) => {
  try {
    const result = await client.execute('SELECT * FROM avaliacao');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar avaliações:', err);
    res.status(500).json({ erro: 'Erro ao buscar avaliações.' });
  }
});

// Listar avaliações de um filme específico
app.get('/avaliacoes/:id_filme', async (req, res) => {
  try {
    const { id_filme } = req.params;
    const result = await client.execute(
      'SELECT * FROM avaliacao WHERE id_filme = ? ALLOW FILTERING',
      [id_filme],
      { prepare: true }
    );
    
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(`📊 ${result.rows.length} avaliações encontradas para o filme ${id_filme}`);
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar avaliações do filme:', err);
    res.status(500).json({ erro: 'Erro ao buscar avaliações do filme.' });
  }
});

// =====================================
// 🚀 Inicialização do servidor
// =====================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🎬 Servidor de Avaliação de Filmes   ║
╠════════════════════════════════════════╣
║  📍 URL: http://localhost:${PORT.toString().padEnd(4)}       ║
║  💾 Database: Cassandra                ║
║  🔧 Ambiente: ${process.env.NODE_ENV?.padEnd(11) || 'development'}           ║
║  ✅ Status: Rodando                    ║
╚════════════════════════════════════════╝
  `);
});