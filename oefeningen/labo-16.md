---
title: Labo 16
sidebar_position: 17
---

# Labo 16

_Bron: Labo 16._

Voor dit labo heb je geen calibratiescript nodig, omdat je het kan uitwerken in een databank naar keuze.

We willen in een databank een stored function toevoegen die controleert of een paswoord aan bepaalde voorwaarden voldoet. De stored function ontvangt een paswoord als parameter, en returnt een boolean die vertelt of het paswoord aan de volgende voorwaarden voldoet:

- Het moet minstens 8 karakters lang zijn;
- Er moet minstens 1 kleine letter en 1 hoofdletter in voorkomen;
- Er moet minstens 1 cijfer in voorkomen.

Om deze test te schrijven, maak je gebruik van een lus-structuur die het paswoord letter per letter gaat nakijken, om vervolgens het juiste antwoord te returnen.

Enkele tips:

- Om na te gaan of een karakter een cijfer, kleine letter of grote letter is, kan je best afgaan op de ASCII-waarde van het karakter. De ASCII-waarde van de kleine letter a is 97, die van de kleine letter b is 98, enz… In MySQL verkrijg je de ASCII waarde van de kleine letter ‘a’ (97) via volgende functieaanroep: ASCII('a'). Hou rekening met volgende ASCII-waarden:
  - De kleine letters 'a' tot 'z': 97 t/m 122
  - De hoofdletters 'A' tot 'Z': 65 t/m 90
  - De cijfers 0 t/m 9: 48 t/m 57
- Splits de opgave in kleinere deelproblemen op. Laat je functie bijvoorbeeld eerst enkel checken of er een kleine letter in voorkomt. Breid de functionaliteit stelselmatig uit.
- Als je functie niet werkt zoals gewenst, denk dan na over hoe je jezelf wat nuttige debug- informatie kan bezorgen, of hoe je stukjes van je code apart kan testen.

Veel succes!

## Scripts

### Les_16.sql

```sql
-- ------------------------
-- Lesweek 08 - Les 16
-- ------------------------

-- Herhalingen: welke herhalingen kennen de studenten van de programmeervakken?
-- Volgende demo’s vertrekken vanuit aptunes2020.sql. 
-- LOOP: verbeterde versie LOOP-demo (de versie op Gitbook werkt niet correct bij 0 of negatieve getallen)

USE `dbles16`;
DROP procedure IF EXISTS `LoopDemo`;

DELIMITER $$
USE `dbles16`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `LoopDemo`(
    IN numberOfIterations INT
)
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE producedText VARCHAR(255) DEFAULT '';
    
    concat_loop:  LOOP
        IF  i < numberOfIterations THEN
			SET i = i + 1;
            SET producedText = CONCAT(producedText, i);
            IF i < numberOfIterations THEN
				SET producedText = CONCAT(producedText, ",");
			END IF;
		ELSE
			LEAVE concat_loop;
		END IF;
    END LOOP;

    SELECT producedText; 
END$$

DELIMITER ;

CALL LoopDemo(10);

-- WHILE … DO: Digitap

CREATE TABLE TimeSlots(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    SlotDate DATE UNIQUE
);

USE `dbles16`;
DROP procedure IF EXISTS `AddTimeSlots`;

DELIMITER $$
USE `dbles16`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `AddTimeSlots`(
    startDate DATE,
    numberOfDays INT
)
BEGIN
    DECLARE counter INT DEFAULT 1;
    DECLARE currentDate DATE DEFAULT startDate;
    WHILE counter <= numberOfDays DO
        INSERT INTO TimeSlots (SlotDate)
        VALUES
        (currentDate);
        SET counter = counter + 1;
        -- deze functie telt een aantal dagen bij een datum
        SET currentDate = DATE_ADD(currentDate, INTERVAL 1 day);
    END WHILE;
END$$

DELIMITER ;

CALL AddTimeSlots('2025-11-18', 90);

SELECT * FROM Timeslots;

-- REPEAT: Digitap

USE `dbles16`;
DROP procedure IF EXISTS `ConcatenateNumbersViaRepeat`;

DELIMITER $$
USE `dbles16`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `ConcatenateNumbersViaRepeat`()
BEGIN
    DECLARE counter INT DEFAULT 1;
    DECLARE result VARCHAR(90) DEFAULT '';

    REPEAT
        SET result = CONCAT(result,counter,',');
        SET counter = counter + 1;
    UNTIL counter >= 25
    END REPEAT;
    set result = CONCAT(result, counter);

    -- toont het resultaat op het scherm
    SELECT result;
END$$

DELIMITER ;

CALL ConcatenateNumbersViaRepeat();

-- Stored functions: zijn deterministisch of niet
 -- voorbeeld 1:
	
-- We tonen per band hoeveel muzikanten er in totaal bij gespeeld hebben
-- (muzikanten die er niet meer bij spelen worden ook geteld)

SELECT Bands.Id, Bands.Naam, COUNT(*)
FROM Bands INNER JOIN Lidmaatschappen
ON Bands.Id = Lidmaatschappen.Bands_Id
GROUP BY Bands.Id, Bands.Naam;

-- Ontwerp een functie die voor een bepaalde Band (Id) aangeeft hoeveel muzikanten er ooit bij speelden
USE `dbles16`;
DROP function IF EXISTS `AantalMuzikantenInBand`;

DELIMITER $$
USE `dbles16`$$
CREATE FUNCTION AantalMuzikantenInBand(pBands_Id INT)
RETURNS INTEGER
DETERMINISTIC
BEGIN
	DECLARE Aantal INT DEFAULT 0;
    
	SELECT COUNT(*) INTO Aantal
	FROM Bands INNER JOIN Lidmaatschappen
	ON Bands.Id = Lidmaatschappen.Bands_Id
	WHERE Bands.Id = pBands_Id
    GROUP BY Bands.Id;
    
	RETURN Aantal;
END$$

DELIMITER ;

-- Geef het aantal muzikanten in band 176:
SELECT AantalMuzikantenInBand(176);

-- Toon per band hoeveel muzikanten er in totaal bij gespeeld hebben
-- (muzikanten die er niet meer bij spelen worden ook geteld)
SELECT Id, Naam, AantalMuzikantenInBand(Id)
FROM Bands;

-- Voorbeeld 2:

DROP function IF EXISTS `dbles16`.`dubbel`;


DELIMITER $$
USE dbles16$$

CREATE FUNCTION `dubbel`(getal int)
	RETURNS int
    DETERMINISTIC
BEGIN
	RETURN getal * 2;
END$$

DELIMITER ;

-- uittesten:
SELECT dubbel(5);

-- Voorbeeld 3:

-- SET GLOBAL log_bin_trust_function_creators = True;

USE `dbles16`;
DROP function IF EXISTS `dbles16`.`head_or_tails`;

DELIMITER $$
CREATE FUNCTION `head_or_tails`()
	RETURNS BOOL
	NOT DETERMINISTIC
BEGIN
	RETURN RAND() >= 0.5;
END$$

DELIMITER ;

-- Labo 16 (1 grote oefening met stored function en loop)
```


## Bestanden

- [Les_16_Calibratie.sql](/downloads/oefeningen/labo-16/Les_16_Calibratie.sql)

