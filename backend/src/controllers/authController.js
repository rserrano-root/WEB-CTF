const bcrypt = require('bcrypt');
const fs     = require('fs');
const path   = require('path');
const db     = require('../config/db');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;

// Hash bcrypt valide mais délibérément invalide pour les utilisateurs inexistants.
// Garantit que bcrypt.compare() s'exécute toujours (protection contre timing attack).
const DUMMY_HASH = '$2b$12$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

function securityLog(event, identifier, ip) {
  const line = `[${new Date().toISOString()}] ${event} | user=${identifier} | ip=${ip}\n`;
  const logPath = path.join(__dirname, '../../logs/security.log');
  fs.appendFile(logPath, line, () => {});
}

async function register(req, res) {
  const { identifiant, mail, mdp } = req.body;

  try {
    const hash = await bcrypt.hash(mdp, BCRYPT_ROUNDS);
    await db.execute(
      'INSERT INTO users (identifiant, mdp, mail) VALUES (?, ?, ?)',
      [identifiant, hash, mail]
    );
    securityLog('REGISTER_SUCCESS', identifiant, req.ip);
    return res.status(201).json({ success: true, message: 'Compte créé avec succès' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      securityLog('REGISTER_DUPLICATE', identifiant, req.ip);
      return res.status(409).json({ success: false, message: 'Identifiant ou email déjà utilisé' });
    }
    console.error('[register]', err);
    return res.status(500).json({ success: false, message: 'Erreur interne' });
  }
}

async function login(req, res) {
  const { identifiant, mdp } = req.body;

  try {
    const [rows] = await db.execute(
      'SELECT id_user, mdp, role FROM users WHERE identifiant = ?',
      [identifiant]
    );

    const user = rows[0];
    const passwordToCheck = user ? user.mdp : DUMMY_HASH;
    const match = await bcrypt.compare(mdp, passwordToCheck);

    if (!user || !match) {
      securityLog('LOGIN_FAIL', identifiant, req.ip);
      return res.status(401).json({ success: false, message: 'Identifiant ou mot de passe incorrect' });
    }

    req.session.regenerate((err) => {
      if (err) {
        console.error('[login] session.regenerate', err);
        return res.status(500).json({ success: false, message: 'Erreur interne' });
      }
      req.session.userId      = user.id_user;
      req.session.identifiant = identifiant;
      req.session.role        = user.role || 'user';

      securityLog('LOGIN_SUCCESS', identifiant, req.ip);
      return res.status(200).json({
        success:     true,
        message:     'Connexion réussie',
        identifiant: identifiant,
        role:        user.role || 'user',
      });
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ success: false, message: 'Erreur interne' });
  }
}

async function logout(req, res) {
  const identifiant = req.session.identifiant;
  req.session.destroy((err) => {
    if (err) {
      console.error('[logout]', err);
      return res.status(500).json({ success: false, message: 'Erreur interne' });
    }
    res.clearCookie(process.env.SESSION_NAME || 'nexus_sid');
    securityLog('LOGOUT', identifiant, req.ip);
    return res.status(200).json({ success: true, message: 'Déconnecté' });
  });
}

async function getMe(req, res) {
  return res.status(200).json({
    success:     true,
    userId:      req.session.userId,
    identifiant: req.session.identifiant,
    role:        req.session.role,
  });
}

module.exports = { register, login, logout, getMe };
