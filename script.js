// ========================================
//  BREACHED.REPORT — script.js
//  Handles: breach data, rendering, filters,
//  email check, admin submit, ticker
// ========================================

// ---- Default breach data ----
// Add or edit entries here directly, or use the Submit form on the page.
// Each entry: { id, name, org, date, records, severity, category, dataTypes[], description, source }

const DEFAULT_BREACHES = [
  {
    id: 1,
    name: "GTA Online Money Exploit",
    org: "Rockstar Games",
    date: "2023-07-15",
    records: "Millions of accounts",
    severity: "high",
    category: "gaming",
    dataTypes: ["In-game Currency", "Account Balances", "Player Profiles"],
    description: "A remote code execution exploit allowed modders to drop billions of in-game GTA dollars into other players' accounts, triggering Rockstar's anti-cheat bans on innocent users. The bug was publicly known for weeks before a patch was issued.",
    source: "https://www.rockstargames.com/newswire"
  },
  {
    id: 2,
    name: "RockYou2024 Password Leak",
    org: "Various",
    date: "2024-07-04",
    records: "9,948,575,739",
    severity: "critical",
    category: "other",
    dataTypes: ["Passwords", "Usernames", "Emails"],
    description: "Nearly 10 billion unique plaintext passwords were published to a hacking forum — the largest password compilation ever leaked publicly. Compiled from past breaches and new data, it poses a massive credential stuffing risk.",
    source: "https://cybernews.com"
  },
  {
    id: 3,
    name: "AT&T Full Customer Data Dump",
    org: "AT&T",
    date: "2024-07-12",
    records: "109,000,000",
    severity: "critical",
    category: "tech",
    dataTypes: ["Phone Numbers", "Call Records", "SMS Metadata", "Cell Tower Data"],
    description: "AT&T confirmed that call and text records for nearly all customers were illegally downloaded from a third-party cloud platform. The data covered a 6-month period and included numbers of non-AT&T customers who communicated with AT&T users.",
    source: "https://about.att.com"
  },
  {
    id: 4,
    name: "Ticketmaster Live Nation Breach",
    org: "Ticketmaster / Live Nation",
    date: "2024-05-20",
    records: "560,000,000",
    severity: "critical",
    category: "financial",
    dataTypes: ["Full Names", "Emails", "Phone Numbers", "Partial Card Data", "Order History"],
    description: "ShinyHunters hacking group claimed to have stolen 1.3TB of data from Ticketmaster's Snowflake cloud instance. The dataset included personal and payment info for over half a billion customers and was offered for sale at $500,000.",
    source: "https://www.bleepingcomputer.com"
  },
  {
    id: 5,
    name: "Change Healthcare Ransomware Attack",
    org: "Change Healthcare / UnitedHealth",
    date: "2024-02-21",
    records: "190,000,000",
    severity: "critical",
    category: "healthcare",
    dataTypes: ["Medical Records", "Insurance Info", "Social Security Numbers", "Payment Data"],
    description: "The largest healthcare data breach in US history. ALPHV/BlackCat ransomware group crippled prescription processing across the US. Patient records from nearly a third of Americans were exfiltrated, and the company paid a $22M ransom.",
    source: "https://www.hhs.gov"
  },
  {
    id: 6,
    name: "Twitch Source Code & Payout Leak",
    org: "Twitch",
    date: "2021-10-06",
    records: "125GB of data",
    severity: "high",
    category: "tech",
    dataTypes: ["Streamer Earnings", "Source Code", "Internal Tools", "Creator Payouts"],
    description: "An anonymous user posted Twitch's entire source code, creator payout figures (top streamers earning millions), and unreleased game projects to 4chan. The leak was caused by a misconfigured server and exposed 3 years of creator payouts.",
    source: "https://blog.twitch.tv"
  },
  {
    id: 7,
    name: "Roblox Game Developer Data Leak",
    org: "Roblox",
    date: "2023-12-14",
    records: "4,000+ developers",
    severity: "medium",
    category: "gaming",
    dataTypes: ["Emails", "IP Addresses", "Usernames", "Date of Birth"],
    description: "Personal data belonging to Roblox developer conference attendees was leaked online. The data came from registration forms submitted between 2017 and 2020, exposing contact info and metadata of thousands of developers and creators.",
    source: "https://www.bleepingcomputer.com"
  },
  {
    id: 8,
    name: "National Public Data Breach",
    org: "National Public Data",
    date: "2024-08-13",
    records: "2,900,000,000",
    severity: "critical",
    category: "government",
    dataTypes: ["Social Security Numbers", "Full Names", "Addresses", "Phone Numbers", "Relatives"],
    description: "A background check company leaked nearly 3 billion records in what may be the most comprehensive identity data dump ever. The data included SSNs, addresses going back decades, and family member links — enabling mass identity fraud.",
    source: "https://www.malwarebytes.com"
  },
  {
    id: 9,
    name: "GTA MONEY MADE",
    org: "rockstar",
    date: "4/15/26",
    records: " 78.6 million",
    severity: "critical",
    category: "gaming",
    dataTypes: ["money Made"],
    description: "A hacking group shiny hunters took How mutch gta made",
    source: "https://www.reuters.com/legal/government/millions-rockstar-games-business-records-stolen-hacking-group-says-2026-04-13/"
  }
];

