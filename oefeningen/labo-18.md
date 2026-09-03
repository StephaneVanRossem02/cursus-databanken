---
title: Labo 18 - Herhaling (tennis)
sidebar_position: 19
---

# Labo 18 - Herhaling (tennis)

_Bron: Labo 18._

Labo 18 - herhalingsoefeningen

Run eerst het calibratiescript voor de ‘tennis’-database, en bestudeer het datamodel:

Lees ook aandachtig de bijgeleverde beschrijving ‘Beschrijving databases.pdf’ (enkel voor database ‘tennis’), om goed te begrijpen hoe alle velden in de verschillende tabellen precies worden ingevuld. Maak onderstaande opgaven en lever de oplossingen aan in 1 script-bestand, waarbij elke opgave voorafgegaan wordt door de nodige commentaar.

## Calibratiescript

Voer dit script eerst uit. Het maakt de databank en tabellen aan en vult ze met de voorbeelddata voor dit labo.

<details>
<summary>Toon calibratiescript</summary>

```sql
DROP DATABASE IF EXISTS Tennis;
CREATE DATABASE Tennis;
USE Tennis;

CREATE TABLE Spelers
      (SpelersNr INT NOT NULL PRIMARY KEY,
       Naam         VARCHAR(15) NOT NULL,
       Voorletters 	VARCHAR(3) NOT NULL,
       Geb_Datum	DATE,
       Geslacht		VARCHAR(1) NOT NULL,
       JaarToe 		SMALLINT NOT NULL,
       Straat       VARCHAR(30)  NOT NULL,
       HuisNr       VARCHAR(4),
       Postcode     VARCHAR(6),
       Plaats		VARCHAR(30) NOT NULL,
       Telefoon 	VARCHAR(13),
       Bondsnr      VARCHAR(4))
;
CREATE TABLE Teams
      (TeamNr       INT NOT NULL PRIMARY KEY,
       SpelersNr    INT NOT NULL,
       Divisie      VARCHAR(6) NOT NULL,
       FOREIGN KEY  (SpelersNr) REFERENCES Spelers(SpelersNr))
;
CREATE TABLE Wedstrijden
      (WedstrijdNr  INT NOT NULL PRIMARY KEY,
       TeamNr       INT NOT NULL,
       SpelersNr    INT NOT NULL,
       Gewonnen     SMALLINT NOT NULL,
       Verloren 	SMALLINT NOT NULL,
       FOREIGN KEY  (TeamNr) REFERENCES Teams(TeamNr),
       FOREIGN KEY  (SpelersNr) REFERENCES Spelers(SpelersNr))
;
CREATE TABLE Boetes
      (BetalingsNr  INT NOT NULL PRIMARY KEY,
       SpelersNr    INT NOT NULL,
       Datum        DATE NOT NULL,
       Bedrag		DECIMAL(7,2) NOT NULL,
       FOREIGN KEY  (SpelersNr) REFERENCES Spelers(SpelersNr))
;
CREATE TABLE Bestuursleden
      (SpelersNr	INT NOT NULL,
       Begin_Datum	DATE NOT NULL,
       Eind_Datum	DATE,
       Functie		VARCHAR(20),
       PRIMARY KEY  (SpelersNr, Begin_Datum),
       FOREIGN KEY  (SpelersNr) REFERENCES Spelers(SpelersNr))
;

INSERT INTO SPELERS VALUES (
  2, 'Elfring', 'R', '1948-09-01', 'M', 1975, 'Steden', 
    '43', '3575NH', 'Den Haag', '070-237893', '2411')
;
INSERT INTO SPELERS VALUES (
  6, 'Permentier', 'R', '1964-06-25', 'M', 1977, 'Hazensteinln',
    '80', '1234KK', 'Den Haag', '070-476537', '8467')
;
INSERT INTO SPELERS VALUES (
  7, 'Wijers', 'GWS', '1963-05-11', 'M', 1981, 'Erasmusweg', 
    '39', '9758VB', 'Den Haag', '070-347689', NULL)
;
INSERT INTO SPELERS VALUES (
  8, 'Niewenburg', 'B', '1962-07-08', 'V', 1980, 'Spoorlaan',
    '4', '6584WO', 'Rijswijk', '070-458458', '2983')
;
INSERT INTO SPELERS VALUES (
 27, 'Cools', 'DD', '1964-12-28', 'V', 1983, 'Liespad', 
    '804', '8457DK', 'Zoetermeer', '079-234857', '2513')
;
INSERT INTO SPELERS VALUES (
 28, 'Cools', 'C', '1963-06-22', 'V', 1983, 'Oudegracht',
    '10', '1294QK', 'Leiden', '010-659599', NULL)
;
INSERT INTO SPELERS VALUES (
 39, 'Bischoff', 'D', '1956-10-29', 'M', 1980, 'Ericaplein', 
    '78', '9629CD', 'Den Haag', '070-393435', NULL)
;
INSERT INTO SPELERS VALUES (
 44, 'Bakker, de', 'E', '1963-01-09', 'M', 1980, 'Lawaaistraat',
    '23', '4444LJ', 'Rijswijk', '070-368753', '1124')
;
INSERT INTO SPELERS VALUES (
 57, 'Bohemen, van', 'M',  '1971-08-17', 'M', 1985, 'Erasmusweg',
    '16', '4377CB', 'Den Haag', '070-473458', '6409')
;
INSERT INTO SPELERS VALUES (
 83, 'Hofland', 'PK', '1956-11-11', 'M', 1982, 'Mariakade',
    '16a', '1812UP', 'Den Haag', '070-353548', '1608')
;
INSERT INTO SPELERS VALUES (
 95, 'Meuleman', 'P', '1963-05-14', 'M', 1972, 'Hoofdweg',
    '33a', '5746OP', 'Voorburg', '070-867564', NULL)
;
INSERT INTO SPELERS VALUES (
100, 'Permentier', 'P', '1963-02-28', 'M', 1979, 'Hazensteinln',
    '80', '6494SG', 'Den Haag', '070-494593', '6524')
;
INSERT INTO SPELERS VALUES (
104, 'Moerman', 'D', '1970-05-10', 'V', 1984, 'Stoutlaan',
    '65', '9437AO', 'Zoetermeer', '079-987571', '7060')
;
INSERT INTO SPELERS VALUES (
112, 'Baalen, van', 'IP', '1963-10-01', 'V', 1984, 'Vosseweg', 
    '8', '6392LK', 'Rotterdam', '010-548745', '1319')
;

INSERT INTO TEAMS VALUES (1,  6, 'ere')
;
INSERT INTO TEAMS VALUES (2, 27, 'tweede')
;

INSERT INTO WEDSTRIJDEN VALUES ( 1, 1,   6, 3, 1)
;
INSERT INTO WEDSTRIJDEN VALUES ( 2, 1,   6, 2, 3)
;
INSERT INTO WEDSTRIJDEN VALUES ( 3, 1,   6, 3, 0)
;
INSERT INTO WEDSTRIJDEN VALUES ( 4, 1,  44, 3, 2)
;
INSERT INTO WEDSTRIJDEN VALUES ( 5, 1,  83, 0, 3)
;
INSERT INTO WEDSTRIJDEN VALUES ( 6, 1,   2, 1, 3)
;
INSERT INTO WEDSTRIJDEN VALUES ( 7, 1,  57, 3, 0)
;
INSERT INTO WEDSTRIJDEN VALUES ( 8, 1,   8, 0, 3)
;
INSERT INTO WEDSTRIJDEN VALUES ( 9, 2,  27, 3, 2)
;
INSERT INTO WEDSTRIJDEN VALUES (10, 2, 104, 3, 2)
;
INSERT INTO WEDSTRIJDEN VALUES (11, 2, 112, 2, 3)
;
INSERT INTO WEDSTRIJDEN VALUES (12, 2, 112, 1, 3)
;
INSERT INTO WEDSTRIJDEN VALUES (13, 2,   8, 0, 3)
;

INSERT INTO BOETES VALUES (1,   6, '1980-12-08', 100)
;
INSERT INTO BOETES VALUES (2,  44, '1981-05-05',  75)
;
INSERT INTO BOETES VALUES (3,  27, '1983-09-10', 100)
;
INSERT INTO BOETES VALUES (4, 104, '1984-12-08',  50)
;
INSERT INTO BOETES VALUES (5,  44, '1980-12-08',  25)
;
INSERT INTO BOETES VALUES (6,   8, '1980-12-08',  25)
;
INSERT INTO BOETES VALUES (7,  44, '1982-12-30',  30)
;
INSERT INTO BOETES VALUES (8,  27, '1984-11-12',  75)
;

INSERT INTO BESTUURSLEDEN VALUES (  6, '1990-01-01', '1990-12-31', 'Secretaris')
;
INSERT INTO BESTUURSLEDEN VALUES (  6, '1991-01-01', '1992-12-31', 'Lid')
;
INSERT INTO BESTUURSLEDEN VALUES (  6, '1992-01-01', '1993-12-31', 'Penningmeester')
;
INSERT INTO BESTUURSLEDEN VALUES (  6, '1993-01-01', NULL, 'Voorzitter')
;
INSERT INTO BESTUURSLEDEN VALUES (  2, '1990-01-01', '1992-12-31', 'Voorzitter')
;
INSERT INTO BESTUURSLEDEN VALUES (  2, '1994-01-01', NULL, 'Lid')
;
INSERT INTO BESTUURSLEDEN VALUES (112, '1992-01-01', '1992-12-31', 'Lid')
;
INSERT INTO BESTUURSLEDEN VALUES (112, '1994-01-01', NULL, 'Secretaris')
;
INSERT INTO BESTUURSLEDEN VALUES (  8, '1990-01-01', '1990-12-31', 'Penningmeester')
;
INSERT INTO BESTUURSLEDEN VALUES (  8, '1991-01-01', '1991-12-31', 'Secretaris')
;
INSERT INTO BESTUURSLEDEN VALUES (  8, '1993-01-01', '1993-12-31', 'Lid')
;
INSERT INTO BESTUURSLEDEN VALUES (  8, '1994-01-01', NULL, 'Lid')
;
INSERT INTO BESTUURSLEDEN VALUES ( 57, '1992-01-01', '1992-12-31', 'Secretaris')
;
INSERT INTO BESTUURSLEDEN VALUES ( 27, '1990-01-01', '1990-12-31', 'Lid')
;
INSERT INTO BESTUURSLEDEN VALUES ( 27, '1991-01-01', '1991-12-31', 'Penningmeester')
;
INSERT INTO BESTUURSLEDEN VALUES ( 27, '1993-01-01', '1993-12-31', 'Penningmeester')
;
INSERT INTO BESTUURSLEDEN VALUES ( 95, '1994-01-01', NULL, 'Penningmeester')
;
```

