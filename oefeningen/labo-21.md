---
title: Labo 21
sidebar_position: 22
---

# Labo 21

_Bron: Labo 21._

Labo 21 - herhalingsoefeningen

Vertrek vanuit Labo 18, en ga verder na opgave 9 van dat labo. We werken dus verder aan de tennis- database.

Maak onderstaande opgaven en lever de oplossingen aan in 1 script-bestand, waarbij elke opgave voorafgegaan wordt door de nodige commentaar.

## Opgave 1

Schrijf een stored function met naam “Aantal_Wedstrijden_Gespeeld”. De functie heeft als parameter het Id van een speler, en returnt het aantal gespeelde wedstrijden van deze speler.

## Opgave 2

Schrijf een stored function met naam “Aantal_Wedstrijden_Gewonnen”. De functie heeft als parameter het Id van een speler, en returnt het aantal gewonnen wedstrijden van deze speler. Tip: een speler heeft een wedstrijd gewonnen indien het aantal gewonnen sets groter is dan het aantal verloren sets.

## Opgave 3

Schrijf de SQL-instructie die de stored function met naam “Aantal_Boetes_Voor_Speler” aanmaakt. De stored function moet in onderstaande informatiebehoefte voldoen: Geef het aantal boetes terug die voor een bepaalde speler zijn aangerekend. De betreffende speler moet als parameter meegegeven worden aan de stored function.

## Opgave 4

Schrijf de SQL-instructie om een lijst te tonen van alle spelers hun nummer, naam, en het aantal boetes dat ze ooit kregen. Maak gebruik van de stored function Aantal_Boetes_Voor_Speler.

## Opgave 5

