const themeSwitch = document.getElementById('theme-switch');
const savedTheme = localStorage.getItem('gub-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeSwitch.checked = savedTheme === 'dark';
themeSwitch.addEventListener('change', () => {
  const theme = themeSwitch.checked ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('gub-theme', theme);
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p' || e.key === 'S' || e.key === 'P')) {
    e.preventDefault();
  }
});

const user = gubGetSession();
if (!user) window.location.href = 'index.html';

if (user) {
  document.getElementById('user-info').textContent = user.name;

  const params = new URLSearchParams(window.location.search);
  const docId = params.get('id');

  if (!docId) {
    window.location.href = 'dashboard.html';
  } else {
    const doc = gubGetDocument(user, docId);
    if (!doc) {
      document.getElementById('doc-title').textContent = 'ACCESS DENIED';
      document.getElementById('doc-content').innerHTML = '<p>You do not have sufficient clearance to view this document.</p>';
    } else {
      document.title = 'ARCHIVE.GUB \u2014 ' + doc.title;
      document.getElementById('doc-title').textContent = doc.title;
      document.getElementById('doc-clearance').textContent = LEVEL_LABELS[doc.clearance] || ('Level ' + doc.clearance);
      document.getElementById('doc-date').textContent = doc.date;
      document.getElementById('doc-content').innerHTML = doc.content;
    }
  }

  document.getElementById('logout-btn').addEventListener('click', () => {
    gubLogout();
    window.location.href = 'index.html';
  });
}