</details>

## Opgave 1

Schrijf de SQL-instructie die de view met naam “V_Spelers_per_Team” aanmaakt. Je voorziet daarbij gepaste kolomnamen. De view moet aan onderstaande informatiebehoefte voldoen: Toon voor elk team de divisie en het aantal spelers dat wedstrijden voor dit team gespeeld heeft.

## Opgave 2

Schrijf de SQL-instructie die de view “V_Spelers_per_Team” verwijdert.

## Opgave 3

Schrijf de SQL-instructie die de view met naam “V_Spelers_Wedstrijden” aanmaakt. De view

moet in onderstaande informatiebehoefte voldoen: Geef voor elke speler alle info uit tabel spelers terug, aangevuld met per speler alle info van de wedstrijden die de speler heeft gespeeld. Voor informatie die in beide tabellen voorkomt toon je slechts 1 kolom. Ook spelers die nog geen wedstrijden speelden moeten in het overzicht verschijnen.

## Opgave 4

Schrijf de SQL-instructie die de view met naam “V_Spelers_Boetes” aanmaakt. Je voorziet daarbij gepaste kolomnamen. De view moet aan onderstaande informatiebehoefte voldoen: Toon voor elke speler het spelersnr, de familienaam en het totaalbedrag aan boetes, ook als de speler nog nooit boetes betaalde.

