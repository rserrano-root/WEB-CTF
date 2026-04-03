// Login page script (particles, auth cookie, login handler)
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

function setAuthState(v) {
  if (v) {
    document.cookie = 'nexus_auth=1; path=/; SameSite=Lax';
  } else {
    document.cookie = 'nexus_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
  }
}

function isAuthenticated() {
  return document.cookie.split('; ').some((i) => i === 'nexus_auth=1');
}

if (isAuthenticated()) {
  window.location.href = '../DOC/documentation.html';
}

function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value;
  const alertBox = document.getElementById('login-alert');
  if (!alertBox) return;
  alertBox.classList.remove('show', 'success');
  if (!email || !pass) {
    alertBox.textContent = 'ERROR — Champs requis non remplis';
    alertBox.classList.add('show');
    return;
  }
  if (pass.length < 4) {
    alertBox.textContent = 'ACCESS DENIED — Identifiants incorrects';
    alertBox.classList.add('show');
    return;
  }
  alertBox.textContent = 'ACCESS GRANTED — Redirection en cours...';
  alertBox.classList.add('show', 'success');
  setAuthState(true);
  setTimeout(() => (window.location.href = '../DOC/documentation.html'), 700);
}

// attach listeners
const loginBtn = document.querySelector('.btn-primary');
if (loginBtn) loginBtn.addEventListener('click', handleLogin);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleLogin();
});
