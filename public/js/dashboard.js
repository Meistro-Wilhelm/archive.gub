// ===== Theme Toggle =====
const themeSwitch = document.getElementById('theme-switch');
const savedTheme = localStorage.getItem('gub-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeSwitch.checked = savedTheme === 'dark';

themeSwitch.addEventListener('change', () => {
  const theme = themeSwitch.checked ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('gub-theme', theme);
});

// ===== Clearance Level Labels =====
const LEVEL_LABELS = {
  3: 'Level three (top secret)',
  6.7: 'Level 6.7',
  9: 'Level 9 (CLASSIFIED)',
  12: 'Level 12 (SECRET)',
  18: 'Level 18+ (LEVEL OMEGA - TOP SECRET)'
};

// ===== Check Session =====
async function checkSession() {
  const res = await fetch('/api/auth/session');
  const data = await res.json();
  if (!data.authenticated) {
    window.location.href = '/';
    return null;
  }
  return data;
}

// ===== Initialize =====
(async function init() {
  const session = await checkSession();
  if (!session) return;

  // Show user info
  document.getElementById('user-info').textContent = session.user.name;

  // Populate level filter
  const levelsRes = await fetch('/api/auth/levels');
  const levelsData = await levelsRes.json();
  const filterSelect = document.getElementById('level-filter');

  levelsData.levels.forEach(level => {
    const opt = document.createElement('option');
    opt.value = level.value;
    opt.textContent = level.label;
    filterSelect.appendChild(opt);
  });

  // Set filter to the session-selected level
  if (session.selectedLevel && session.selectedLevel !== 'all') {
    filterSelect.value = session.selectedLevel;
  }

  // Load documents
  loadDocuments();

  // Search handler
  let searchTimeout;
  document.getElementById('search-bar').addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(loadDocuments, 300);
  });

  // Level filter handler
  filterSelect.addEventListener('change', async () => {
    const level = filterSelect.value;
    await fetch('/api/auth/select-level', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level })
    });
    loadDocuments();
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  });
})();

// ===== Load and Render Documents =====
async function loadDocuments() {
  const search = document.getElementById('search-bar').value;
  const url = '/api/documents' + (search ? '?search=' + encodeURIComponent(search) : '');
  const res = await fetch(url);

  if (res.status === 401) {
    window.location.href = '/';
    return;
  }

  const data = await res.json();
  renderDocuments(data.documents);
}

function renderDocuments(documents) {
  const container = document.getElementById('doc-list-container');
  container.innerHTML = '';

  if (documents.length === 0) {
    container.innerHTML = '<div class="no-docs">No documents found.</div>';
    return;
  }

  // Group by clearance level
  const groups = {};
  documents.forEach(doc => {
    const key = doc.clearance;
    if (!groups[key]) groups[key] = [];
    groups[key].push(doc);
  });

  // Sort groups by clearance level
  const sortedKeys = Object.keys(groups).map(Number).sort((a, b) => a - b);

  sortedKeys.forEach(level => {
    const section = document.createElement('div');
    section.className = 'clearance-section';

    const header = document.createElement('div');
    header.className = 'clearance-section-header';
    header.textContent = LEVEL_LABELS[level] || ('Level ' + level);
    section.appendChild(header);

    const list = document.createElement('ul');
    list.className = 'doc-list';

    groups[level].forEach(doc => {
      const item = document.createElement('li');
      item.className = 'doc-item';
      item.addEventListener('click', () => {
        window.location.href = '/view/' + doc.id;
      });

      item.innerHTML = `
        <div class="doc-icon">DOC</div>
        <div class="doc-info">
          <div class="doc-title">${escapeHtml(doc.title)}</div>
          <div class="doc-summary">${escapeHtml(doc.summary)}</div>
        </div>
      `;

      list.appendChild(item);
    });

    section.appendChild(list);
    container.appendChild(section);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
