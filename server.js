const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'gub-archive-session-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));

app.use(express.static(path.join(__dirname, 'public')));

function loadJSON(filename) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'data', filename), 'utf8'));
}

// --- Auth Routes ---

// Step 1: Validate personal code (password)
app.post('/api/auth/code', (req, res) => {
  const { code } = req.body;
  const users = loadJSON('users.json');
  const user = users.find(u => u.code === code);
  if (!user) {
    return res.json({ success: false });
  }
  req.session.pendingCode = code;
  res.json({ success: true });
});

// Step 2: Validate passkey (username)
app.post('/api/auth/passkey', (req, res) => {
  const { passkey } = req.body;
  const users = loadJSON('users.json');
  const pendingCode = req.session.pendingCode;
  if (!pendingCode) {
    return res.json({ success: false });
  }
  const user = users.find(u => u.code === pendingCode && u.passkey === passkey);
  if (!user) {
    req.session.pendingCode = null;
    return res.json({ success: false });
  }
  req.session.user = {
    id: user.id,
    name: user.name,
    clearance: user.clearance,
    has67: user.has67 || false
  };
  req.session.pendingCode = null;
  res.json({
    success: true,
    clearance: user.clearance,
    has67: user.has67 || false
  });
});

// Get available levels for the authenticated user
app.get('/api/auth/levels', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const user = req.session.user;
  const allLevels = [
    { value: 3, label: 'Level three (top secret)' },
    { value: 6.7, label: 'Level 6.7' },
    { value: 9, label: 'Level 9 (CLASSIFIED)' },
    { value: 12, label: 'Level 12 (SECRET)' },
    { value: 18, label: 'Level 18+ (LEVEL OMEGA - TOP SECRET)' }
  ];

  const available = allLevels.filter(level => {
    if (level.value === 6.7) {
      return user.has67 || user.clearance >= 18;
    }
    return user.clearance >= level.value;
  });

  res.json({ levels: available });
});

// Select clearance level to view
app.post('/api/auth/select-level', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { level } = req.body; // "all" or a specific number
  req.session.selectedLevel = level;
  res.json({ success: true });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Check session
app.get('/api/auth/session', (req, res) => {
  if (req.session.user) {
    res.json({
      authenticated: true,
      user: req.session.user,
      selectedLevel: req.session.selectedLevel
    });
  } else {
    res.json({ authenticated: false });
  }
});

// --- Document Routes ---

app.get('/api/documents', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const user = req.session.user;
  const selectedLevel = req.session.selectedLevel;
  const documents = loadJSON('documents.json');
  const search = (req.query.search || '').toLowerCase();

  let filtered = documents.filter(doc => {
    // Check clearance access
    if (doc.clearance === 6.7) {
      if (!user.has67 && user.clearance < 18) return false;
    } else {
      if (user.clearance < doc.clearance) return false;
    }

    // Filter by selected level
    if (selectedLevel && selectedLevel !== 'all') {
      const sel = parseFloat(selectedLevel);
      if (doc.clearance !== sel) return false;
    }

    // Search filter
    if (search) {
      return doc.title.toLowerCase().includes(search) ||
             doc.summary.toLowerCase().includes(search);
    }
    return true;
  });

  // Sort by clearance level ascending
  filtered.sort((a, b) => a.clearance - b.clearance);

  // Strip content from list view
  const list = filtered.map(({ id, title, summary, clearance, date }) => ({
    id, title, summary, clearance, date
  }));

  res.json({ documents: list });
});

app.get('/api/documents/:id', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const user = req.session.user;
  const documents = loadJSON('documents.json');
  const doc = documents.find(d => d.id === req.params.id);

  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Check clearance
  if (doc.clearance === 6.7) {
    if (!user.has67 && user.clearance < 18) {
      return res.status(403).json({ error: 'Insufficient clearance' });
    }
  } else if (user.clearance < doc.clearance) {
    return res.status(403).json({ error: 'Insufficient clearance' });
  }

  res.json({ document: doc });
});

// --- Serve SPA pages ---
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/view/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewer.html'));
});

app.get('/co-direktor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'co-direktor.html'));
});

app.listen(PORT, () => {
  console.log(`ARCHIVE.GUB running on http://localhost:${PORT}`);
});
