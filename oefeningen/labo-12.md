---
title: Labo 12 - Views
sidebar_position: 13
---

# Labo 12 - Views

_Bron: Opdrachten views._

Maak een view aan met naam `AuteursBoeken` waarmee je
makkelijk een overzicht kan vragen van welke auteur welk(e) boek(en)
heeft geschreven.

Je oplossing zou er exact zo moeten uitzien:

_(Bijhorende afbeelding niet beschikbaar in het bronmateriaal.)_

Noem je script 01.sql.

Pas, niet rechtstreeks in de tabel `Boeken` maar wel via
de view `AuteursBoeken`, de titel _Pet Sematary_ aan
naar _Pet Cemetery_.

Wat gebeurt er als je de naam “Stephen King” via deze view in “Steven
King” wil veranderen? Waarom, denk je?

Noem je script 02.sql.

We willen een complexere versie van de bestaande view
`AuteursBoeken`. We zullen hierbij ook de gemiddelde rating
van elk boek plaatsen in een uitgebreide versie van de view, namelijk
`AuteursBoekenRatings`. We zullen dit in stappen doen.
**Lees eerst de stappen, bekijk dan de figuren, voer dan de
stappen uit.**

- Gebruik een `ALTER VIEW` om je bestaande view
`AuteursBoeken` te voorzien van het `Id` uit de
tabel`Boeken`. Toon `Id` hier wel als
`Boeken_Id`. Noem het script dat de view aanpast
`3A.sql`.
- Maak een view `GemiddeldeRatings` aan op basis van
`Reviews`. Noem de kolom met het gemiddelde
`Rating`. Noem het script dat de view maakt
`3B.sql`.
- Maak de view`AuteursBoekenRatings` aan door een nieuwe
view te maken gebaseerd op `AuteursBoeken` en
`GemiddeldeRatings`. Noem het script dat de view maakt
`3C.sql`.

_(Bijhorende afbeelding niet beschikbaar in het bronmateriaal.)_

_(Bijhorende afbeelding niet beschikbaar in het bronmateriaal.)_

_(Bijhorende afbeelding niet beschikbaar in het bronmateriaal.)_

Maak een view `TakenVerdeling`, die aangeeft wie welke
taak uitvoert. Taken die niet toegewezen zijn en leden zonder taken
staan hier ook in.

Voorbeelduitvoer van een `SELECT`:

<table><thead><tr class="header"><th>Voornaam</th><th>Omschrijving</th></tr></thead><tbody><tr class="odd"><td>Yannick</td><td>frisdrank meebrengen</td></tr><tr class="even"><td>Bavo</td><td>bestek voorzien</td></tr><tr class="odd"><td>Max</td><td>aardappelsla maken</td></tr><tr class="even"><td>Herve</td><td>geen taak toegewezen</td></tr><tr class="even"><td>Taak niet toegewezen</td><td>papieren bordjes meebrengen</td></tr></tbody></table>

Noem je script `4.sql`.

Maak een view GamesOpPlatformen waarmee je makkelijk alle games met hun bijbehorende
platformen kan zien. Ook games voor niet meer ondersteunde platformen of
platformen zonder games moeten hier in staan.

Zorg dat de kolomnamen en tekst exact kloppen.

Voorbeelduitvoer van een `SELECT`:

<table><thead><tr class="header"><th>Titel</th><th>Naam</th></tr></thead><tbody><tr class="odd"><td>Anthem</td><td>PS4</td></tr><tr class="even"><td>Anthem</td><td>XBox one</td></tr><tr class="odd"><td>Anthem</td><td>Windows</td></tr><tr class="even"><td>…</td><td>…</td></tr><tr class="odd"><td>Mega Man 11</td><td>Switch</td></tr><tr class="even"><td>Oregon Trail</td><td>Platform niet meer ondersteund</td></tr></tbody></table>

Noem je script om deze view aan te maken `5.sql`.
**Het wordt aangeraden hierin hulpviews te definiëren om de taak
beter behapbaar te maken!**
