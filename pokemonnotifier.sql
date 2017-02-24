-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Erstellungszeit: 24. Feb 2017 um 17:18
-- Server-Version: 10.1.19-MariaDB
-- PHP-Version: 7.0.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `pokemonnotifier`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `chats`
--

CREATE TABLE `chats` (
  `chat_id` varchar(50) NOT NULL,
  `admin` int(11) DEFAULT '0',
  `place` varchar(45) DEFAULT NULL,
  `lat` varchar(50) NOT NULL,
  `lon` varchar(50) NOT NULL,
  `priority` int(11) DEFAULT NULL,
  `chat_info` text,
  `active` int(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `invites`
--

CREATE TABLE `invites` (
  `code` varchar(10) NOT NULL,
  `chat_id` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `notify_iv`
--

CREATE TABLE `notify_iv` (
  `chat_id` varchar(50) NOT NULL,
  `iv_val` int(11) DEFAULT NULL,
  `pokemon_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `notify_pokemon`
--

CREATE TABLE `notify_pokemon` (
  `chat_id` varchar(30) NOT NULL,
  `pokemon_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `chats`
--
ALTER TABLE `chats`
  ADD PRIMARY KEY (`chat_id`);

--
-- Indizes für die Tabelle `invites`
--
ALTER TABLE `invites`
  ADD PRIMARY KEY (`chat_id`);

--
-- Indizes für die Tabelle `notify_iv`
--
ALTER TABLE `notify_iv`
  ADD PRIMARY KEY (`chat_id`,`pokemon_id`);

--
-- Indizes für die Tabelle `notify_pokemon`
--
ALTER TABLE `notify_pokemon`
  ADD PRIMARY KEY (`chat_id`,`pokemon_id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
