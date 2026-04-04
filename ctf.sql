-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : sam. 04 avr. 2026 à 16:20
-- Version du serveur : 10.4.28-MariaDB
-- Version de PHP : 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `ctf`
--

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('qvNy6vkLfQU9Yo4ZhCJM6XV6nZc7McN2', 1775398329, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2026-04-05T14:12:08.082Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"strict\"},\"userId\":1,\"identifiant\":\"test\",\"role\":\"user\"}');

-- --------------------------------------------------------

--
-- Structure de la table `tokey`
--

CREATE TABLE `tokey` (
  `id_tokey` int(11) NOT NULL,
  `id_users` int(11) NOT NULL,
  `cle_ssh_pr` text NOT NULL,
  `cle_ssh_pu` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `identifiant` text NOT NULL,
  `mdp` text NOT NULL,
  `mail` text NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id_user`, `identifiant`, `mdp`, `mail`, `role`) VALUES
(1, 'test', '$2b$10$7Hi5dszTAcmqk6vHhM.pLuAPo8PCykbFKSoWTq2sOIKrZB8RR21dq', 'toto@gmail.com', 'user');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Index pour la table `tokey`
--
ALTER TABLE `tokey`
  ADD PRIMARY KEY (`id_tokey`),
  ADD UNIQUE KEY `idustok` (`id_users`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `ident` (`identifiant`(20)),
  ADD UNIQUE KEY `smail` (`mail`(20));

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `tokey`
--
ALTER TABLE `tokey`
  MODIFY `id_tokey` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
