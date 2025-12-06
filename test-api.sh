#!/bin/bash

# =====================================
# 🧪 Script de Teste da API
# =====================================

API_URL="http://localhost:3000"

echo "🎬 Testando API de Avaliação de Filmes"
echo "======================================"
echo ""

# Teste 1: Listar filmes
echo "📋 Teste 1: Listar filmes..."
curl -s $API_URL/filmes | json_pp
echo ""
echo ""

# Teste 2: Adicionar filme
echo "➕ Teste 2: Adicionar novo filme..."
curl -s -X POST $API_URL/filmes \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Matrix",
    "ano": 1999,
    "genero": "Ficção Científica"
  }' | json_pp
echo ""
echo ""

# Teste 3: Adicionar outro filme
echo "➕ Teste 3: Adicionar outro filme..."
curl -s -X POST $API_URL/filmes \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "O Senhor dos Anéis",
    "ano": 2001,
    "genero": "Fantasia"
  }' | json_pp
echo ""
echo ""

# Teste 4: Listar filmes novamente
echo "📋 Teste 4: Listar filmes atualizados..."
FILMES=$(curl -s $API_URL/filmes)
echo $FILMES | json_pp
echo ""

# Extrair o ID do primeiro filme para testes
FILME_ID=$(echo $FILMES | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "🎯 ID do primeiro filme: $FILME_ID"
echo ""

# Teste 5: Adicionar avaliação
if [ ! -z "$FILME_ID" ]; then
  echo "⭐ Teste 5: Adicionar avaliação..."
  curl -s -X POST $API_URL/avaliacoes \
    -H "Content-Type: application/json" \
    -d "{
      \"id_filme\": \"$FILME_ID\",
      \"nota\": 9
    }" | json_pp
  echo ""
  echo ""
  
  # Teste 6: Adicionar outra avaliação
  echo "⭐ Teste 6: Adicionar outra avaliação..."
  curl -s -X POST $API_URL/avaliacoes \
    -H "Content-Type: application/json" \
    -d "{
      \"id_filme\": \"$FILME_ID\",
      \"nota\": 10
    }" | json_pp
  echo ""
  echo ""
  
  # Teste 7: Listar avaliações do filme
  echo "📊 Teste 7: Listar avaliações do filme..."
  curl -s $API_URL/avaliacoes/$FILME_ID | json_pp
  echo ""
fi

echo ""
echo "✅ Testes concluídos!"
echo "======================================"
