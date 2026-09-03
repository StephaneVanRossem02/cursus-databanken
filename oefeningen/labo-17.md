---
title: Labo 17
sidebar_position: 18
---

# Labo 17

_Bron: Labo 17._

We werken verder vanaf de data van het vorige labo. Denk eraan steeds de `aptunes`
database te gebruiken. Nummer al je scripts vanaf 01.sql.

## MockAlbumreleases

Schrijf een stored procedure, `MockAlbumreleases`. Deze
zal in één keer een heleboel testdata toevoegen aan het systeem. Dit
gaat als volgt:

- Definieer de stored procedure met één input parameter
`extraReleases`. Deze is van het type `INT`.
- Declareer een lokale variabele `counter`.
- Schrijf een `REPEAT` waarin
`MockAlbumreleaseWithSuccess` (van vorig labo) wordt
opgeroepen en waarin de teller enkel verhoogd wordt als het lukt om een
nieuwe release toe te voegen.
- Zorg dat de lus eindigt wanneer het gewenste aantal releases is
toegevoegd.

## MockAlbumreleasesLoop

Herschrijf de vorige oefening nu met een `LOOP` in plaats
van een `REPEAT`. De werking blijft exact dezelfde.

Schrijf een stored function `PercentageOf`. Hiermee kan je
een bepaald percentage van een getal uitrekenen. Het percentage geef je
eerst mee en is een geheel getal, het getal waarvan je dat percentage
wil uitrekenen is het tweede argument. Dit is een
`DOUBLE`.

Bijvoorbeeld: `SELECT PercentageOf(50, 60)` zal
`30` op het scherm tonen.

Als een van de twee getallen NULL is, signaleer je foutcode
‘45000’.

Schrijf een stored function `RandUpTo`. Deze genereert een
willekeurig geheel getal tussen 1 en het meegegeven gehele getal. Als de
bovengrens NULL is of kleiner is dan 1, signaleer je foutcode
‘45000’.

Tips:

- `RAND()` genereert een willekeurig getal tussen 0 en 1
(maar nooit exact 1)
- `FLOOR()` laat de cijfers na de komma vallen

Schrijf een stored function `RandBetween`. Deze genereert
een willekeurig geheel getal tussen twee meegegeven getallen. Als het
eerste getal groter dan het tweede is of als een van de twee NULL is,
signaleer je foutcode ‘45000’.

Tip: Begin door het verschil tussen de twee getallen te berekenen.
Maak daarna gebruik van `RandUpTo` uit de vorige vraag.

Schrijf een stored procedure `ConvertFeetToMeters`. Deze
verwacht twee gehele getallen: een aantal voet (feet) en een aantal duim
(inches). Als uitvoer levert ze het aantal meter, afgerond tot op twee
cijfers na de komma. Als een van de meegegeven getallen NULL is,
signaleer je foutcode ‘45000’. 1 voet is 0.3048 meter. 1 duim is 0.0254
meter.

Schrijf een stored procedure, `DemonstrateHandlerOrder`,
zonder parameters. In deze stored procedure wordt eerst een willekeurig
getal tussen 1 en 3 berekend (zie vorige reeks oefeningen). Voeg dan een
`IF ... ELSE IF ... ELSE ...` toe. Als het berekende getal 1
is, wordt er een signaal met SQL state ‘45001’ gegeven. Als het getal 2
is, wordt een signaal met SQL state ‘45002’ gegeven en als het getal 3
is, wordt een signaal met state ‘45003’ gegeven.

Voeg daarna in je procedure exact twee handlers toe. Eén is specifiek
voor SQL state ‘45002’, de andere houdt alle SQL exceptions tegen. De
eerste handler handelt de fout af door volgende tekst te tonen via
`SELECT`: “State 45002 opgevangen. Geen probleem.” De tweede
handler toont op dezelfde manier volgende bericht: “Een algemene fout
opgevangen.”

Test je procedure nadat je ze hebt geschreven! Zorg dat je beide
boodschappen te zien krijgt!

Pas je handler voor de fouten ‘45001’ en ‘45003’ aan zodat er geen
SELECT meer plaatsvindt. In de plaats daarvan verschijnt de foutmelding
in Workbench, met de tekst “Ik heb mijn best gedaan!” Zie hiervoor
RESIGNAL.

Schrijf nu een nieuwe procedure
`MockAlbumreleasesAlternative` om verzonnen releases toe te
voegen. Deze heeft als parameter het **maximaal** aantal
nieuwe releases. Het daadwerkelijke aantal ligt tussen 1 en dit maximale
aantal.

Deze nieuwe procedure maakt geen gebruik van
`MockAlbumreleaseWithSuccess`. Je zal error handling moeten toepassen voor dubbele releases.
