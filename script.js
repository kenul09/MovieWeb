"use strict";

const API_KEY = "a407a7b3"; // sənin key
const BASE_URL = "https://www.omdbapi.com/";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const gridEl = document.getElementById("grid");

let debounceId = null;

function setStatus(msg = "") {
  statusEl.textContent = msg;
}

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, (ch) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return map[ch];
  });
}

function hideResults() {
  resultsEl.classList.add("hidden");
  gridEl.innerHTML = "";
}

function showResults() {
  resultsEl.classList.remove("hidden");
}

function showLoading() {
  gridEl.innerHTML = `<p class="muted">Loading...</p>`;
}

function renderMovies(movies) {
  if (!movies.length) {
    gridEl.innerHTML = `<p class="muted">Nəticə tapılmadı.</p>`;
    return;
  }

  gridEl.innerHTML = movies
    .map((m) => {
      const title = escapeHTML(m.Title || "");
      const year = escapeHTML(m.Year || "");
      const type = escapeHTML(m.Type || "");
      const poster =
        m.Poster && m.Poster !== "N/A"
          ? `<img class="poster" src="${escapeHTML(m.Poster)}" alt="${title} poster" />`
          : `<div class="poster" aria-label="No poster"></div>`;

      return `
        <article class="movie">
          ${poster}
          <div>
            <h3 class="movie__title">${title}</h3>
            <p class="movie__meta">İl: ${year || "-"}</p>
            <span class="badge">${type || "movie"}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

async function fetchMovies(query) {
  const q = query.trim();

  if (!q) {
    setStatus("");
    hideResults();
    return;
  }

  setStatus("Yüklənir...");
  showResults();
  showLoading();

  try {
    const url =
      `${BASE_URL}?apikey=${encodeURIComponent(API_KEY)}` +
      `&s=${encodeURIComponent(q)}` +
      `&type=movie&page=1`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

    const data = await res.json();

    if (data.Response === "False") {
      renderMovies([]);
      setStatus(data.Error || "Nəticə tapılmadı.");
      return;
    }

    const movies = Array.isArray(data.Search) ? data.Search : [];
    renderMovies(movies);
    setStatus(`${movies.length} nəticə`);
  } catch (err) {
    console.error(err);
    renderMovies([]);
    setStatus("Xəta oldu. API key və interneti yoxla.");
  }
}

/* Yazdıqca axtarış (debounce) */
function debouncedSearch() {
  clearTimeout(debounceId);
  debounceId = setTimeout(() => {
    fetchMovies(searchInput.value);
  }, 450); // 450ms gözləyir, sonra axtarır
}

/* Events */
searchInput.addEventListener("input", debouncedSearch);

searchBtn.addEventListener("click", () => {
  fetchMovies(searchInput.value);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") fetchMovies(searchInput.value);
});

/* Start: yalnız search görünsün */
hideResults();
setStatus("");
