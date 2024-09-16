const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json()); // Para permitir o uso de JSON no corpo das requisições

// Função para gerar um slug a partir do título
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .trim();
}

// Rota para carregar a página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Rota para a página de administração (admin/index.html)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin/index.html'));
});

// Rota para obter todas as postagens (GET /api/posts)
app.get('/api/posts', (req, res) => {
  const postsFilePath = path.join(__dirname, '../data/posts.json');
  
  fs.readFile(postsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo de postagens:', err);
      return res.status(500).json({ error: 'Erro ao carregar as postagens.' });
    }
    
    const posts = JSON.parse(data);
    res.json(posts);
  });
});

// Rota para criar uma nova postagem (POST /api/posts)
app.post('/api/posts', (req, res) => {
  const { title, content, image } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Título e conteúdo são obrigatórios.' });
  }

  const postsFilePath = path.join(__dirname, '../data/posts.json');
  const slug = generateSlug(title); // Gerar o slug

  // Ler o arquivo JSON existente e adicionar uma nova postagem
  fs.readFile(postsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo de postagens:', err);
      return res.status(500).json({ error: 'Erro ao salvar a postagem.' });
    }

    const posts = JSON.parse(data);
    const newPost = { 
      title, 
      content, 
      image, 
      slug,  // Adicionar o slug ao objeto de postagem
      date: new Date().toISOString().split('T')[0]  // Adicionar a data de postagem
    };
    posts.push(newPost);

    fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), err => {
      if (err) {
        console.error('Erro ao salvar o arquivo de postagens:', err);
        return res.status(500).json({ error: 'Erro ao salvar a postagem.' });
      }

      res.json({ message: 'Postagem publicada com sucesso!' });
    });
  });
});

// Rota para obter uma postagem pelo slug (GET /api/posts/:slug)
app.get('/api/posts/:slug', (req, res) => {
  const slug = req.params.slug;
  const postsFilePath = path.join(__dirname, '../data/posts.json');

  fs.readFile(postsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo de postagens:', err);
      return res.status(500).json({ error: 'Erro ao carregar as postagens.' });
    }

    const posts = JSON.parse(data);
    const post = posts.find(post => post.slug === slug);

    if (!post) {
      return res.status(404).json({ error: 'Postagem não encontrada.' });
    }

    res.json(post);
  });
});

// Rota para excluir uma postagem existente (DELETE /api/posts/:id)
app.delete('/api/posts/:id', (req, res) => {
  const postId = req.params.id;

  const postsFilePath = path.join(__dirname, '../data/posts.json');

  // Ler o arquivo JSON existente e excluir a postagem
  fs.readFile(postsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo de postagens:', err);
      return res.status(500).json({ error: 'Erro ao excluir a postagem.' });
    }

    const posts = JSON.parse(data);
    if (!posts[postId]) {
      return res.status(404).json({ error: 'Postagem não encontrada.' });
    }

    posts.splice(postId, 1); // Remover a postagem pelo índice

    fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), err => {
      if (err) {
        console.error('Erro ao salvar o arquivo de postagens:', err);
        return res.status(500).json({ error: 'Erro ao excluir a postagem.' });
      }

      res.json({ message: 'Postagem excluída com sucesso!' });
    });
  });
});

// Rota para servir o arquivo genérico de postagens (posts.html)
app.get('/posts/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/posts.html'));
});

// Iniciar o servidor na porta especificada
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
