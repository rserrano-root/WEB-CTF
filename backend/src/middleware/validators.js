const { body, validationResult } = require('express-validator');

const registerRules = [
  body('identifiant')
    .trim()
    .isAlphanumeric()
    .withMessage('Identifiant : caractères alphanumériques uniquement')
    .isLength({ min: 3, max: 20 })
    .withMessage('Identifiant : 3 à 20 caractères'),

  body('mail')
    .trim()
    .isEmail()
    .withMessage('Adresse e-mail invalide')
    .normalizeEmail(),

  body('mdp')
    .isLength({ min: 8, max: 72 })
    .withMessage('Mot de passe : 8 à 72 caractères'),
];

const loginRules = [
  body('identifiant')
    .trim()
    .notEmpty()
    .withMessage('Identifiant requis')
    .isLength({ max: 20 }),

  body('mdp')
    .notEmpty()
    .withMessage('Mot de passe requis')
    .isLength({ max: 72 }),
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    return res.status(400).json({ success: false, message: first.msg });
  }
  next();
}

module.exports = { registerRules, loginRules, validate };
