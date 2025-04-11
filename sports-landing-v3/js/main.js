import { getMatches, getStats, getTeamImage, getArticles,handler } from './api.js';

const matchesContainer = document.getElementById('matches');
const navItems = document.querySelectorAll('#sportsNav li');
const filterButtons = document.querySelectorAll('#filters button');
const title = document.getElementById('titulo-deporte');
const articlesContainer = document.getElementById('articles');

let currentSport = 'football';
let allMatches = [];
let currentPage = 1;
const matchesPerPage = 10;
const maxVisiblePages = 10; 
let paginationBlock = 0;    
const paginationContainer = document.getElementById('pagination'); 


navItems.forEach(item => {
  item.addEventListener('click', () => {
    navItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    currentSport = item.getAttribute('data-sport');
    title.textContent = `Eventos de ${item.textContent.trim()} Hoy`;
    loadMatches(currentSport);
  });
});

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderMatches(btn.dataset.filter);
  });
});

async function loadMatches(sport) {
  matchesContainer.innerHTML = 'Cargando eventos...';
  try {
    const matches = await getMatches(sport);
    allMatches = matches || [];
    renderMatches('all');
  } catch (error) {
    console.error(error);
    matchesContainer.innerHTML = '<p>Error al cargar eventos.</p>';
  }
}

// function renderMatches(filter) {
//   matchesContainer.innerHTML = '';
//   let filtered = allMatches;

//   if (filter !== 'all') {
//     filtered = allMatches.filter(m => m.status?.type === filter);
//   }

//   if (filtered.length === 0) {
//     matchesContainer.innerHTML = '<p>No hay eventos para mostrar.</p>';
//     return;
//   }

//   filtered.forEach(match => {
//     const div = document.createElement('div');
//     div.classList.add('match');

//     const homeImg = getTeamImage(match.homeTeam.id);
//     const awayImg = getTeamImage(match.awayTeam.id);

//     const scoreText = match.status?.type === "inprogress" || match.status?.type === "finished"
//       ? ` (${match.homeScore.current} - ${match.awayScore.current})` : '';

//     div.innerHTML = `
//       <div class="league"><strong>${match.tournament.name}</strong></div>
//       <div class="teams">
//         <div class="team"><img src="${homeImg}" alt="home">${match.homeTeam.name}</div>
//         <span>vs</span>
//         <div class="team"><img src="${awayImg}" alt="away">${match.awayTeam.name}</div>
//       </div>
//       <div>🕒 ${new Date(match.startTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${scoreText}</div>
//       <div class="details-card" id="details-${match.id}">Cargando detalles...</div>
//     `;

//     div.addEventListener('click', () => toggleDetails(match.id));
//     matchesContainer.appendChild(div);
//   });
// }
function renderMatches(filter) {
  matchesContainer.innerHTML = '';
  let filtered = allMatches;

  if (filter !== 'all') {
    filtered = allMatches.filter(m => m.status?.type === filter);
  }

  if (filtered.length === 0) {
    matchesContainer.innerHTML = '<p>No hay eventos para mostrar.</p>';
    return;
  }

  const start = (currentPage - 1) * matchesPerPage;
  const end = start + matchesPerPage;
  const paginated = filtered.slice(start, end);

  paginated.forEach(match => {
    const div = document.createElement('div');
    div.classList.add('match');

    const homeImg = getTeamImage(match.homeTeam.id);
    const awayImg = getTeamImage(match.awayTeam.id);

    const scoreText = match.status?.type === "inprogress" || match.status?.type === "finished"
      ? ` (${match.homeScore.current} - ${match.awayScore.current})` : '';

    div.innerHTML = `
      <div class="league"><strong>${match.tournament.name}</strong></div>
      <div class="teams">
        <div class="team"><img src="${homeImg}" alt="home">${match.homeTeam.name}</div>
        <span class="vs" style="font-size:55px;  font-family: 'Kanit', sans-serif; color: #3b00d8; ">vs</span>
        <div class="team"><img src="${awayImg}" alt="away">${match.awayTeam.name}</div>
      </div>
      <div>🕒 ${new Date(match.startTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${scoreText}</div>
      <div class="details-card" id="details-${match.id}">Cargando detalles...</div>
    `;

    div.addEventListener('click', () => toggleDetails(match.id));
    matchesContainer.appendChild(div);
  });

  renderPagination(filtered.length);
}


