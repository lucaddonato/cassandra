// =====================================
// 🧪 Teste de Conexão com Cassandra
// =====================================

require('dotenv').config();
const client = require('./db/cassandra');

console.log('🔄 Testando conexão com Cassandra...\n');
console.log('📋 Configurações:');
console.log(`   - Contact Points: ${process.env.CASSANDRA_CONTACT_POINTS}`);
console.log(`   - Datacenter: ${process.env.CASSANDRA_LOCAL_DATACENTER}`);
console.log(`   - Keyspace: ${process.env.CASSANDRA_KEYSPACE}`);
console.log(`   - Port: ${process.env.CASSANDRA_PORT || 9042}`);
console.log('');

client.connect()
  .then(async () => {
    console.log('✅ Conectado ao Cassandra com sucesso!');
    console.log('');
    
    // Testar consulta simples
    console.log('🔍 Testando consulta ao keyspace...');
    const result = await client.execute(
      `SELECT keyspace_name FROM system_schema.keyspaces WHERE keyspace_name = ?`,
      [process.env.CASSANDRA_KEYSPACE]
    );
    
    if (result.rows.length > 0) {
      console.log(`✅ Keyspace '${process.env.CASSANDRA_KEYSPACE}' encontrado!`);
    } else {
      console.log(`⚠️  Keyspace '${process.env.CASSANDRA_KEYSPACE}' não encontrado.`);
      console.log('💡 Execute o script init.cql para criar o keyspace.');
    }
    
    console.log('');
    console.log('📊 Verificando tabelas...');
    const tables = await client.execute(
      `SELECT table_name FROM system_schema.tables WHERE keyspace_name = ?`,
      [process.env.CASSANDRA_KEYSPACE]
    );
    
    if (tables.rows.length > 0) {
      console.log('✅ Tabelas encontradas:');
      tables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  Nenhuma tabela encontrada.');
      console.log('💡 Execute o script init.cql para criar as tabelas.');
    }
    
    console.log('');
    console.log('🎉 Teste concluído com sucesso!');
  })
  .catch(err => {
    console.error('❌ Erro de conexão:', err.message);
    console.log('');
    console.log('💡 Possíveis soluções:');
    console.log('   1. Verifique se o Cassandra está rodando:');
    console.log('      docker ps | grep cassandra');
    console.log('');
    console.log('   2. Verifique o IP do container:');
    console.log('      docker inspect -f \'{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}\' cassandra');
    console.log('');
    console.log('   3. Atualize o arquivo .env com o IP correto');
    console.log('');
    console.log('   4. Verifique se o keyspace foi criado:');
    console.log('      docker exec -it cassandra cqlsh -e "DESCRIBE KEYSPACES;"');
  })
  .finally(() => {
    client.shutdown();
  });