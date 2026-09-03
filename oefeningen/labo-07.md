---
title: "Labo 07 - apTunes: normalisatie"
sidebar_position: 8
---

# Labo 07 - apTunes: normalisatie

_Bron: Labo 07._

Dit labo werkt rond het **apTunes-project**. De opgaven staan in de cursus, in de sectie [apTunes - normalisatie](/docs/my-sql/aptunes#normalisatie-van-de-aptunes-databank).

Voer eerst het bijhorende calibratiescript hieronder uit voor je aan de opgaven begint.

## Scripts

### Les_07.sql

```sql
-- Les 07

/*
-- Properdere oplossing voor oefening 4:
SELECT
  CASE
    WHEN ReleaseJaar < 1990 THEN 'Before 1990'
    ELSE '1990 or later'
  END AS ReleaseYearGroup,
  COUNT(*)
FROM liedjes
GROUP BY ReleaseYearGroup;

-- Labo 5 oef 5 tem 12
select count(*) as 'Aantal binnen dit genre', Genre
from Liedjes
group by Genre
order by 1;

-- Indien iemand geprobeerd had om te sorteren op Genre, dan gaf dat geen alfabetische sortering. Genre is namelijk een enum-veld, en volgt voor sortering de volgorde van de keuzeopties van de enum. Om toch een alfabetische sortering te forceren, moeten we een conversie uitvoeren (ze moeten dit niet kennen, maar wel begrijpen dat de enum anders sorteert):
select count(*) as 'Aantal binnen dit genre', Genre
from Liedjes
group by Genre
order by CONVERT(Genre, CHAR);

-- Of kiezen voor een andere collation:
select count(*) as 'Aantal binnen dit genre', Genre
from Liedjes
group by Genre
order by Genre COLLATE utf8mb4_0900_ai_ci;
*/

-- Sleutels voor identificatie: https://apwt.gitbook.io/databanken/my-sql/ddl/sleutels-voor-identificatie 

-- Demo eenvoudig voorbeeld van PK constraint (nog zonder auto_increment)
DROP TABLE IF EXISTS Games;
CREATE TABLE Games(Id INT PRIMARY KEY, Titel VARCHAR(100));

INSERT INTO Games
VALUES (1, 'Doom');

INSERT INTO Games
VALUES (2, 'Tomb Raider');

INSERT INTO Games
VALUES (2, "Monkey Island II: LeChuck's Revenge");

INSERT INTO Games
VALUES (3, "Monkey Island II: LeChuck's Revenge"),
       (2, 'Maniac Mansion');

INSERT INTO Games (Titel)
VALUES ('Sam & Max Hit The Road');

-- Demo eenvoudig voorbeeld van PK constraint met auto_increment
INSERT INTO Games
VALUES (3, "Monkey Island II: LeChuck's Revenge"),
       (4, 'Maniac Mansion');

ALTER TABLE Games
CHANGE COLUMN Id Id INT AUTO_INCREMENT;

-- Dit record zal automatisch een PK met waarde 5 krijgen
INSERT INTO Games (Titel)
VALUES ('Indiana Jones and the Fate of Atlantis');

-- dit record zal automatisch 6 als PK krijgen
INSERT INTO Games (Titel)
VALUES ('Civilization VI oeps een foutje ingetypt');

SET SQL_SAFE_UPDATES = 0;
DELETE FROM Games
WHERE Id = 6;
SET SQL_SAFE_UPDATES = 1;

-- dit record zal automatisch 7 als PK krijgen, het DBMS gaat het oude nummer niet hergebruiken
INSERT INTO Games (Titel)
VALUES ('Civilization VI');

-- wijzigen basiswaarde AUTO_INCREMENT
ALTER TABLE Games AUTO_INCREMENT = 10;

INSERT INTO Games (Titel)
VALUES ('California Games');

ALTER TABLE Games AUTO_INCREMENT = 1;

INSERT INTO Games (Titel)
VALUES ('Sonic The Hedgehog');

ALTER TABLE Games AUTO_INCREMENT = 6;

INSERT INTO Games (Titel)
VALUES ('Streets of Rage');

-- Een PK AI toevoegen aan een bestaande tabel die nog geen PK had - https://apwt.gitbook.io/databanken/my-sql/ddl/primaire-sleutel-toevoegen-verwijderen

ALTER TABLE Boeken
ADD COLUMN Id INT AUTO_INCREMENT PRIMARY KEY;

-- Nu verschijnt het ID-veld achteraan. Ik wil het ID-veld vooraan, en los dit als volgt op:

ALTER TABLE Boeken
RENAME TO Boeken_old;

CREATE TABLE `boeken` (
  `Id` int auto_increment primary key,
  `Voornaam` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Familienaam` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Titel` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Stad` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Verschijningsjaar` varchar(4) DEFAULT NULL,
  `Uitgeverij` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Herdruk` varchar(4) DEFAULT NULL,
  `Commentaar` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Categorie` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `IngevoegdDoor` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
);

INSERT INTO boeken(Voornaam, Familienaam, Titel, Stad, Verschijningsjaar, 
	Uitgeverij, Herdruk, Commentaar, Categorie, IngevoegdDoor)
(SELECT Voornaam, Familienaam, Titel, Stad, Verschijningsjaar, 
	Uitgeverij, Herdruk, Commentaar, Categorie, IngevoegdDoor
FROM boeken_old
);

SHOW COLUMNS FROM Boeken;

-- Verwijderen van een PK-constraint:

-- dit lukt niet als de PK een AUTO_INCREMENT is
ALTER TABLE Boeken DROP PRIMARY KEY;

-- je kan er een gewoon int-veld van maken zonder auto_increment…
ALTER TABLE boeken
CHANGE COLUMN Id Id int;

-- en vervolgens de PK-constraint verwijderen
ALTER TABLE boeken DROP PRIMARY KEY;

-- het is niet handig om een PK achteraf toe te voegen aan een tabel. Je definieert best steeds bij de eerste creatie van je tabel een PK

-- Vreemde sleutels (foreign keys): https://apwt.gitbook.io/databanken/my-sql/ddl/vreemde-sleutel

DROP TABLE IF EXISTS Personen;
CREATE TABLE Personen (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Voornaam varchar(255) char set utf8mb4 NOT NULL,
    Familienaam varchar(255) char set utf8mb4,
    Leeftijd int
);

ALTER TABLE Boeken
ADD COLUMN Personen_Id INT, -- = persoon die bij dit boek hoort
ADD CONSTRAINT fk_Boeken_Personen
  FOREIGN KEY (Personen_Id)
  REFERENCES Personen(Id);

-- Toon in diagram-vorm. Kies Database > Reverse Engineer, en bekijk de relatie tussen Boeken en Personen.
--	Kies in het menu Model voor Model Options… > Diagram en zet ‘Show Captions’ aan bij Relationships (zo zie je de naam van de foreign key constraint)

DROP TABLE IF EXISTS Taken;
CREATE TABLE Taken(Id INT auto_increment primary key, Omschrijving VARCHAR(45));

DROP TABLE IF EXISTS Leden;
CREATE TABLE Leden(Id INT auto_increment primary key, Naam VARCHAR(45));

INSERT INTO Taken(Omschrijving)
VALUES ('bestek voorzien'),
('frisdrank meebrengen'),
('aardappelsla maken');

INSERT INTO Leden(Naam)
VALUES ('Yannick'), ('Bavo'), ('Max');

ALTER TABLE Leden
ADD COLUMN Taken_Id INT, -- d.w.z. de taak die bij dit lid hoort
ADD CONSTRAINT fk_Leden_Taken
FOREIGN KEY (Taken_Id) -- dit is de kolom (uit de eigen tabel) waarmee we verwijzen
REFERENCES Taken(Id); -- dit is hetgeen waar we naar verwijzen (kolom andere tabel)

SET SQL_SAFE_UPDATES = 0;
UPDATE Leden
SET Taken_Id = 2
WHERE Naam = 'Yannick';
UPDATE Leden
SET Taken_Id = 1
WHERE Naam = 'Bavo';
UPDATE Leden
SET Taken_Id = 3
WHERE Naam = 'Max';
SET SQL_SAFE_UPDATES = 1;

-- vanaf nu laten we niet meer toe dat een lid geen taak toegewezen heeft
ALTER TABLE Leden
CHANGE Taken_Id Taken_Id INT NOT NULL;

-- De data uit de twee tabellen kan gecombineerd worden in 1 resultatentabel
-- We weten nog niet hoe we dat moeten doen, daarvoor hebben we een JOIN nodig

-- Deze select produceert ONZIN!
SELECT *
FROM Leden, Taken;

-- 	Wat we hier gedaan hebben, is het maken van een CROSS JOIN, dit is een join die een resultatentabel produceert die alle records van de ene tabel linkt aan alle records van de andere tabel. Dit zal zelden de bedoeling zijn.

-- Met een correcte INNER JOIN lukt het wel.
-- Je moet dit nog niet kunnen, dit komt pas later aan bod.
SELECT *
FROM Leden INNER JOIN Taken
ON Leden.Taken_Id = Taken.Id;

--	1-op-n relaties 

DROP TABLE IF EXISTS Users;
CREATE TABLE Users(Id INT AUTO_INCREMENT PRIMARY KEY, Handle VARCHAR(144));

DROP TABLE IF EXISTS Tweets;
CREATE TABLE Tweets(Id INT AUTO_INCREMENT PRIMARY KEY, Bericht VARCHAR(144), Users_Id INT NOT NULL);

ALTER TABLE Tweets
ADD CONSTRAINT fk_Tweets_Users
FOREIGN KEY (Users_Id)
REFERENCES Users(Id);

INSERT INTO Users(Handle)
VALUES('NintendoEurope'), ('Xbox');

INSERT INTO Tweets(Bericht, Users_Id)
VALUES
('Don''t forget -- Nintendo Labo: VR Kit launches 12/04!',1),
('Splat it out in the #Splatoon2 EU Community Cup 5 this Sunday!',1),
('Crikey! Keep an eye out for cardboard crocs and other crafty wildlife on this jungle train ride! #Yoshi',1),
('You had a lot to say about #MetroExodus. Check out our favorite 5-word reviews.',2),
('It''s a perfect day for some mayhem.',2),
('Drift all over N. Sanity Beach and beyond in Crash Team Racing Nitro-Fueled.',2);

SELECT Handle, Bericht
FROM Users
INNER JOIN Tweets
ON Users_Id = Users.Id;

-- Voorbeeld van het vullen van een tabel op basis van een subquery (ze hebben dit voorbeeld nodig om script 24 van Labo 7 te kunnen maken)

CREATE TABLE Auteur(Id int auto_increment primary key, 
	Voornaam varchar(100) not null, Familienaam varchar(100) not null);
INSERT INTO Auteur(Voornaam, Familienaam)
	(SELECT DISTINCT Voornaam, Familienaam FROM Boeken);

-- Labo 7 (voorlopig enkel scripts 24 tem 34)
-- script 1 tem 23 hoef je niet te maken, maar kan je achteraf nog gebruiken om voorgaande hoofdstukken te oefenen.
-- Scroll op de pagina naar “Normalisatie van de apTunes databank”
-- Om te kunnen starten vanaf oefening 24, voer je eerst het calibratiescript van Labo 7 uit.
```


## Bestanden

- [Labo_07_Calibratie.sql](/downloads/oefeningen/labo-07/Labo_07_Calibratie.sql)

