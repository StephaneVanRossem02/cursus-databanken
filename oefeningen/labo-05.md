---
title: Labo 05 - SELECT
sidebar_position: 6
---

# Labo 05 - SELECT

_Bron: Labo 05._

## Oefening 05-01

Laat zien hoeveel liedjes er in het systeem staan. Het zouden er 3123 moeten zijn.

## Oefening 05-02

Laat zien welk getal je krijgt als je alle royalties op nummers van Led Zeppelin optelt. Dat zou 4905 moeten zijn.

## Oefening 05-03

Laat zien hoeveel nummers in het systeem zijn uitgekomen voor 1990. Het zouden er 1804 moeten zijn. Nummers uitgekomen in 1990 horen hier dus niet bij.

## Oefening 05-04

Laat nu tegelijkertijd zien hoeveel nummers er voor 1990 zijn uitgekomen en hoeveel nummers vanaf 1990. Nummers uitgekomen in 1990 vallen onder "vanaf 1990".

Je zou moeten zien:

<table><thead><tr><th>Aantal nummers</th></tr></thead><tbody><tr><td>1804</td></tr><tr><td>1319</td></tr></tbody></table>

De hoofding is hier aangepast met `AS`.

## Oefening 05-05

Laat per genre zien hoeveel nummers er in het systeem zijn. Toon van kleinere naar grotere aantallen.

Het resultaat zou moeten zijn:

<table><thead><tr><th>Aantal</th><th>Genre</th></tr></thead><tbody><tr><td>20</td><td>Rap</td></tr><tr><td>30</td><td>Electro</td></tr><tr><td>47</td><td>Pop</td></tr><tr><td>94</td><td>Blues</td></tr><tr><td>126</td><td>Klassiek</td></tr><tr><td>129</td><td>Jazz</td></tr><tr><td>402</td><td>Metal</td></tr><tr><td>604</td><td>Wereldmuziek</td></tr><tr><td>1671</td><td>Rock</td></tr></tbody></table>

## Oefening 05-06

Herschrijf volgende query zonder `DISTINCT` zodat je toch nog hetzelfde resultaat krijgt:

```sql
SELECT DISTINCT Artiest
FROM Liedjes;
```

## Oefening 05-07

Toon het aantal artiesten in het systeem. Dit is 180.

## Oefening 05-08

Toon alle genres waarvan de nummers gemiddeld minstens 5 minuten duren, in volgorde van hun gemiddelde duurtijd. Het resultaat is (met aanpassing van de hoofdingen, die je zelf ook zou moeten doen):

<table><thead><tr><th>Genre</th><th>Gemiddelde duurtijd</th></tr></thead><tbody><tr><td>Electro</td><td>302.5000</td></tr><tr><td>Metal</td><td>308.3781</td></tr><tr><td>Klassiek</td><td>1450.3254</td></tr></tbody></table>

## Oefening 05-09

Toon per decennium het aantal uitgebrachte nummers, maar enkel als dat aantal minstens 450 bedraagt. Om dit klaar te spelen, moet je het jaartal herleiden tot het decennium. Dit kan je doen met de functie `TRUNCATE`. Bijvoorbeeld: `TRUNCATE(1973,-1)` levert 1970 als resultaat. Toon de resultaten chronologisch.

Het resultaat zou moeten zijn:

<table><thead><tr><th>Decennium</th><th>Aantal nummers</th></tr></thead><tbody><tr><td>1960</td><td>474</td></tr><tr><td>1970</td><td>455</td></tr><tr><td>1980</td><td>451</td></tr><tr><td>1990</td><td>457</td></tr></tbody></table>

## Oefening 05-10

Het blijkt dat erg lange klassieke nummers niet erg winstgevend zijn. Toon daarom alfabetisch alle artiesten die klassieke nummers hebben, maar enkel als hun klassieke nummers ook gemiddeld langer dan 8 minuten duren.

Het resultaat is:

<table><thead><tr><th>Artiest</th></tr></thead><tbody><tr><td>Chicago Symphony Orchestra &amp; Fritz Reiner</td></tr><tr><td>Emanuel Ax, Eugene Ormandy &amp; Philadelphia Orchestra</td></tr><tr><td>Felix Schmidt, London Symphony Orchestra &amp; Rafael Frühbeck de Burgos</td></tr><tr><td>Heroes</td></tr><tr><td>Leonard Bernstein &amp; New York Philharmonic</td></tr><tr><td>Lost</td></tr><tr><td>Mela Tenenbaum, Pro Musica Prague &amp; Richard Kapp</td></tr><tr><td>Richard Marlow &amp; The Choir of Trinity College, Cambridge</td></tr><tr><td>Scholars Baroque Ensemble</td></tr></tbody></table>

## Oefening 05-11

Toon, van Z naar A, alle albums met rocknummers op die de eigenaar in totaal meer dan 300 eurocent aan royalties opleveren als een gebruiker ze volledig beluistert.

Deze albums zijn:

<table><thead><tr><th>Album</th></tr></thead><tbody><tr><td>The Song Remains The Same (Disc 2)</td></tr><tr><td>The Song Remains The Same (Disc 1)</td></tr><tr><td>Presence</td></tr><tr><td>Physical Graffiti [Disc 2]</td></tr><tr><td>Led Zeppelin III</td></tr><tr><td>Led Zeppelin II</td></tr><tr><td>Led Zeppelin I</td></tr><tr><td>IV</td></tr><tr><td>In Through The Out Door</td></tr><tr><td>Greatest Hits</td></tr><tr><td>BBC Sessions [Disc 2] [Live]</td></tr><tr><td>BBC Sessions [Disc 1] [Live]</td></tr></tbody></table>

## Oefening 05-12

Toon per genre het hoogste aantal royalties dat één nummer heeft. Neem hierbij enkel de genres in beschouwing waarvan nummers gemiddeld 4 minuten of langer duren en negeer liedjes waarvoor de royalties niet ingevuld werden. Orden van laagste naar hoogste royalties.

Het antwoord:

<table><thead><tr><th>Genre</th><th>Hoogste royalties</th></tr></thead><tbody><tr><td>Blues</td><td>38</td></tr><tr><td>Metal</td><td>49</td></tr><tr><td>Klassiek</td><td>102</td></tr><tr><td>Rock</td><td>193</td></tr></tbody></table>

## Bestanden

- [Labo_05_Calibratie.sql](/downloads/oefeningen/labo-05/Labo_05_Calibratie.sql)

