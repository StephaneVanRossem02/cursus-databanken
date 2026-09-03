---
title: Labo 09 - JOINs
sidebar_position: 10
---

# Labo 09 - JOINs

_Bron: Labo 09._

## Oefening 09-01



Toon met één instructie de titel en de artiest van alle liedjes. Maak hierbij gebruik van een inner join. Noem dit script `01.sql`.



De eerste paar rijen zijn:



<table><thead><tr><th>Titel</th><th>Artiest</th></tr></thead><tbody><tr><td>Clair de Lune</td><td>Claude Debussy</td></tr><tr><td>Suite bergamesqu</td><td>Claude Debussy</td></tr><tr><td>Stairway to Heaven</td><td>Led Zeppelin</td></tr><tr><td>When the Levee Breaks</td><td>Led Zeppelin</td></tr><tr><td>Little Sun</td><td>Blues Pills</td></tr></tbody></table>

## Oefening 09-02



Toon met één instructie de titel en de artiest van alle liedjes die beginnen met de letter “A”. Noem dit script `02.sql`.



De eerste paar rijen zijn:



<table><thead><tr><th>Titel</th><th>Artiest</th></tr></thead><tbody><tr><td>Amazing</td><td>Aerosmith</td></tr><tr><td>Angel</td><td>Aerosmith</td></tr><tr><td>All I Really Want</td><td>Alanis Morissette</td></tr><tr><td>Angela</td><td>Antônio Carlos Jobim</td></tr><tr><td>All For You</td><td>Black Label Society</td></tr></tbody></table>

## Oefening 09-03



Toon de titel van elk album naast de naam van de artiest. Noem dit script `03.sql`.



De eerste paar rijen zijn:



<table><thead><tr><th>Titel</th><th>Artiest</th></tr></thead><tbody><tr><td>Verzameld werk van Debussy</td><td>Claude Debussy</td></tr><tr><td>Led Zeppelin IV</td><td>Led Zeppelin</td></tr><tr><td>BBC Sessions [Disc 1] [Live]</td><td>Led Zeppelin</td></tr><tr><td>Physical Graffiti [Disc 1]</td><td>Led Zeppelin</td></tr><tr><td>BBC Sessions [Disc 2] [Live]</td><td>Led Zeppelin</td></tr></tbody></table>

## Oefening 09-04



Toon met één instructie hoe veel liedjes Led Zeppelin heeft. Het is niet toegelaten eerst het Id van Led Zeppelin op te zoeken. Noem je script `04.sql`.



Het antwoord is 90.

## Oefening 09-05



Toon de titel van elk liedje naast het Id van het album waarop dat liedje staat. Noem dit script `05.sql`. Hiervoor heb je de tabel `LiedjeOpAlbum` nodig. Je hebt nog maar één join nodig.



De eerste rijen van het resultaat:



<table><thead><tr><th>Liedje</th><th>Album</th></tr></thead><tbody><tr><td>Clair de Lune</td><td>1</td></tr><tr><td>Suite bergamesqu</td><td>1</td></tr><tr><td>Stairway to Heaven</td><td>2</td></tr><tr><td>When the Levee Breaks</td><td>2</td></tr><tr><td>Little Sun</td><td>3</td></tr></tbody></table>

## Oefening 09-06



Toon elk liedje naast de titel van het album waarop het liedje staat. Werk verder op basis van je vorige script. Noem dit script `06.sql`.



De eerste rijen zijn:



<table><thead><tr><th>Liedje</th><th>Album</th></tr></thead><tbody><tr><td>Clair de Lune</td><td>Verzameld werk van Debussy</td></tr><tr><td>Suite bergamesqu</td><td>Verzameld werk van Debussy</td></tr><tr><td>Stairway to Heaven</td><td>Led Zeppelin IV</td></tr><tr><td>When the Levee Breaks</td><td>Led Zeppelin IV</td></tr><tr><td>Little Sun</td><td>Blues Pills</td></tr></tbody></table>

## Bestanden

- [Labo_09_Calibratie.sql](/downloads/oefeningen/labo-09/Labo_09_Calibratie.sql)
- [Labo_09.mwb](/downloads/oefeningen/labo-09/Labo_09.mwb)