// ---- Storage helpers ----
function loadBreaches() {
  try {
    const stored = localStorage.getItem('breached_report_data');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return DEFAULT_BREACHES;
}

function saveBreaches(data) {
  try {
    localStorage.setItem('breached_report_data', JSON.stringify(data));
  } catch (e) {}
}

// ---- State ----
let breaches = loadBreaches();
let activeFilter = 'all';
let nextId = Math.max(...breaches.map(b => b.id), 0) + 1;

// ---- Category icons ----
const CATEGORY_ICONS = {
  gaming:     '🎮',
  financial:  '💳',
  social:     '📱',
  government: '🏛️',
  healthcare: '🏥',
  tech:       '💻',
  other:      '🔓'
};

// ---- Render functions ----

function renderBreaches() {
  const list = document.getElementById('breach-list');
  let filtered = activeFilter === 'all'
    ? breaches
    : breaches.filter(b =>
        b.severity === activeFilter || b.category === activeFilter
      );

  // Sort newest first
  filtered = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state">// NO BREACH RECORDS MATCH THIS FILTER</div>';
    return;
  }

  list.innerHTML = filtered.map((b, i) => {
    const icon = CATEGORY_ICONS[b.category] || '🔓';
    const sevClass = `sev-${b.severity}`;
    const tags = (b.dataTypes || []).map(t =>
      `<span class="breach-tag">${escapeHtml(t)}</span>`
    ).join('');
    const sourceLink = b.source
      ? `<a href="${escapeHtml(b.source)}" target="_blank" rel="noopener" class="breach-source">→ SOURCE</a>`
      : '';

    return `
      <div class="breach-card" data-severity="${b.severity}" data-category="${b.category}" style="animation-delay: ${i * 0.04}s">
        <div class="breach-icon">${icon}</div>
        <div class="breach-meta">
          <div class="breach-title">${escapeHtml(b.name)}</div>
          <div class="breach-org">${escapeHtml(b.org)}</div>
          <div class="breach-desc">${escapeHtml(b.description)}</div>
          <div class="breach-tags">${tags}</div>
        </div>
        <div class="breach-side">
          <div><span class="severity-badge ${sevClass}">${b.severity.toUpperCase()}</span></div>
          <div class="breach-records">
            ${escapeHtml(b.records)}
            <span>RECORDS EXPOSED</span>
          </div>
          <div class="breach-date">${formatDate(b.date)}</div>
          ${sourceLink}
        </div>
      </div>`;
  }).join('');
}

