-- Ajoute la colonne role à la table users (à exécuter une seule fois)
-- Les utilisateurs existants reçoivent le rôle 'user' par défaut.
--
-- Usage :
--   mysql -u root -p ctfeur < migration_role.sql
--
-- Pour promouvoir un admin :
--   UPDATE users SET role = 'admin' WHERE identifiant = 'votre_admin';

ALTER TABLE `users`
  ADD COLUMN `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user'
  AFTER `mail`;
