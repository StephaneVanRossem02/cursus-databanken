---
title: Labo 10 - JOINs
sidebar_position: 11
---

# Labo 10 - JOINs

_Bron: Labo 10._

## Calibratiescript

Download dit script en voer het eerst uit. Het maakt de databank en tabellen aan en vult ze met de voorbeelddata voor dit labo.

- [Labo_10_Calibratie.sql](/downloads/oefeningen/labo-10/Labo_10_Calibratie.sql)

## Oefening Labo 10-01

Toon hoe veel albums elke gebruiker heeft. Je moet dus naast de naam
van elke gebruiker een getal zien staan. Noem je script `07.sql`.

### Uitvoer

<table><thead><tr><th>Gebruikersnaam</th><th>Aantal albums</th></tr></thead><tbody><tr><td>musicfan111</td><td>151</td></tr><tr><td>tuneBoY5</td><td>164</td></tr><tr><td>drbeatz</td><td>164</td></tr><tr><td>trebletrouble</td><td>151</td></tr><tr><td>neverloudenough</td><td>164</td></tr></tbody></table>

## Oefening Labo 10-02

Toon alle combinaties van een gebruiker en een album in de collectie
van diezelfde gebruiker. Je moet dus naast de naam van elke gebruiker
een titel zien staan. Noem je script `08.sql`.

De eerste paar rijen zijn (al kan jouw resultaatvolgorde variëren):

<table><thead><tr><th>Gebruikersnaam</th><th>Album</th></tr></thead><tbody><tr><td>musicfan111</td><td>Live After Death</td></tr><tr><td>musicfan111</td><td>Live At Donington 1992 (Disc 1)</td></tr><tr><td>musicfan111</td><td>Live At Donington 1992 (Disc 2)</td></tr><tr><td>musicfan111</td><td>No Prayer For The Dying</td></tr></tbody></table>

## Oefening Labo 10-03

Toon alle combinaties van gebruikers en hun favoriete liedjes. In
deze dataset hebben maar één gebruiker een favoriet los nummer. Noem je
script `09.sql`.

**Let op:** het calibratiescript heeft een bepaalde afspraak rond naamgeving niet helemaal gevolgd. We hebben de fout laten
staan, omdat het een goede test is of je de werking van JOIN wel
begrijpt.

Het resultaat:

<table><thead><tr><th>Gebruikersnaam</th><th>Titel</th></tr></thead><tbody><tr><td>musicfan111</td><td>Eat The Rich</td></tr></tbody></table>

## Oefening Labo 10-04

Laat voor elke artiest het hoogste aantal royalties zien dat deze
voor één liedje verdient. Noem je script `10.sql`.

Voorbeelduitvoer:

<table><thead><tr><th>Artiest</th><th>Hoogste royalties</th></tr></thead><tbody><tr><td>Claude Debussy</td><td>4</td></tr><tr><td>Led Zeppelin</td><td>100</td></tr><tr><td>Blues Pills</td><td>18</td></tr><tr><td>Ghostface Killah</td><td>8</td></tr><tr><td>AC/DC</td><td>22</td></tr></tbody></table>

## Oefening Labo 10-05

Laat per album zien hoe lang het langste liedje op dat album duurt.
Noem je script `11.sql`.

Gedeeltelijke uitvoer:

<table><thead><tr><th>Albumtitel</th><th>Langste duurtijd</th></tr></thead><tbody><tr><td>Verzameld werk van Debussy</td><td>160</td></tr><tr><td>Led Zeppelin IV</td><td>420</td></tr><tr><td>Blues Pills</td><td>300</td></tr><tr><td>Lady in Gold</td><td>300</td></tr><tr><td>Supreme Clientele</td><td>99</td></tr></tbody></table>

## Oefening Labo 10-06

**Deze oefening is een uitdaging. Ze is moeilijker dan een
examenvraag. De ideeën in de cursus volstaan, maar er is geen voorbeeld
dat je rechtstreeks kan aanpassen. Je moet nadenken over verschillende
constructies die je tot hiertoe gezien hebt.**

Toon hoe veel albums van elke artiest elke gebruiker heeft. Toon ze
van grootste naar kleinste aantal.

<table><thead><tr><th>Gebruikersnaam</th><th>Artiest</th><th>Aantal albums van deze artiest in de collectie</th></tr></thead><tbody><tr><td>tuneBoY5</td><td>Iron Maiden</td><td>21</td></tr><tr><td>trebletrouble</td><td>Iron Maiden</td><td>21</td></tr><tr><td>neverloudenough</td><td>Iron Maiden</td><td>21</td></tr><tr><td>neverloudenough</td><td>Led Zeppelin</td><td>14</td></tr><tr><td>musicfan111</td><td>Iron Maiden</td><td>13</td></tr></tbody></table>