Schrijf de SQL-instructie die de stored procedure met naam “SP_Get_Speler_Statistieken” aanmaakt. De stored procedure moet in onderstaande informatiebehoefte voldoen. Geef onderstaande tekst als output-parameter terug. “Speler ‘[naam]’ heeft [#] wedstrijd(en) gespeeld en [#] boete(s) ontvangen.” Je vervangt daarbij [naam] door de familienaam van de speler en [#] door het respectievelijke aantal wedstrijden en het aantal boetes. De betreffende speler moet als input parameter meegegeven worden aan de stored procedure.

## Opgave 6

Schrijf de SQL-instructie die de view met naam “V_Spelers_Statistieken” aanmaakt. Je voorziet daarbij gepaste kolomnamen. De view moet aan onderstaande informatiebehoefte voldoen: Toon voor elke speler het spelersnr, het aantal gespeelde wedstrijden, het aantal gewonnen wedstrijden, het aantal verloren wedstrijden, het aantal boetes en het totaalbedrag aan boetes. Tip: maak indien nodig gebruik van één of meerdere stored functions die je eerder definieerde. Zorg ervoor dat ook spelers die nooit boetes ontvingen of wedstrijden speelden in het overzicht worden getoond.

## Opgave 7

Schrijf de SQL-instructie die aan onderstaande informatiebehoefte voldoet. Je maakt daarbij gebruik van de view “V_Spelers_Statistieken”. Toon voor elke speler zijn naam, voorletters, het aantal gespeelde wedstrijden, het aantal gewonnen wedstrijden, het aantal verloren wedstrijden, het aantal boetes en het totaalbedrag aan boetes. Sorteer op naam.

## Opgave 8

Schrijf de SQL-instructie die de query van de view “V_Spelers_Statistieken” aanpast zodat deze voldoet aan onderstaande informatiebehoefte: Toon voor elke speler al zijn/haar gegevens, het aantal gespeelde wedstrijden, het aantal gewonnen wedstrijden, het aantal verloren wedstrijden, het aantal boetes en het totaalbedrag aan boetes.

## Opgave 9

Schrijf de SQL-instructie die de stored procedure met naam “SP_Bewaar_Wedstrijd” aanmaakt. De stored procedure moet in onderstaande functionaliteit voorzien: Bewaar de wedstrijd waarvoor de gegevens via input parameters worden meegegeven. Als het meegegeven spelersnr niet kan teruggevonden worden of niet ingevuld is moet een adequate foutboodschap gesignaleerd worden. Tip: maak gebruik van je eerder gedefinieerde stored function Bestaat_Speler. Ook alle overige noodzakelijke informatie wordt als parameters meegegeven aan de stored procedure. Wanneer het meegegeven wedstrijdnr nog niet bestaat dan voeg je de wedstrijd toe als nieuwe wedstrijd, anders pas je de gegevens van de bestaande wedstrijd aan.

## Opgave 10

Schrijf de SQL-instructie die de stored function met naam “SamenvattingWedstrijdenVoorSpelers” aanmaakt. De functie moet in onderstaande functionaliteit voorzien: Genereer een overzicht van alle wedstrijden die een gegeven speler reeds speelde. De functie heeft dus een SpelersNr als parameter. De returnwaarde is een stuk tekst van het datatype TEXT. Dit datatype werkt zoals VARCHAR, maar staat langere tekst toe, en je hoeft ook geen maximumlengte vast te leggen zoals bij VARCHAR. Zorg ervoor dat de output er als volgt uitziet:

Om een newline aan een string toe te voegen, gebruik je '\n'. Merk op dat standaard alle uitvoer op 1 regel zal weergegeven worden in de Workbench, tenzij je op het knopje ‘Wrap Cell Content’ klikt (hierboven aangeduid in geel).

Als voor een bepaalde speler nog geen wedstrijden in de database staan, toon dan volgende output:

```
    Als aan de functie een spelersnummer wordt bezorgd van een onbestaande speler, toon dan
    volgende output:

    Tip: voor deze opgave zal je gebruik moeten maken van een cursor.
```

## Scripts

### Les_21.sql

```sql
CREATE DATABASE IF NOT EXISTS dbles21;
USE dbles21;

DROP TABLE IF EXISTS persons;
CREATE TABLE persons(Id INT AUTO_INCREMENT PRIMARY KEY, Voornaam VARCHAR(50) NOT NULL, Familienaam VARCHAR(50) NOT NULL, Geboortedatum DATE);

INSERT INTO persons(Voornaam, Familienaam, Geboortedatum)
VALUES('Roger', 'Witter', '2004-10-15');

DROP TABLE IF EXISTS PersonInsertLog;
CREATE TABLE PersonInsertLog(Id INT PRIMARY KEY, currentTime DATETIME NOT NULL);

DROP TRIGGER IF EXISTS LogPersonsAfterInsert;
DELIMITER $$
CREATE TRIGGER LogPersonsAfterInsert
    AFTER INSERT ON Persons FOR EACH ROW
    BEGIN
        DECLARE currentTime DATETIME DEFAULT NOW();
        INSERT INTO PersonInsertLog (Id, currentTime)
        VALUES (NEW.Id, currentTime);
    END$$
DELIMITER ;

INSERT INTO persons(Voornaam, Familienaam, Geboortedatum)
VALUES('Karol', 'Bugg', '2002-05-23');

DROP TRIGGER IF EXISTS LogPersonsAfterInsert;
DELIMITER $$
CREATE TRIGGER LogPersonsAfterInsert
    AFTER INSERT ON Persons FOR EACH ROW
    BEGIN
		-- Vanuit een trigger die gedefineerd staat op een tabel, kan je 
		-- geen modificaties doen op dezelfde tabel.
        -- Je kan deze trigger wel definiëren, maar hij zal nooit werken.
        UPDATE Persons SET Voornaam = 'Iedereen dezelfde voornaam!' WHERE Id = NEW.Id;
    END$$
DELIMITER ;

INSERT INTO persons(Voornaam, Familienaam, Geboortedatum)
VALUES('Catarina','Manilow', '1995-12-01');
-- Merk op dat, omdat er een error ontstond in de AFTER INSERT-trigger, dat de rij ook niet werd toegevoegd

DROP TRIGGER IF EXISTS LogPersonsAfterInsert;
DELIMITER $$
CREATE TRIGGER LogPersonsAfterInsert
    AFTER INSERT ON Persons FOR EACH ROW
    BEGIN
        DECLARE currentTime datetime DEFAULT NOW();
        INSERT INTO PersonInsertLog (Id, currentTime)
        VALUES (NEW.Id, currentTime);
    END$$
DELIMITER ;

DROP TRIGGER IF EXISTS CheckPersonsBeforeInsert;
DELIMITER $$
CREATE TRIGGER CheckPersonsBeforeInsert
    BEFORE INSERT ON Persons FOR EACH ROW
    BEGIN
		IF NEW.Geboortedatum IS NOT NULL AND NEW.Geboortedatum > NOW() THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'De geboortedatum moet vóór de systeemdatum liggen.';
        END IF;
    END$$
DELIMITER ;

-- Deze INSERT lukt niet, de error die we ge-signaled hebben heeft de INSERT voorkomen:
INSERT INTO persons(Voornaam, Familienaam, Geboortedatum)
VALUES('Catarina','Manilow', '2025-12-23');

-- Deze lukt wel:
INSERT INTO persons(Voornaam, Familienaam, Geboortedatum)
VALUES('Catarina','Manilow', '1995-12-23');

-- Demonstratie van FOR EACH ROW: deze INSERT zal twee rijen invoegen
-- Je merkt dat de AFTER-trigger twee keer is afgegaan, en dus twee keer een INSERT in PersonInsertLog heeft gedaan
INSERT INTO persons(Voornaam, Familienaam, Geboortedatum)
VALUES('Jonathan','Abelson', '1991-0personinsertlog1-21'),('Margo','Sandifer', '1990-10-15');

-- 	Een trigger die afgaat na een INSERT/UPDATE/DELETE op een View

DROP TABLE IF EXISTS Taken;
DROP TABLE IF EXISTS Leden;
CREATE TABLE Leden(Id INT AUTO_INCREMENT PRIMARY KEY, Voornaam VARCHAR(45));
CREATE TABLE Taken(Id INT AUTO_INCREMENT PRIMARY KEY, Omschrijving VARCHAR(45),
	Leden_Id INT, FOREIGN KEY (Leden_Id) REFERENCES Leden(Id));

INSERT INTO Leden(Voornaam)
VALUES ('Yannick'), ('Bavo'), ('Max');

INSERT INTO Taken(Omschrijving, Leden_Id)
VALUES ('bestek voorzien', 2),
('frisdrank meebrengen', 1),
('aardappelsla maken', 3);

CREATE VIEW TakenLeden
AS
SELECT Leden.voornaam, Taken.omschrijving
FROM Taken
INNER JOIN Leden ON Leden.Id = Taken.Leden_Id;

DROP TRIGGER IF EXISTS CheckUpdateOnTaken;
DELIMITER $$
CREATE TRIGGER CheckUpdateOnTaken
    BEFORE UPDATE ON Taken FOR EACH ROW
    BEGIN
    	IF NEW.Omschrijving LIKE '%frisdrank%' THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'We doen niks met frisdrank!';
        END IF;
    END$$
DELIMITER ;

SET SQL_SAFE_UPDATES = 0;
UPDATE TakenLeden
SET Omschrijving = 'frisdrank voorzien'
WHERE Voornaam = 'Yannick';
SET  SQL_SAFE_UPDATES = 1;

-- Labo 20: triggers
```

