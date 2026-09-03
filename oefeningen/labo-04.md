---
title: Labo 04 - DDL + SELECT
sidebar_position: 5
---

# Labo 04 - DDL + SELECT

_Bron: Labo 04._

## Oefening Labo 04-01

Maak eerst een map “Labo 4” in je map voor het vak “Databanken”. Je werkt verder vanaf de data die je in labo 3 hebt aangemaakt.

Maak een tabel `Games`. Elke game heeft een titel (tot 100 karakters), een releasedatum (je mag veronderstellen een tijdstip) en een genre (tot 20 karakters). Games hebben normaal ook een uitgever (tot 100 karakters), maar sommige games hebben er geen omdat ze onafhankelijk zijn uitgegeven. Dan blijft die kolom leeg.

Plaats hierin volgende games (je mag veronderstellen dat de release telkens om middernacht is) met dezelfde kolomnamen die hier gegeven zijn:

<table><thead><tr><th>Titel</th><th>Releasedatum</th><th>Genre</th><th>Uitgever</th></tr></thead><tbody><tr><td>The Diofield Chronicle</td><td>22 september 2022</td><td>strategy</td><td>Square Enix</td></tr><tr><td>Beacon Pines</td><td>22 september 2022</td><td>adventure</td><td><em>ontbrekende waarde</em></td></tr><tr><td>Mario vs. Rabbids: Sparks of Hope</td><td>21 oktober 2022</td><td>strategy</td><td>Ubisoft</td></tr></tbody></table>

Sla alle instructies op in één script, genaamd 04-01.sql.

## Oefening Labo 04-02

Toon alle games met een uitgever.

Je krijgt:

<table><thead><tr><th>Titel</th><th>Releasedatum</th><th>Genre</th><th>Uitgever</th></tr></thead><tbody><tr><td>The Diofield Chronicle</td><td>22 september 2022</td><td>strategy</td><td>Square Enix</td></tr><tr><td>Mario vs. Rabbids: Sparks of Hope</td><td>21 oktober 2022</td><td>strategy</td><td>Ubisoft</td></tr></tbody></table>

Sla je instructie op in één script, genaamd 04-02.sql.

## Oefening Labo 04-03

Toon alle games zonder uitgever.

Je krijgt:

<table><thead><tr><th>Titel</th><th>Releasedatum</th><th>Genre</th><th>Uitgever</th></tr></thead><tbody><tr><td>Beacon Pines</td><td>22 september 2022</td><td>adventure</td><td>NULL</td></tr></tbody></table>

Sla je instructie op in één script, genaamd 04-03.sql.

## Oefening Labo 04-04

Pas de bestaande tabel Games aan zodat er ook een kolom is voor de ontwikkelaar (maximum 100 tekens). Voor “The Diofield Chronicle” is dit “Lancarse”. Voor “Beacon Pines” is het “Hiding Spot” en voor “Mario vs. Rabbids: Sparks of Hope” is het ook “Ubisoft”.

Zorg ervoor dat de ontwikkelaar altijd verplicht ingevuld moet zijn.

Je hebt hier meerdere instructies nodig. Sla ze op in één script, genaamd 04-04.sql.

## Oefening Labo 04-05

Het blijkt dat Square Enix failliet is gegaan. We wensen deze uitgever dan ook niet meer bij te houden in ons systeem. Schrap deze uitgever uit elke rij.

Je krijgt dus:

<table><thead><tr><th>Titel</th><th>Releasedatum</th><th>Genre</th><th>Uitgever</th></tr></thead><tbody><tr><td>The Diofield Chronicle</td><td>22 september 2022</td><td>strategy</td><td><em>ontbrekende waarde</em></td></tr><tr><td>Beacon Pines</td><td>22 september 2022</td><td>adventure</td><td><em>ontbrekende waarde</em></td></tr><tr><td>Mario vs. Rabbids: Sparks of Hope</td><td>21 oktober 2022</td><td>strategy</td><td>Ubisoft</td></tr></tbody></table>

Sla de instructie(s) op in 04-05.sql.

## Oefening Labo 04-06

Voer het script `calibratie.sql` uit, dat je in bijlage terugvindt bij deze labo-opgave.

Toon alfabetisch de titel van alle liedjes zonder artiest en zonder album. Je zou moeten krijgen:

<table><thead><tr><th>Titel</th></tr></thead><tbody><tr><td>Aeroplane Flies High</td></tr><tr><td>All Dead, All Dead</td></tr><tr><td>Bye, Bye Brasil</td></tr><tr><td>De Ja Vu</td></tr><tr><td>For Those About To Rock (We Salute You)</td></tr></tbody></table>

...

Sla de instructie(s) op in 04-06.sql.

## Oefening Labo 04-07

Wis alle liedjes uit het systeem die maximum 3 minuten duren en waarvoor geen album voorzien is.

Ter controle: een voorbeeld van zo’n liedje is “Take It Or Leave It” van “JET”. Dat zou na je script verdwenen moeten zijn.

Sla op als 04-07.sql.

## Oefening Labo 04-08

Verander de naam van de kolom `Royalties` naar `VergoedingArtiest`. Het soort data in deze kolom blijft ongewijzigd.

Noem je file 04-08.sql.

## Bestanden

- [Labo_4_calibratie.sql](/downloads/oefeningen/labo-04/Labo_4_calibratie.sql)

