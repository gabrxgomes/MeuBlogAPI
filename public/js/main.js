document.addEventListener('DOMContentLoaded', function () {
  let allPosts = [];

  // Carregar os posts quando a página for carregada
  fetch('/api/posts')
    .then(response => response.json())
    .then(data => {
      allPosts = data;
      displayPosts(allPosts);
    });

  // Exibir posts na tela
  function displayPosts(posts) {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = ''; // Limpar posts anteriores

    posts.forEach(post => {
      const postElement = document.createElement('div');
      postElement.className = 'col-md-4';

      const postImage = post.image ? `<img src="${post.image}" class="img-fluid mb-3" alt="Imagem da Postagem">` : '';
      const postDate = post.date ? `<small class="text-muted">Publicado em: ${post.date}</small>` : '';

      postElement.innerHTML = `
        <div class="card mb-4 shadow-sm">
          ${postImage}
          <div class="card-body">
            <h5 class="card-title">${post.title}</h5>
            <p class="card-text">${post.content.substring(0, 100)}...</p> <!-- Exibir apenas parte do conteúdo -->
            ${postDate}
            <a href="posts/${post.slug}.html" class="btn btn-primary mt-3">Ler mais</a>
          </div>
        </div>
      `;
      
      postsContainer.appendChild(postElement);
    });
  }

  // Função para busca
  window.searchPosts = function() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredPosts = allPosts.filter(post => {
      const titleMatch = post.title.toLowerCase().includes(searchTerm);
      const dateMatch = post.date && post.date.toLowerCase().includes(searchTerm);
      return titleMatch || dateMatch;
    });

    displayPosts(filteredPosts);
  };

  // Função para visualizar a postagem completa
  window.viewPost = function(index) {
    const selectedPost = allPosts[index];
    localStorage.setItem('selectedPost', JSON.stringify(selectedPost)); // Armazenar a postagem selecionada
    window.location.href = 'post.html'; // Redirecionar para a página de leitura
  };
});
