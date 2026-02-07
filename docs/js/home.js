const themeSwitch = document.getElementById('theme-switch');
const savedTheme = localStorage.getItem('gub-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeSwitch.checked = savedTheme === 'dark';
themeSwitch.addEventListener('change', () => {
  const theme = themeSwitch.checked ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('gub-theme', theme);
});

const trigger = document.getElementById('umlaut-trigger');
const step1 = document.getElementById('auth-step1');
const step2 = document.getElementById('auth-step2');
const step3 = document.getElementById('auth-step3');

trigger.addEventListener('click', (e) => {
  e.stopPropagation();
  step1.classList.add('active');
  document.getElementById('code-input').focus();
});

[step1, step2, step3].forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeAllAuth();
  });
});

function closeAllAuth() {
  step1.classList.remove('active');
  step2.classList.remove('active');
  step3.classList.remove('active');
  document.getElementById('code-input').value = '';
  document.getElementById('passkey-input').value = '';
  document.getElementById('code-error').style.display = 'none';
  document.getElementById('passkey-error').style.display = 'none';
  sessionStorage.removeItem('gub-pending-code');
}

document.getElementById('code-submit').addEventListener('click', submitCode);
document.getElementById('code-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitCode(); });

function submitCode() {
  const code = document.getElementById('code-input').value.trim();
  if (!code) return;
  const user = gubValidateCode(code);
  if (user) {
    sessionStorage.setItem('gub-pending-code', code);
    step1.classList.remove('active');
    step2.classList.add('active');
    document.getElementById('passkey-input').focus();
  } else {
    document.getElementById('code-error').style.display = 'block';
    setTimeout(() => closeAllAuth(), 1500);
  }
}

document.getElementById('passkey-submit').addEventListener('click', submitPasskey);
document.getElementById('passkey-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitPasskey(); });

function submitPasskey() {
  const passkey = document.getElementById('passkey-input').value.trim();
  if (!passkey) return;
  const pendingCode = sessionStorage.getItem('gub-pending-code');
  if (!pendingCode) { closeAllAuth(); return; }
  const user = gubValidatePasskey(pendingCode, passkey);
  if (user) {
    gubSaveSession({ id: user.id, name: user.name, clearance: user.clearance, has67: user.has67 || false });
    sessionStorage.removeItem('gub-pending-code');
    const levels = gubGetAvailableLevels(user);
    const select = document.getElementById('level-select');
    select.innerHTML = '<option value="all">ALL AVAILABLE LEVELS</option>';
    levels.forEach(level => {
      const opt = document.createElement('option');
      opt.value = level.value;
      opt.textContent = level.label;
      select.appendChild(opt);
    });
    step2.classList.remove('active');
    step3.classList.add('active');
  } else {
    document.getElementById('passkey-error').style.display = 'block';
    setTimeout(() => closeAllAuth(), 1500);
  }
}

document.getElementById('level-submit').addEventListener('click', () => {
  gubSetSelectedLevel(document.getElementById('level-select').value);
  window.location.href = 'dashboard.html';
});