function updateStats() {
  const count = breaches.length;
  document.getElementById('breach-count').textContent = count;

  // Total numeric records
  let total = 0;
  breaches.forEach(b => {
    const n = parseInt(b.records.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(n)) total += n;
  });
  document.getElementById('total-records').textContent = formatBigNum(total);

  // This month
  const now = new Date();
  const thisMonth = breaches.filter(b => {
    const d = new Date(b.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  document.getElementById('month-count').textContent = thisMonth;

  // Most recent
  const sorted = [...breaches].sort((a, b) => new Date(b.date) - new Date(a.date));
  document.getElementById('most-recent').textContent =
    sorted.length ? sorted[0].name : '—';

  // Critical
  const critCount = breaches.filter(b => b.severity === 'critical').length;
  document.getElementById('critical-count').textContent = critCount;
}

function updateTicker() {
  const sorted = [...breaches].sort((a, b) => new Date(b.date) - new Date(a.date));
  const items = sorted.map(b =>
    `★ ${b.name} [${b.org}] — ${b.records} records — ${b.severity.toUpperCase()}`
  ).join('   //   ');
  document.getElementById('ticker').textContent = items || 'No breach data loaded.';
}

// ---- Filter ----
function filterBreaches(filter, btn) {
  activeFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderBreaches();
}

// ---- Email Check ----
function checkEmail() {
  const input = document.getElementById('email-input');
  const result = document.getElementById('check-result');
  const email = input.value.trim().toLowerCase();

  result.className = 'check-result';

  if (!email || !email.includes('@')) {
    result.textContent = '// ERROR: Please enter a valid email address.';
    result.classList.add('pwned');
    return;
  }

  // Simulated check against breach data types / known fictional domains
  // In production: hook this up to HaveIBeenPwned API or your own database
  const knownPwnedDomains = ['yahoo.com', 'myspace.com', 'linkedin.com', 'adobe.com', 'dropbox.com'];
  const domain = email.split('@')[1];
  const isPwned = knownPwnedDomains.includes(domain) || email.includes('test') || email.includes('hack');

  if (isPwned) {
    result.innerHTML = `⚠ EXPOSURE DETECTED for <strong>${escapeHtml(email)}</strong><br>
    This address appears in known breach datasets. Change your password immediately and enable 2FA.<br>
    <small>// For full results, visit <a href="https://haveibeenpwned.com" target="_blank" style="color:inherit">haveibeenpwned.com</a></small>`;
    result.classList.add('pwned');
  } else {
    result.innerHTML = `✔ NO KNOWN EXPOSURES found for <strong>${escapeHtml(email)}</strong><br>
    This does not guarantee complete safety. Continue using strong, unique passwords.<br>
    <small>// Cross-reference with <a href="https://haveibeenpwned.com" target="_blank" style="color:inherit">haveibeenpwned.com</a> for full verification</small>`;
    result.classList.add('safe');
  }
}

// Allow Enter key for email check
document.addEventListener('DOMContentLoaded', () => {
  const emailInput = document.getElementById('email-input');
  if (emailInput) {
    emailInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkEmail();
    });
  }
});

// ---- Admin Submit ----
function submitBreach() {
  const msg = document.getElementById('form-msg');
  msg.className = 'form-msg';
  msg.textContent = '';

  const name     = document.getElementById('f-name').value.trim();
  const org      = document.getElementById('f-org').value.trim();
  const date     = document.getElementById('f-date').value;
  const records  = document.getElementById('f-records').value.trim() || 'Unknown';
  const severity = document.getElementById('f-severity').value;
  const category = document.getElementById('f-category').value;
  const rawTypes = document.getElementById('f-datatypes').value;
  const desc     = document.getElementById('f-desc').value.trim();
  const source   = document.getElementById('f-source').value.trim();

  // Validate required
  if (!name || !org || !desc) {
    msg.textContent = '// ERROR: Name, Organization, and Description are required.';
    msg.classList.add('error');
    return;
  }

  const dataTypes = rawTypes
    ? rawTypes.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const newBreach = {
    id: nextId++,
    name,
    org,
    date: date || new Date().toISOString().split('T')[0],
    records,
    severity,
    category,
    dataTypes,
    description: desc,
    source: source || null
  };

  breaches.unshift(newBreach);
  saveBreaches(breaches);

  renderBreaches();
  updateStats();
  updateTicker();

  // Reset form
  ['f-name','f-org','f-date','f-records','f-datatypes','f-desc','f-source'].forEach(id => {
    document.getElementById(id).value = '';
  });

  msg.textContent = '// SUCCESS: Breach report added to the feed.';
  msg.classList.add('success');
  setTimeout(() => { msg.textContent = ''; }, 4000);

  // Scroll to feed
  document.getElementById('feed').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---- Helpers ----
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
  if (!dateStr) return 'Unknown';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch (e) { return dateStr; }
}

function formatBigNum(n) {
  if (!n || isNaN(n)) return '—';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B+';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M+';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K+';
  return n.toString();
}

// ---- Init ----
function init() {
  renderBreaches();
  updateStats();
  updateTicker();
}

init();
