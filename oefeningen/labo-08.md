---
title: "Labo 08 - apTunes: joins"
sidebar_position: 9
---

# Labo 08 - apTunes: joins

_Bron: Labo 08._

Dit labo werkt rond het **apTunes-project**. De opgaven staan in de cursus, in de sectie [apTunes - veel-op-veel relaties en joins](/docs/my-sql/aptunes#veel-op-veel-m-op-n-relaties).

Voer eerst het bijhorende calibratiescript hieronder uit voor je aan de opgaven begint.

## Calibratiescript

Download dit script en voer het eerst uit. Het maakt de databank en tabellen aan en vult ze met de voorbeelddata voor dit labo.

- [Labo_08_Calibratie.sql](/downloads/oefeningen/labo-08/Labo_08_Calibratie.sql)

## Modeloplossingen

<details>
<summary>Toon modeloplossingen</summary>

```sql
-- ===== aptunes__0035.sql =====
CREATE TABLE GebruikerHeeftAlbum(
Gebruikers_Id INT NOT NULL, 
Albums_Id INT NOT NULL, 
DatumToevoeging DATETIME NOT NULL,
CONSTRAINT fk_GebruikerHeeftAlbum_Gebruikers FOREIGN KEY (Gebruikers_Id) REFERENCES Gebruikers(Id),
CONSTRAINT fk_GebruikerHeeftAlbum_Albums FOREIGN KEY (Albums_Id) REFERENCES Albums(Id));


-- ===== aptunes__0037.sql =====
CREATE TABLE LiedjeOpAlbum(
Liedjes_Id INT NOT NULL, 
Albums_Id INT NOT NULL, 
Tracknummer INT,
CONSTRAINT fk_LiedjeOpAlbum_Liedjes FOREIGN KEY (Liedjes_Id) REFERENCES Liedjes(Id),
CONSTRAINT fk_LiedjeOpAlbum_Albums FOREIGN KEY (Albums_Id) REFERENCES Albums(Id));


-- ===== aptunes__0038.sql =====
-- Het is niet expliciet nodig om de verschillende velden op te sommen wanneer ieder veld een waarde krijgt, maar het mag uiteraard altijd.
-- INSERT INTO LiedjeOpAlbum (Liedjes_Id, Albums_Id, Tracknummer) 
INSERT INTO LiedjeOpAlbum  
VALUES
(4, 2, "4"),
(54, 9, "2");


-- ===== aptunes__0039.sql =====
CREATE TABLE GebruikerHeeftLiedje(
Gebruikers_Id INT NOT NULL, 
Liedjes_Id INT NOT NULL, 
Favoriet INT NOT NULL,
CONSTRAINT fk_GebruikerHeeftLiedje_Gebruikers FOREIGN KEY (Gebruikers_Id) REFERENCES Gebruikers(Id),
CONSTRAINT fk_GebruikerHeeftLiedje_Albums FOREIGN KEY (Liedjes_Id) REFERENCES Liedjes(Id));


-- ===== aptunes__0040.sql =====
INSERT INTO GebruikerHeeftLiedje (Gebruikers_Id, Liedjes_Id, Favoriet) 
VALUES
(2, 7, 0),
(1, 97, 1);
```

</details>
