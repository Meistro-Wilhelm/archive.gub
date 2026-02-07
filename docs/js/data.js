// ===== Embedded Data (static deployment) =====

const GUB_USERS = [
  { id: "user-001", name: "Agent Alpha", code: "GUB-7741", passkey: "ALPHA-001", clearance: 18, has67: true },
  { id: "user-002", name: "Agent Bravo", code: "GUB-3382", passkey: "BRAVO-002", clearance: 12, has67: false },
  { id: "user-003", name: "Agent Charlie", code: "GUB-9953", passkey: "CHARLIE-003", clearance: 9, has67: true },
  { id: "user-004", name: "Agent Delta", code: "GUB-2204", passkey: "DELTA-004", clearance: 3, has67: false },
  { id: "user-005", name: "Agent Echo", code: "GUB-5510", passkey: "ECHO-005", clearance: 9, has67: false }
];

const GUB_DOCUMENTS = [
  { id: "doc-001", title: "G\u00dcB Operational Overview", summary: "General overview of G\u00dcB operations and organizational structure.", clearance: 3, date: "2026-01-15", content: "<h2>G\u00dcB Operational Overview</h2><p>This document provides a general overview of G\u00dcB operations, covering organizational structure, mission directives, and standard operating procedures.</p><p>All personnel are expected to familiarize themselves with this document upon onboarding.</p>" },
  { id: "doc-002", title: "Field Protocol Manual", summary: "Standard field protocols for Level three operatives.", clearance: 3, date: "2026-01-20", content: "<h2>Field Protocol Manual</h2><p>This manual outlines the standard field protocols to be followed during all authorized operations. Deviations require written authorization from a Level 9 or higher officer.</p>" },
  { id: "doc-003", title: "Designation 6.7 \u2014 Special Access Materials", summary: "Materials restricted to personnel with Authorization Level 6.7.", clearance: 6.7, date: "2026-01-22", content: "<h2>Designation 6.7 \u2014 Special Access Materials</h2><p>This document contains materials classified under the special 6.7 designation. Access is restricted to personnel with explicit Authorization Level 6.7 or Authorization Level 18+.</p><p>Contents of this file are compartmentalized and must not be discussed outside of authorized channels.</p>" },
  { id: "doc-004", title: "Intelligence Summary \u2014 Q1 2026", summary: "Quarterly intelligence summary. CLASSIFIED.", clearance: 9, date: "2026-02-01", content: "<h2>Intelligence Summary \u2014 Q1 2026</h2><p>CLASSIFIED \u2014 This quarterly intelligence summary covers key developments, threat assessments, and operational intelligence gathered during Q1 2026.</p><p>Distribution is limited to Level 9 (CLASSIFIED) personnel and above.</p>" },
  { id: "doc-005", title: "Threat Assessment Matrix", summary: "Current threat assessment matrix for active operations.", clearance: 9, date: "2026-02-03", content: "<h2>Threat Assessment Matrix</h2><p>CLASSIFIED \u2014 This document provides the current threat assessment matrix used to evaluate risk across all active G\u00dcB operations.</p>" },
  { id: "doc-006", title: "Project SABLE \u2014 Mission Brief", summary: "SECRET mission briefing for Project SABLE.", clearance: 12, date: "2026-02-04", content: "<h2>Project SABLE \u2014 Mission Brief</h2><p>SECRET \u2014 This mission brief details the objectives, personnel assignments, and operational parameters for Project SABLE.</p><p>Unauthorized disclosure will result in immediate clearance revocation.</p>" },
  { id: "doc-007", title: "Asset Registry \u2014 Active", summary: "SECRET registry of currently active assets.", clearance: 12, date: "2026-02-05", content: "<h2>Asset Registry \u2014 Active</h2><p>SECRET \u2014 Complete registry of all currently active assets under G\u00dcB jurisdiction. Includes handler assignments and operational status.</p>" },
  { id: "doc-008", title: "OMEGA Directive", summary: "LEVEL OMEGA \u2014 Top-level directive document.", clearance: 18, date: "2026-02-06", content: "<h2>OMEGA Directive</h2><p>LEVEL OMEGA \u2014 This document contains the highest-level directives governing G\u00dcB operations. Access is restricted to personnel with Level 18+ (LEVEL OMEGA) clearance.</p><p>The contents of this directive supersede all prior operational mandates.</p>" }
];

const LEVEL_LABELS = {
  3: "Level three (top secret)",
  6.7: "Level 6.7",
  9: "Level 9 (CLASSIFIED)",
  12: "Level 12 (SECRET)",
  18: "Level 18+ (LEVEL OMEGA - TOP SECRET)"
};

const ALL_LEVELS = [
  { value: 3, label: "Level three (top secret)" },
  { value: 6.7, label: "Level 6.7" },
  { value: 9, label: "Level 9 (CLASSIFIED)" },
  { value: 12, label: "Level 12 (SECRET)" },
  { value: 18, label: "Level 18+ (LEVEL OMEGA - TOP SECRET)" }
];

function gubValidateCode(code) {
  return GUB_USERS.find(u => u.code === code) || null;
}

function gubValidatePasskey(code, passkey) {
  return GUB_USERS.find(u => u.code === code && u.passkey === passkey) || null;
}

function gubGetAvailableLevels(user) {
  return ALL_LEVELS.filter(level => {
    if (level.value === 6.7) return user.has67 || user.clearance >= 18;
    return user.clearance >= level.value;
  });
}

function gubGetDocuments(user, selectedLevel, search) {
  search = (search || '').toLowerCase();
  let filtered = GUB_DOCUMENTS.filter(doc => {
    if (doc.clearance === 6.7) {
      if (!user.has67 && user.clearance < 18) return false;
    } else {
      if (user.clearance < doc.clearance) return false;
    }
    if (selectedLevel && selectedLevel !== 'all') {
      if (doc.clearance !== parseFloat(selectedLevel)) return false;
    }
    if (search) {
      return doc.title.toLowerCase().includes(search) || doc.summary.toLowerCase().includes(search);
    }
    return true;
  });
  filtered.sort((a, b) => a.clearance - b.clearance);
  return filtered;
}

function gubGetDocument(user, docId) {
  const doc = GUB_DOCUMENTS.find(d => d.id === docId);
  if (!doc) return null;
  if (doc.clearance === 6.7) {
    if (!user.has67 && user.clearance < 18) return null;
  } else if (user.clearance < doc.clearance) return null;
  return doc;
}

function gubSaveSession(user) { sessionStorage.setItem('gub-user', JSON.stringify(user)); }
function gubGetSession() { const r = sessionStorage.getItem('gub-user'); return r ? JSON.parse(r) : null; }
function gubSetSelectedLevel(level) { sessionStorage.setItem('gub-level', level); }
function gubGetSelectedLevel() { return sessionStorage.getItem('gub-level') || 'all'; }
function gubLogout() { sessionStorage.removeItem('gub-user'); sessionStorage.removeItem('gub-level'); sessionStorage.removeItem('gub-pending-code'); }
