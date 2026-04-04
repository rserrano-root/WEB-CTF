// Login page script (particles, auth, login handler)
const particlesContainer = document.getElementById('particles');
if (particlesContainer) {
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = `${Math.random() * 100}%`;
    p.style.animationDuration = `${8 + Math.random() * 12}s`;
    p.style.animationDelay = `${Math.random() * 8}s`;
    const size = Math.random() > 0.7 ? 3 : 2;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.opacity = `${0.3 + Math.random() * 0.4}`;
    if (Math.random() > 0.7) p.style.background = '#00ff88';
    if (Math.random() > 0.85) p.style.background = '#a855f7';
    particlesContainer.appendChild(p);
  }
}

// Vérification de session existante au chargement — redirige si déjà connecté
(async () => {
  try {
    const r = await fetch('/api/auth/me', { credentials: 'include' });
    if (r.ok) window.location.href = '../DOC/documentation.html';
  } catch {
    // Serveur inaccessible — on reste sur la page de login
  }
})();

async function handleLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const pass     = document.getElementById('login-password').value;
  const alertBox = document.getElementById('login-alert');
  if (!alertBox) return;

  alertBox.classList.remove('show', 'success');

  if (!email || !pass) {
    alertBox.textContent = 'ERROR — Champs requis non remplis';
    alertBox.classList.add('show');
    return;
  }

  try {
    const res = await fetch('/api/auth/login', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ identifiant: email, mdp: pass }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      alertBox.textContent = 'ACCESS GRANTED — Redirection en cours...';
      alertBox.classList.add('show', 'success');
      setTimeout(() => (window.location.href = '../DOC/documentation.html'), 700);
    } else {
      alertBox.textContent = `ACCESS DENIED — ${data.message || 'Identifiants incorrects'}`;
      alertBox.classList.add('show');
    }
  } catch {
    alertBox.textContent = 'ERROR — Impossible de contacter le serveur';
    alertBox.classList.add('show');
  }
}

// attach listeners
const loginBtn = document.querySelector('.btn-primary');
if (loginBtn) loginBtn.addEventListener('click', handleLogin);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleLogin();
});
