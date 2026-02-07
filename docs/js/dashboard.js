const themeSwitch = document.getElementById('theme-switch');
const savedTheme = localStorage.getItem('gub-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeSwitch.checked = savedTheme === 'dark';
themeSwitch.addEventListener('change', () => {
  const theme = themeSwitch.checked ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('gub-theme', theme);
});

const user = gubGetSession();
if (!user) window.location.href = 'index.html';

if (user) {
  document.getElementById('user-info').textContent = user.name;

  const levels = gubGetAvailableLevels(user);
  const filterSelect = document.getElementById('level-filter');
  levels.forEach(level => {
    const opt = document.createElement('option');
    opt.value = level.value;
    opt.textContent = level.label;
    filterSelect.appendChild(opt);
  });

  const selectedLevel = gubGetSelectedLevel();
  if (selectedLevel && selectedLevel !== 'all') filterSelect.value = selectedLevel;

  loadDocuments();

  let searchTimeout;
  document.getElementById('search-bar').addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(loadDocuments, 300);
  });

  filterSelect.addEventListener('change', () => {
    gubSetSelectedLevel(filterSelect.value);
    loadDocuments();
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    gubLogout();
    window.location.href = 'index.html';
  });
}

function loadDocuments() {
  const search = document.getElementById('search-bar').value;
  const selectedLevel = gubGetSelectedLevel();
  renderDocuments(gubGetDocuments(user, selectedLevel, search));
}

function renderDocuments(documents) {
  const container = document.getElementById('doc-list-container');
  container.innerHTML = '';

  if (documents.length === 0) {
    container.innerHTML = '<div class="no-docs">No documents found.</div>';
    return;
  }

  const groups = {};
  documents.forEach(doc => {
    if (!groups[doc.clearance]) groups[doc.clearance] = [];
    groups[doc.clearance].push(doc);
  });

  Object.keys(groups).map(Number).sort((a, b) => a - b).forEach(level => {
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
      item.addEventListener('click', () => { window.location.href = 'viewer.html?id=' + doc.id; });
      item.innerHTML = '<div class="doc-icon">DOC</div><div class="doc-info"><div class="doc-title">' + escapeHtml(doc.title) + '</div><div class="doc-summary">' + escapeHtml(doc.summary) + '</div></div><div class="doc-date">' + doc.date + '</div>';
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
