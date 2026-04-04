// Register page script (particles, strength meter, register handler)
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

function updateStrength(val) {
  const segs = [
    document.getElementById('seg1'),
    document.getElementById('seg2'),
    document.getElementById('seg3'),
    document.getElementById('seg4'),
  ].filter(Boolean);
  segs.forEach((s) => s.classList.remove('active'));
  if (!val) return;
  let score = 0;
  if (val.length >= 8) score++;
  if (val.length >= 12) score++;
  if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
  if (/[^a-zA-Z0-9]/.test(val)) score++;
  for (let i = 0; i < score && i < segs.length; i++) segs[i].classList.add('active');
}

async function handleRegister() {
  const username = document.getElementById('reg-username').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const pass     = document.getElementById('reg-password').value;
  const terms    = document.getElementById('reg-terms').checked;
  const alertBox = document.getElementById('register-alert');
  if (!alertBox) return;

  alertBox.classList.remove('show', 'success');

  if (!username || !email || !pass) {
    alertBox.textContent = 'ERROR — Tous les champs sont requis';
    alertBox.classList.add('show');
    return;
  }
  if (!email.includes('@')) {
    alertBox.textContent = 'ERROR — Format email invalide';
    alertBox.classList.add('show');
    return;
  }
  if (pass.length < 8) {
    alertBox.textContent = 'ERROR — Passphrase trop courte (min. 8)';
    alertBox.classList.add('show');
    return;
  }
  if (!terms) {
    alertBox.textContent = "ERROR — Conditions d'utilisation requises";
    alertBox.classList.add('show');
    return;
  }

  try {
    const res = await fetch('/api/auth/register', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ identifiant: username, mail: email, mdp: pass }),
    });

    const data = await res.json();

    if (res.status === 201 && data.success) {
      alertBox.textContent = 'COMPTE CRÉÉ — Redirection vers la connexion...';
      alertBox.classList.add('show', 'success');
      setTimeout(() => (window.location.href = '../LOGIN/LOGIN.html'), 1000);
    } else {
      alertBox.textContent = `ERROR — ${data.message || "Échec de l'inscription"}`;
      alertBox.classList.add('show');
    }
  } catch {
    alertBox.textContent = 'ERROR — Impossible de contacter le serveur';
    alertBox.classList.add('show');
  }
}

// attach listeners
const passInput = document.getElementById('reg-password');
if (passInput) passInput.addEventListener('input', (e) => updateStrength(e.target.value));
const registerBtn = document.querySelector('.btn-primary');
if (registerBtn) registerBtn.addEventListener('click', handleRegister);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleRegister();
});