## Opgave 5

Schrijf de SQL-instructie die aan onderstaande informatiebehoefte voldoet. Je maakt daarbij gebruik van de view “V_Spelers_Boetes”: Toon voor de spelers waarvan het totaalbedrag aan boetes hoger ligt dan € 80 het spelersnr, de familienaam en het totaalbedrag aan boetes.

## Opgave 6

Schrijf de SQL-instructie die de naam van de view “V_Spelers_Boetes” verandert in “V_Spelers_TotaalbedragBoetesBetaald”.

## Opgave 7

Schrijf de SQL-instructie die de stored procedure met naam “SP_Toon_SpelerInfo” aanmaakt. De stored procedure moet in onderstaande functionaliteit voorzien: Toon alle basisinformatie voor een gegeven spelersnr. Indien geen spelersnr werd meegegeven moet de procedure een error signaleren met boodschap “U dient een spelersnummer op te geven.”. Indien wel een spelersnr werd meegegeven, toont de stored procedure alle informatie van die speler in een resultatentabel.

## Opgave 8

Schrijf de SQL-instructie die de stored function met naam “Bestaat_Speler” aanmaakt. De functie heeft als parameter het Id van een speler, en returnt een boolean die aangeeft of het betreffende Id voorkomt in de tabel met spelers.

## Opgave 9

Schrijf de SQL-instructie die de eerder gecreëerde stored procedure met naam “SP_Toon_SpelerInfo” opnieuw uitwerkt met de volgende uitbreiding: Als het spelersnummer leeg is, dan moet de procedure nog steeds een error signaleren met boodschap “U dient een spelersnummer op te geven.”. Indien wel een spelersnummer werd meegestuurd, maar dit nummer bestaat niet in de tabel met spelers, dan moet een error gegenereerd worden met volgende boodschap: “U dient een geldig spelersnummer op te geven.”. Tip: maak gebruik van je stored function Bestaat_Speler.
