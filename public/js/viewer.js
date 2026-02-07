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
  18: 'Level 18+ (LEVEL OMEGA)'
};

// ===== Disable keyboard shortcuts for save/print =====
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p' || e.key === 'S' || e.key === 'P')) {
    e.preventDefault();
  }
});

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

// ===== Load Document =====
(async function init() {
  const session = await checkSession();
  if (!session) return;

  document.getElementById('user-info').textContent = session.user.name;

  // Get document ID from URL
  const pathParts = window.location.pathname.split('/');
  const docId = pathParts[pathParts.length - 1];

  const res = await fetch('/api/documents/' + docId);

  if (res.status === 401) {
    window.location.href = '/';
    return;
  }

  if (res.status === 403 || res.status === 404) {
    document.getElementById('doc-title').textContent = 'ACCESS DENIED';
    document.getElementById('doc-content').innerHTML = '<p>You do not have sufficient clearance to view this document.</p>';
    return;
  }

  const data = await res.json();
  const doc = data.document;

  document.title = 'ARCHIVE.GUB — ' + doc.title;
  document.getElementById('doc-title').textContent = doc.title;
  document.getElementById('doc-clearance').textContent = LEVEL_LABELS[doc.clearance] || ('Level ' + doc.clearance);
  document.getElementById('doc-date').textContent = doc.date;
  document.getElementById('doc-content').innerHTML = doc.content;

  // Logout
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  });
})();
