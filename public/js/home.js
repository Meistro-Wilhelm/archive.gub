// ===== No theme toggle on home page — it uses GÜB corporate styling =====

// ===== Hidden Umlaut Trigger =====
const trigger = document.getElementById('umlaut-trigger');
const step1 = document.getElementById('auth-step1');
const step2 = document.getElementById('auth-step2');
const step3 = document.getElementById('auth-step3');

trigger.addEventListener('click', (e) => {
  e.stopPropagation();
  step1.classList.add('active');
  document.getElementById('code-input').focus();
});

// Close overlay if clicking outside the auth box
[step1, step2, step3].forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeAllAuth();
    }
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
}

// ===== Step 1: Personal Code =====
document.getElementById('code-submit').addEventListener('click', submitCode);
document.getElementById('code-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitCode();
});

async function submitCode() {
  const code = document.getElementById('code-input').value.trim();
  if (!code) return;

  const res = await fetch('/api/auth/code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  const data = await res.json();

  if (data.success) {
    step1.classList.remove('active');
    step2.classList.add('active');
    document.getElementById('passkey-input').focus();
  } else {
    const err = document.getElementById('code-error');
    err.style.display = 'block';
    setTimeout(() => {
      closeAllAuth();
    }, 1500);
  }
}

// ===== Step 2: Passkey =====
document.getElementById('passkey-submit').addEventListener('click', submitPasskey);
document.getElementById('passkey-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitPasskey();
});

async function submitPasskey() {
  const passkey = document.getElementById('passkey-input').value.trim();
  if (!passkey) return;

  const res = await fetch('/api/auth/passkey', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passkey })
  });
  const data = await res.json();

  if (data.success) {
    step2.classList.remove('active');
    await populateLevels();
    step3.classList.add('active');
  } else {
    const err = document.getElementById('passkey-error');
    err.style.display = 'block';
    setTimeout(() => {
      closeAllAuth();
    }, 1500);
  }
}

// ===== Populate Level Dropdown =====
async function populateLevels() {
  const res = await fetch('/api/auth/levels');
  const data = await res.json();
  const select = document.getElementById('level-select');

  select.innerHTML = '<option value="all">ALL AVAILABLE LEVELS</option>';

  data.levels.forEach(level => {
    const opt = document.createElement('option');
    opt.value = level.value;
    opt.textContent = level.label;
    select.appendChild(opt);
  });
}

// ===== Step 3: Level Selection =====
document.getElementById('level-submit').addEventListener('click', submitLevel);

async function submitLevel() {
  const level = document.getElementById('level-select').value;

  await fetch('/api/auth/select-level', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level })
  });

  window.location.href = '/dashboard';
}
