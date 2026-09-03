---
title: Labo 01
sidebar_position: 2
---

# Labo 01

_Bron: Labo 01._

## Oefening Labo 01 - 01

Maak eerst een map “Databanken” met daarin een map “Labo 1”.

Op DigitAP staan drie “debug scripts”. Deze bevatten allemaal enkele fouten. Corrigeer de fouten in elke file en sla de files op onder:

- Databanken/Labo 1/01.01.sql
- Databanken/Labo 1/01.02.sql
- Databanken/Labo 1/01.03.sql

Zorg dat de files correct uitvoeren en dat je in de tabellen het gewenste resultaat kan zien.

## Oefening Labo 01 - 02

Hieronder zie je een visuele voorstelling van twee tabellen:

_(Bijhorende afbeelding niet beschikbaar in het bronmateriaal.)_

Schrijf zelf de `CREATE`-instructie om de tabel `Boeken` aan te maken. Voer je code uit wanneer je klaar bent om ze te testen. Controleer de output van je script. Indien de instructie mis loopt, lees dan de foutmelding en probeer het probleem op te lossen.

Sla je uiteindelijke script op onder Databanken/Labo 1/02.sql.

## Oefening Labo 01 - 03

Schrijf zelf de `CREATE`-instructie om een tabel `Kunstwerken` aan te maken. Een kunstwerk heeft een auteur (voorgesteld als maximum 100 tekens tekst), een titel (voorgesteld als maximum 100 tekens tekst) en een waarde (voorgesteld als kommagetal). Gebruik hoofdletters voor je kolomnamen en voer je code uit wanneer je klaar bent om ze te testen. Controleer de output van je script. Indien de instructie mis loopt, lees dan de foutmelding en probeer het probleem op te lossen. Sla je uiteindelijke script op onder Databanken/Labo 1/03.sql.

## Oefening Labo 01-04

Schrijf zelf de `INSERT`-instructie om volgende kunstwerken toe te voegen aan de tabel uit de vorige oefening:

- Het kunstwerk _Guernica_ van Pablo Picasso, met een waarde van 2 miljoen.
- Het kunstwerk _De Denker_ van Auguste Rodin, met een waarde van 1 miljoen.
- Het kunstwerk _Mona Lisa_ van Leonardo Da Vinci, met een waarde van 2 miljoen.

Voer je code uit wanneer je klaar bent om ze te testen. Controleer de output van je script. Indien de instructie mis loopt, lees dan de foutmelding en probeer het probleem op te lossen. Sla je uiteindelijke script op onder Databanken/Labo 1/04.sql.

## Scripts

### Labo_01-01.01__debug.sql

```sql
use DbLabo01;
drop table if exists Boeken;
create table Boeken (Titel varchar(100), Uitgeverij varchar(100), Jaartal smallint unsigned);



-- we willen uitdrukken dat het boek 50 jaar geleden is verschenen
-- maar we willen het rekenwerk niet zelf doen!
insert into Boeken (Titel, Uitgeverij, Jaartal) values (Fabels, Editions Minuit, '2021-50');
```

### Labo_01-01.02__debug.sql

```sql
use DbLabo01;

SeLeCT titel from boeken;
```

### Labo_01-01.03__debug.sql

```sql
use DbLabo01;
insert into boeken values ('De geschiedenis van Rock 'n Roll', 'De Hasque', 2011');
drop table if exists Liedjes;
CREATE TABLE Liedjes(Titel VARCHAR(100), Duurtijd int);
-- het liedje duurt vijf minuten
insert into liedjes values ('Ain't talkin' 'bout Love', 5 * 60);
```