function renderPagination(totalItems) {
  paginationContainer.innerHTML = '';

  const totalPages = Math.ceil(totalItems / matchesPerPage);
  if (totalPages <= 1) return;

  const startPage = paginationBlock * maxVisiblePages + 1;
  const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

  // Botón Anterior del bloque
  if (paginationBlock > 0) {
    const blockPrev = document.createElement('button');
    blockPrev.textContent = '◀';
    blockPrev.onclick = () => {
      paginationBlock--;
      renderPagination(totalItems);
    };
    paginationContainer.appendChild(blockPrev);
  }

  // Botones de páginas
  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active');
    btn.onclick = () => {
      currentPage = i;
      renderMatches(document.querySelector('#filters .active')?.dataset.filter || 'all');
    };
    paginationContainer.appendChild(btn);
  }

  // Botón Siguiente del bloque
  if (endPage < totalPages) {
    const blockNext = document.createElement('button');
    blockNext.textContent = '▶';
    blockNext.onclick = () => {
      paginationBlock++;
      renderPagination(totalItems);
    };
    paginationContainer.appendChild(blockNext);
  }
}


async function toggleDetails(id) {
  const detailDiv = document.getElementById(`details-${id}`);
  const isVisible = detailDiv.style.display === 'block';

  if (isVisible) {
    detailDiv.style.display = 'none';
    return;
  }

  detailDiv.style.display = 'block';
  detailDiv.innerHTML = 'Cargando detalles...';

  try {
    const stats = await getStats(id);
    detailDiv.innerHTML = '';

    stats.forEach(group => {
      group.groups.forEach(statGroup => {
        statGroup.statisticsItems.forEach(item => {
          const line = document.createElement('div');
          line.innerHTML = `<strong>${item.name}</strong>: ${item.homeValue} - ${item.awayValue}`;
          detailDiv.appendChild(line);
        });
      });
    });
  } catch (err) {
    detailDiv.innerHTML = 'No se pudieron cargar estadísticas.';
  }
}


async function loadArticles() {
  try {
    const articles = await getArticles();
    articles.forEach(post => {
      const article = document.createElement('div');
      article.classList.add('article');

      const image = post.yoast_head_json?.og_image?.[0]?.url || 'https://via.placeholder.com/300';

      const link = post.link;
      const urlParts = link.split('/');
      const slug = urlParts.filter(Boolean).pop(); // Extrae el slug del link

      article.innerHTML = `
        <img src="${image}" alt="Articulo">
        <h4>${post.title.rendered}</h4>
        <button onclick="loadArticleBySlug('${slug}')">Leer más</button>
      `;

      articlesContainer.appendChild(article);
    });
  } catch (err) {
    console.error('Error al cargar artículos:', err);
    articlesContainer.innerHTML = 'No se pudieron cargar artículos.';
  }
}
async function loadArticleBySlug(slug) {
  try {
    const res = await fetch(`https://blog.juegaenlinea.com/wp-json/wp/v2/posts?slug=${slug}`);
    const data = await res.json();

    if (data.length > 0) {
      const article = data[0];
      document.getElementById('modal-article-title').innerText = article.title.rendered;
      document.getElementById('modal-article-body').innerHTML = article.content.rendered;
      document.getElementById('article-modal').classList.remove('hidden');
    } else {
      alert("Artículo no encontrado.");
    }
  } catch (e) {
    console.error("Error al cargar el artículo por slug:", e);
    alert("Error al cargar el artículo.");
  }
}

let currentIndex = 0;

function moveCarousel(direction) {
  const track = document.querySelector('.carousel-track');
  const totalSlides = track.children.length;

  currentIndex += direction;

  if (currentIndex < 0) currentIndex = totalSlides - 1;
  if (currentIndex >= totalSlides) currentIndex = 0;

  track.style.transform = `translateX(-${currentIndex * 100}%)`;
}
function setupSubscriptionForm() {
  const form = document.getElementById("subscriptionForm");
  const messageDiv = document.getElementById("formMessage");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = "¡Gracias por suscribirte!";
        form.reset();
      } else {
        messageDiv.textContent = `Error: ${result.message}`;
      }
    } catch (err) {
      console.error("Error en suscripción:", err);
      messageDiv.textContent = "Error al conectar con el servidor";
    }
  });
}

// Opcional: autoplay
setInterval(() => moveCarousel(1), 5000);
loadMatches(currentSport);
loadArticles();
window.loadArticleBySlug = loadArticleBySlug;
setupSubscriptionForm(handler);