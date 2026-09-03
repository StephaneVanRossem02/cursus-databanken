---
title: Labo 19 - Cursors
sidebar_position: 20
---

# Labo 19 - Cursors

_Bron: Labo 19._

Schrijf een stored procedure, DangerousInsertAlbumreleases. Deze
stored procedure voegt drie willekeurige albumreleases in, maar
signaleert ook met een kans van 1 op 3 een SQL state ‘45000’ na het
invoegen van de tweede albumrelease.

Om een willekeurige albumrelease te maken, kan je volgende procedure
gebruiken:

```sql
USE `aptunes`;
DROP procedure IF EXISTS `MockAlbumReleaseAlt`;

DELIMITER $$
USE `aptunes`$$
CREATE PROCEDURE `MockAlbumReleaseAlt` ()
SQL SECURITY INVOKER
BEGIN
declare Albums_Id int;
declare Bands_Id int;
select Id from Albums order by rand() limit 1 into Albums_Id;
select Id from Bands order by rand() limit 1 into Bands_Id;
insert into Albumreleases (Bands_Id, Albums_Id)
values
(Bands_Id, Albums_Id);
END$$

DELIMITER ;
```

Schrijf in je zelf geschreven stored procedure een handler zodat het
niet mogelijk is dat er slechts één of twee albumreleases worden
ingevoegd. Als er iets mis loopt, mag er geen enkele nieuwe release zijn
toegevoegd. In plaats daarvan wordt deze foutboodschap getoond: “Nieuwe
releases konden niet worden toegevoegd.”

Let op: SQL state ‘45000’ is niet het enige foutsignaal dat je hier
kan krijgen, want het kan bijvoorbeeld ook zijn dat een willekeurige
albumrelease al in het systeem zit. Schrijf je handler zo dat alle
fouten worden tegengehouden: via SQLEXCEPTION dus.

Lees voor je deze oefening maakt zeker de instructies rond het
correct uitvoeren van een ROLLBACK na.

Schrijf een stored procedure, `Welcome`, die een
promotiebericht toont dat je aan toekomstige gebruikers van je systeem
zou kunnen tonen.

Dit bericht lijst alle genres in het systeem op in volgende vorm:
“Welkom bij APTunes! Wij hebben Blues, Classical, Country, Electronic,
Folk, Hip-hop, Jazz, New age, Reggae, Rock”

Maak hierbij gebruik van een cursor. Je mag ook veronderstellen dat
er niet zo veel genres zijn dat je meer dan 1000 karakters nodig hebt
voor het bericht.

**Doordenker:** kan je dit ook zonder cursor, met
`GROUP_CONCAT`? Probeer het als deze oefening vlot gaat.

Schrijf een stored procedure, `AltWelcome`, die een
alternatief promotiebericht aan de gebruikers van je systeem zou kunnen
tonen.

Dit bericht toont automatisch de namen van de drie meest bekende
bands in het systeem. Voor ons betekent dit: de drie bands met het
hoogste aantal nummers. Doe dit opnieuw met een cursor.

Dit bericht ziet er bijvoorbeeld zo uit: “Welkom bij APTunes! Wij
hebben de nieuwste nummers van matrix innovative portals, engage
end-to-end-schemas, integrate front-end functionalities”.

Schrijf een stored procedure waarmee je zelf de lidmaatschappen van
muzikanten kan exporteren naar CSV-formaat. Dit zou je dan bijvoorbeeld
kunnen importeren in een Excel of ander programma dat CSV
ondersteunt:

Schrijf (en test) eerst een query om artiesten met bijbehorende bands
samen te tonen in volgend formaat:

<table style="width:100%;"><colgroup><col style="width: 16%" /><col style="width: 16%" /><col style="width: 16%" /><col style="width: 16%" /><col style="width: 16%" /><col style="width: 16%" /></colgroup><thead><tr class="header"><th>Voornaam</th><th>Familienaam</th><th>Geboortedatum</th><th>Naam</th><th>Startdatum</th><th>Einddatum</th></tr></thead><tbody><tr class="odd"><td>…</td><td>…</td><td>…</td><td>…</td><td>…</td><td>…</td></tr></tbody></table>

Schrijf dan een stored procedure met één outputparameter van type
`TEXT` (voor de volledige CSV-voorstelling).

Maak in deze stored procedure een cursor voor de query hierboven.
Zorg eerst dat je alleen de voornaam en familienaam op elke rij krijgt.
Gebruik op het einde van elke regel `\n`.

Test je procedure.

Als dat lukt, zet je deze tussen dubbele aanhalingstekens. Als ze
zelf al aanhalingstekens bevatten (bijvoorbeeld omwille van een
bijnaam), worden deze verdubbeld, bijvoorbeeld:
`"Bruce ""The Boss"""` Gebruik hiervoor
`replace`.

Test je procedure.

Als dat lukt, voeg dan alle niet-nullable kolommen toe.

Test je procedure.

Als dat lukt, voeg dan `Einddatum` toe. Zorg dat
`NULL` juist wordt weergegeven via `coalesce`.

Test een laatste keer je procedure.

## Bestanden

- [Labo19_Calibratie.sql](/downloads/oefeningen/labo-19/Labo19_Calibratie.sql)

