---
title: Labo 03 - DDL
sidebar_position: 4
---

# Labo 03 - DDL

_Bron: Labo 03._

## Calibratiescript

Voer dit script eerst uit. Het maakt de databank en tabellen aan en vult ze met de voorbeelddata voor dit labo.

<details>
<summary>Toon calibratiescript</summary>

```sql
CREATE DATABASE IF NOT EXISTS DbLabo03;

USE DbLabo03;

create table Liedjes (
Artiest varchar(100),
Titel varchar(100),
AantalVerkocht int,
ReleaseJaar int
);

create table Geboortes (
Voornaam varchar(100),
Familienaam varchar(100),
TijdstipGeboorte datetime,
GewichtInKilogram float
);

create table Huisdieren (
Naam varchar(100),
Diersoort varchar(100),
Leeftijd int
);

insert into Liedjes (Artiest, AantalVerkocht, Titel, ReleaseJaar)
values
("Ghost", 35000, "Call Me Little Sunshine", 2021),
("Led Zeppelin", 1000000, "Stairway to Heaven", 1973),
("Jack Broadbent", 1000, "Woman", 2015),
("Larkin Poe", 15000, "Tom Devil", 2013);

insert into Geboortes (Voornaam, Familienaam, TijdstipGeboorte, GewichtInKilogram)
values
("Adnane", "Lazaar", "1973-07-13 08:11:25", 4.1),
("Dilara", "El Farisi", "1999-10-25 06:11:13", 3.7),
("Mehmet", "Cetinel", "1995-04-01 15:58:50", 2.9),
("Thijs", "Verbeeck", "1990-08-15 19:23:12", 2.7);

insert into Huisdieren (Naam, Diersoort, Leeftijd)
values
('Misty', 'Hond', 9),
('Ming', 'Hond', 11),
('Rambo', 'Kat', 16);
```

</details>

## Oefening Labo 03-01

Maak eerst een map “Labo 3” in je map voor het vak “Databanken”. Je werkt verder vanaf de data die je in labo 2 hebt aangemaakt.

Schrijf een script dat automatisch alle liedjes met minder dan 2000 verkochte exemplaren wist. Doe dit zoals gedemonstreerd in de theorieles: start met een script dat al deze liedjes toont en pas het dan aan zodat het ze wist.

Sla alle instructies op in één script, genaamd 03-01.sql.

## Oefening Labo 03-02

Er staat een fout in onze database. Blijkbaar woog Thijs Verbeeck (die al in je tabel `Geboortes` staat) bij zijn geboorte 2.8 kilogram in plaats van 2.7. Gebruik de juiste instructie om dit aan te passen. Sla alle instructies op in één script, genaamd 03-02.sql.

## Oefening Labo 03-03

Het blijkt dat een stagiair de data voor `Liedjes` verkeerd heeft afgelezen. Van elk nummer zijn tien keer zo veel exemplaren verkocht als eerder aangegeven. Schrijf een instructie die het aantal verkochte exemplaren van elk liedje met 10 vermenigvuldigt.

**Deze instructie zou altijd moeten werken, niet alleen voor de nummers die nu in je tabel staan.** Je script moet met andere woorden volledig automatisch werken. Het bevat geen informatie die specifiek over _Call Me Little Sunshine_, _Stairway to Heaven_ of _Tom Devil_ gaat.

Sla alle nodige instructies op onder 03-03.sql.

## Oefening Labo 03-04

Omwille van nieuwe wetgeving mogen we in de tabel `Geboortes` geen familienamen meer bijhouden. We mogen wel de eerste letter nog bijhouden.

Schrijf de nodige instructie om de familienaam van **elke persoon in de tabel** te vervangen door de eerste letter, gevolgd door een punt.

Je krijgt na de aanpassing dus (we tonen hier tijdstip en gewicht even niet, maar ze zijn er nog wel):

<table><thead><tr><th>Voornaam</th><th>Familienaam</th></tr></thead><tbody><tr><td>Adnane</td><td>L.</td></tr><tr><td>Dilara</td><td>E.</td></tr><tr><td>Mehmet</td><td>C.</td></tr><tr><td>Thijs</td><td>V.</td></tr></tbody></table>

Sla op als 03-04.sql.

## Oefening Labo 03-05



Toon voor elk liedje de filenaam waaronder het moet worden opgeslagen. Deze filenaam bestaat uit de artiest, een spatie, een streepje, opnieuw een spatie, de titel en de extensie “.mp3”.



Je krijgt dus:



<table><thead><tr><th>Filenaam</th></tr></thead><tbody><tr><td>Ghost - Call Me Little Sunshine.mp3</td></tr><tr><td>Led Zeppelin - Stairway to Heaven.mp3</td></tr><tr><td>Larkin Poe - Tom Devil.mp3</td></tr></tbody></table>



Tip: de kolomhoofding zal standaard niet “Filenaam” zijn als je deze data weergeeft. Je kan dit oplossen door achter de expressie die je selecteert `AS Filenaam` te schrijven. Dat verandert de hoofding.



Sla op als 03-05.sql.

## Oefening Labo 03-06

Toon alle artiesten die een letter ‘E’ in hun naam hebben met een algemene instructie. Je krijgt dus:

<table><thead><tr><th>Artiest</th></tr></thead><tbody><tr><td>Led Zeppelin</td></tr><tr><td>Larkin Poe</td></tr></tbody></table>

(Jack Broadbent was in een eerder script gewist en Ghost bevat geen ‘E’.)

Sla op als 03-06.sql.

## Oefening Labo 03-07

Toon alle gegevens over personen geboren voor of in 1995 die maximum 3kg wogen bij hun geboorte.

Je zou moeten zien:

<table><thead><tr><th>Voornaam</th><th>Familienaam</th><th>TijdstipGeboorte</th><th>GewichtInKilogram</th></tr></thead><tbody><tr><td>Mehmet</td><td>C.</td><td>1995-04-01:15-58-50</td><td>2.9</td></tr><tr><td>Thijs</td><td>V.</td><td>1990-08-15:19-23-12</td><td>2.8</td></tr></tbody></table>

Tip: `<` werkt ook voor kolommen van type `DATETIME`.

Sla op als 03-07.sql.

## Oefening Labo 03-08

Toon alle titels van liedjes die **geen** letter ‘O’ bevatten.

Je zou moeten zien:

<table><thead><tr><th>Titel</th></tr></thead><tbody><tr><td>Call Me Little Sunshine</td></tr></tbody></table>

Sla op als 03-08.sql.

