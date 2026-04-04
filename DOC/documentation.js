async function requireAuth() {
  try {
    const r = await fetch('/api/auth/me', { credentials: 'include' });
    if (!r.ok) window.location.href = '/LOGIN/LOGIN.html';
  } catch {
    window.location.href = '/LOGIN/LOGIN.html';
  }
}

async function logout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } finally {
    window.location.href = '/LOGIN/LOGIN.html';
  }
}

requireAuth();

const logoutBtn = document.querySelector('.logout-btn');
if (logoutBtn) logoutBtn.addEventListener('click', logout);

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
