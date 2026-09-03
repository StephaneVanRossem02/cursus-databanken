---
title: Labo 14 - Subqueries
sidebar_position: 15
---

# Labo 14 - Subqueries

_Bron: Labo 14._

We werken met de `aptunes`-database. **Activeer deze
database in elk script.** Gebruik telkens het meest specifieke
parametertype dat je kan toepassen. Gebruik dus geen `INOUT`
parameters als het ook met een gewone `IN` of
`OUT` parameter kan.

Wanneer gevraagd wordt om de SQL-code voor een script op te slaan,
moet dat de **uitvoerbare** code zijn. Dat wil zeggen: de
code die door de stored procedure editor gegenereerd wordt, met gebruik
van de `DELIMITER $$` instructie enzovoort.

Schrijf een stored procedure `GetLiedjes` met één
parameter (bepaal zelf de juiste “richting”, het type is
`VARCHAR(50)`). Deze toont je alle titels van liedjes waarin
een meegegeven stuk tekst voorkomt.

Bijvoorbeeld: `CALL GetLiedjes('web')` toont je alle
liedjes in het systeem die het woordje “web” in de titel bevatten
(vooraan, achteraan, in het midden,…).

Het outputformaat is:

<table><thead><tr class="header"><th style="text-align: left;">Titel</th><th style="text-align: left;"></th></tr></thead><tbody><tr class="odd"><td style="text-align: left;">…</td><td style="text-align: left;">(hier staan normaal meerdere rijen)</td></tr></tbody></table>

Plaats enkel de definitie in het script, geen oproep. Noem het script
dat voor de definitie zorgt `01.sql`.

Schrijf een stored procedure, `NumberOfGenres`, die je
vertelt hoeveel verschillende genres er zijn. Het aantal zal een
`TINYINT` zijn.

Je moet ze als volgt kunnen oproepen:
`CALL NumberOfGenres(@Aantal)`. De procedure toont niets,
maar nadat ze is uitgevoerd, moet de gebruiker
`SELECT @Aantal` kunnen uitvoeren.

Plaats enkel de definitie in het script, geen oproep. Noem het script
dat voor de definitie zorgt `02.sql`.

Schrijf een stored procedure, `CleanupOldMemberships`.
Deze doet twee dingen:

- Ze verwijdert alle lidmaatschappen van muzikanten die beëindigd zijn
voor een gegeven datum.

Lidmaatschappen met einddatum `NULL` blijven sowieso
staan, want die zijn nog niet beëindigd.

Ze vertelt ons via een parameter van type INT hoe veel
lidmaatschappen tijdens de uitvoering zijn verwijderd.

Je moet ze als volgt kunnen oproepen:
`CALL CleanupOldMemberships(someDate,@numberCleaned)`.

Er verschijnt niets op het scherm wanneer je de stored procedure
oproept. Je zou `SELECT @numberCleaned` moeten doen om te
weten hoe veel lidmaatschappen verwijderd zijn.

Tip: je kan niet meer zien hoe veel lidmaatschappen verwijderd zijn
als ze al weg zijn, dus hou eerst de waarde bij en verwijder dan pas de
lidmaatschappen…

Plaats enkel de definitie in het script, geen oproep. Noem het script
dat voor de definitie zorgt `03.sql`.

Schrijf een stored procedure, `CreateAndReleaseAlbum`.
Deze maakt een nieuw album aan en koppelt het meteen aan een artiest
door ook een record toe te voegen aan `Albumreleases`.

Deze procedure heeft twee parameters: een parameter
`titel` voor de titel (van type `VARCHAR(100)`) en
een parameter `bands_Id` (van type `INT`). Ze
levert geen output en je het is mogelijk dat meerdere personen
tegelijkertijd gebruik maken van de database.

Plaats enkel de definitie in het script, geen oproep. Noem het script
dat voor de definitie zorgt `04.sql`.

��Extra info
We zullen gebruik maken van stored procedures om testdata te
genereren. In het Engels wordt hier vaak over mock data
gesproken. Dit is erg nuttig om te experimenteren met een database. Het
is ook wat wij als lectoren doen om een grote database zoals aptunes op
te vullen.
Deze data hoeft geen steek te houden, maar ze moet voldoende
gevarieerd zijn. Daarom voeren we willekeurige waarden in. Met de
functie RAND() kan je een willekeurig getal tussen 0 en 1
genereren. Exact 0 kan gegenereerd worden, maar exact 1 niet.
Als je een willekeurig record uit een bepaalde tabel wil genereren,
kan dat dus met volgende instructie:
SELECT *
FROM EenTabel
ORDER BY RAND()
LIMIT 1;
Opdracht
Bekijk de tabel Albumreleases. Je zal merken dat deze
nog leeg is. We zouden deze graag opvullen met geldige waarden. Deze
hoeven niet overeen te stemmen met de werkelijkheid, maar de tabel bevat
foreign key kolommen dus we mogen er enkel waarden in plaatsen die
ergens anders een primary key vormen.
Schrijf een stored procedure,MockAlbumrelease, die een
nieuwe albumrelease zal toevoegen. Deze werkt als volgt:

Ze declareert twee variabelen van type INT:
randomAlbumId en randomBandId. De beginwaarde
hiervan is 0.
Ze past randomAlbumId aan naar het ID van een
willekeurig album.
Ze past randomBandId aan naar het ID van een
willekeurig band.
Als (randomAlbumId,randomBandId) nog niet voorkomt in
de tabel Albumreleases, voegt ze deze combinatie toe door
middel van een INSERT. Je moet hier zelf gebruik maken van
een IF, een IN en een subquery (op
Albumreleases) om te beslissen of de insert mag
plaatsvinden. Je hoeft niets te doen als de release al bestaat. Test
bijvoorbeeld eerst volgende instructie:
select (1001, 3001) in (select Bands_Id, Albums_Id from Albumreleases);.
Je zal zien dat het resultaat 0 (FALSE) of 1
(TRUE) is.

Plaats enkel de definitie in het script, geen oproep. Noem het script
dat voor de definitie zorgt 05.sql. Test je procedure uit
door ze enkele keren op te roepen en dan Albumreleases te
bekijken. Na calibratie was deze tabel leeg, dus na enkele calls zouden
er een paar records moeten staan.


Het nadeel van onze stored procedure uit vraag 5 is dat we
combinaties kunnen genereren die al aanwezig zijn. Dan gebeurt er niets.
Als we een exact aantal mock releases willen toevoegen, is dat erg
vervelend.

Kopieer je definitie uit de vorige oefening en noem de stored
procedure ditmaal `MockAlbumreleaseWithSuccess`. Voorzie ze
van een output parameter met naam `success` van type
`BOOL`. Zet deze op `1` als de `INSERT`
plaatsvindt en zet anders op `0`.

Plaats enkel de definitie in het script, geen oproep. Noem het script
dat voor de definitie zorgt `06.sql`.

Schrijf een stored procedure
`MockAlbumreleaseWithMessage`. Deze doet hetzelfde als
`MockAlbumreleaseWithSuccess`, maar in plaats van een
variabele een waarde te geven, toont ze een bericht dat aangeeft of de
instructie geslaagd is.

**Ga hiervoor niet copy-pasten!** Laat
`MockAlbumreleaseWithMessage` gebruik maken van
`MockAlbumreleaseWithSuccess`. Als het lukt een nieuwe
release aan te maken, krijg je de boodschap “Release geslaagd!” in het
datavenster van Workbench. Als het niet lukt, krijg je “Release kon niet
worden toegevoegd!”
