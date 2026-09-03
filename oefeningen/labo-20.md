---
title: Labo 20 - Triggers
sidebar_position: 21
---

# Labo 20 - Triggers

_Bron: Labo 20._

Labo 20: triggers

Werk verder in je aptunes-database zoals ze samengesteld was na labo 17.

Opgave 1: Voorzie een nieuwe tabel ‘LiedjesLog’ met volgende kolommen:

- Een kolom Naam waarin je de naam van de gebruiker logt die de actie uitvoerde, die kan je bekomen met de ingebouwde functie USER().
- Het Id van het liedje dat werd toegevoegd, gewijzigd of verwijderd.
- Een kolom Aanpassing, waarin je ofwel een INSERT, een UPDATE of een DELETE kan noteren

(kies een geschikt datatype voor deze kolom).

- De dag en het tijdstip waarop de actie gelogd werd.

Maak de triggers ‘log_insert_liedjes’, ‘log_update_liedjes’ en ‘log_delete_liedjes’ die alle acties op de tabel Liedjes logt. In de update-trigger mag je ervan uitgaan dat het Id van het liedje niet wijzigt, en je dit dus ofwel in OLD ofwel in NEW kan terugvinden.

Opgave 2: We willen ons ervan verzekeren dat het Id van een Liedje niet kan gewijzigd worden. Schrijf een trigger ‘prevent_update_id’ die automatisch wordt uitgevoerd vóór elke update op de tabel met Liedjes, en die een error message produceert wanneer het nieuwe Id niet gelijk is aan het oude Id. Dankzij de error message zal de update dan ook niet doorgaan.

## Calibratiescript

Download dit script en voer het eerst uit. Het maakt de databank en tabellen aan en vult ze met de voorbeelddata voor dit labo.

- [Les_20_Calibratie.sql](/downloads/oefeningen/labo-20/Les_20_Calibratie.sql)

## Lesvoorbeeld

Democode uit de theorieles, ter naslag. Dit hoef je niet in te leveren.

```sql
-- Cursors: een cursor is een object in MySQL dat toelaat om de rijen van een resultatenset één na één te behandelen.
-- Demo 1

USE DbLes20;
DROP procedure IF EXISTS `VoorbeeldCursors`;

DELIMITER $$
USE `dbles20`$$
CREATE PROCEDURE `VoorbeeldCursors` (OUT genresList VARCHAR(1000))
BEGIN
  DECLARE done INTEGER DEFAULT 0;
  DECLARE currentGenre VARCHAR(50) DEFAULT "";
  DECLARE genreCursor CURSOR FOR SELECT Naam FROM Genres;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
  SET genresList = ''; # initialiseren, anders null!
  OPEN genreCursor;
  getGenre: LOOP
    FETCH genreCursor INTO currentGenre;
    IF done = 1
    THEN
      LEAVE getGenre;
    END IF;
    SET genresList = CONCAT(currentGenre,";",genresList);
    END LOOP getGenre;
  CLOSE genreCursor;

END$$

DELIMITER ;


CALL VoorbeeldCursors(@genresList);
SELECT @genresList;

-- Demo 2:

# nu met exit handler;
USE `DbLes20`;
DROP procedure IF EXISTS `VoorbeeldCursorsMetExitHandler`;

DELIMITER $$
USE `DbLes20`$$
CREATE PROCEDURE `VoorbeeldCursorsMetExitHandler` (OUT GenresList VARCHAR(1000))
BEGIN
	DECLARE currentGenre VARCHAR(45) DEFAULT "";
	DECLARE genreCursor CURSOR FOR SELECT Naam FROM Genres;
	DECLARE EXIT HANDLER FOR NOT FOUND
		BEGIN
		# We hoeven niets meer te doen. Aan het einde van de resultatenset
		# zal de fetch voor een error zorgen. Die vangen we op met deze lege exit handler.
		# De procedure wordt dus beëindigd, en de cursor automatisch gesloten.
        END;

	SET GenresList = ''; # initialiseren, anders null!
    
	OPEN genreCursor;
	getGenre: LOOP
		FETCH genreCursor INTO currentGenre;
		SET GenresList = CONCAT(currentGenre,";",GenresList);
	END LOOP;

END$$

DELIMITER ;

--  Voorbeeld met meerdere variabelen:
DROP procedure IF EXISTS `VoorbeeldCursorsMetMeerdereVariabelen`;

DELIMITER $$
USE `DbLes20`$$
CREATE PROCEDURE `VoorbeeldCursorsMetMeerdereVariabelen` (OUT GenresList VARCHAR(1000))
BEGIN
	DECLARE done INTEGER DEFAULT 0;
	DECLARE currentId INT DEFAULT 0;
	DECLARE currentGenre VARCHAR(45) DEFAULT "";
	DECLARE genreCursor CURSOR FOR SELECT Id, Naam FROM Genres;
	DECLARE EXIT HANDLER FOR NOT FOUND
		BEGIN
		# We hoeven niets meer te doen. Aan het einde van de resultatenset
		# zal de fetch voor een error zorgen. Die vangen we op met deze lege exit handler.
		# De procedure wordt dus beëindigd, en de cursor automatisch gesloten.
        END;

	SET GenresList = ''; # initialiseren, anders null!
    
	OPEN genreCursor;
	getGenre: LOOP
		FETCH genreCursor INTO currentId, currentGenre;
		SET GenresList = CONCAT(currentId, ' ', currentGenre,";",GenresList);
	END LOOP;

END$$

DELIMITER ;

CALL VoorbeeldCursorsMetMeerdereVariabelen(@genresList);
SELECT @genresList;

-- Labo 19 oef 2, 3 en 4
-- In oef 4 van Labo19 wordt gevraagd om een newline-karakter in een tekst-variabele te verwerken. Wanneer je de variabele in de Workbench uitleest met SELECT, verschijnt de tekst toch op 1 regel:
-- Klik op het knopje ‘Wrap Cell Content’ om de newline-karakters wel weer te geven:
 
SELECT 'regel1\nregel2\nregel3\n'
```
