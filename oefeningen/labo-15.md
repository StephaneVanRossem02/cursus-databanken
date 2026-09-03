---
title: Labo 15
sidebar_position: 16
---

# Labo 15

_Bron: Labo 15._

Noot: indien een stored procedure gevraagd wordt, slaag dan steeds het script op dat de stored procedure aanmaakt, en ook een script dat de stored procedure oproept om de werking ervan te demonstreren. Run het calibratiescript dat bij deze opgaven hoort, en bestudeer de structuur en inhoud van de databank:

## Opgave 1

Maak een view ‘Alle_Klanten’ die de gemeente en naam van alle klanten toont gesorteerd op gemeente, en vervolgens op klantnaam. Voorbeeld van output:

```
Gemeente   Naam
Aalst      Noor
Antwerpen  Elena
Antwerpen  Felix
Brugge     Mohammed
Brussel    Lina
Brussel    Yassin
…          …
```

## Opgave 2

Maak een view ‘Alle_Klanten_Brussel_Antwerpen’ die zich op de vorige view baseert, maar enkel klanten uit Brussel en Antwerpen weerhoudt. Voorbeeld van output:

```
Gemeente   Naam
Antwerpen  Elena
Antwerpen  Felix
Brussel    Lina
Brussel    Yassin
```

## Opgave 3

Maak een view ‘Aantal_Bestellingen_Per_Klant’ die voor elke klant die ooit bestellingen plaatste de naam toont, gevolgd door het aantal bestellingen. Sorteer op klantnaam. Voorbeeld van output:

```
Klant      Aantal bestellingen
Amina                              1
Amir                               4
Aya                                1
Elena                              3
…
           …
```

## Opgave 4

Maak een view ‘Klanten_Zonder_Bestellingen’ die hetzelfde doet als de vorige, maar enkel de naam van klanten toont die nooit een bestelling plaatsten, gevolgd door het cijfer 0. Voorbeeld van output:

```
                       Klant     Aantal bestellingen

                       Lotte                          0

                       Ayoub                          0

                       Sofia                          0

                       Ali                            0

                       …         …
```

## Opgave 5

Combineer de twee voorgaande views tot 1 view ‘Aantal_Bestellingen_Per_Klant_Alle’. Zorg

voor passende kolomhoofdingen. Toon de klanten in volgorde van hoe vaak ze een bestelling

plaatsten, en vervolgens alfabetisch op naam. Je mag gebruik maken van UNION ALL.

Voorbeeld van output:

```
                       Klant     Aantal bestellingen
                       Yassin                            6
                       Amir                              4
                       Elena                             3
                       Felix                             2
                       Amina                             1
                       Aya                               1
                       Lina                              1
                       Mohammed                          1
                       Oscar                             1
                       Adam                              0
                       Ali                               0
                       Amin                              0
                       …
                                 …
```

## Opgave 6

Maak een view ‘Goede_Klanten’ die alle klanten toont met het aantal bestellingen dat ze ooit plaatsten, als dat er minstens 3 zijn. Voorbeeld van output:

```
                       Klant     Aantal bestellingen
                       Yassin                            6
                       Amir                              4
                       Elena                             3
```

## Opgave 7

Maak een view ‘Alle_Bestellingen’ die voor elke klant zijn bestellingen toont (naam, gemeente, omschrijving van het product, en het aantal bestelde items van het product). Zorg ervoor dat je output er als volgt uitziet:

Naam Gemeente ProductOmschrijving Aantal Amina Mechelen Camera 5 Amir Gent Boekenbon 2 Amir Gent Camera Amir Gent Sneaker 15 Amir Gent Sportabonnement 14 Aya Leuven Koptelefoon 16 … … … 3 …

## Opgave 8

Maak een view ‘Alle_Grote_Bestellingen’ die voor elke klant een naam en gemeente toont, samen met het aantal en het product dat de klant bestelde, maar enkel indien het aantal bestelde items van het product groter is dan het gemiddelde aantal bestelde items per bestelling. Voorbeeld van output:

```
Naam   Gemeente   ProductOmschrijving      Aantal
Amir   Gent       Camera                         15
Amir   Gent       Sneaker                        14
Amir   Gent       Sportabonnement                16
Elena  Antwerpen  Boekenbon                      12
Elena  Antwerpen  Koptelefoon                    13
…      …          …
                                       …
```

## Opgave 9

Schrijf een stored procedure met de naam ‘zoek_klanten_op_naam’, waaraan je een zoekterm kan meesturen. De stored procedure toont een lijst van alle klanten waarvan de zoekterm in de naam voorkomt. Een voorbeeld van de output van het aanroepen van de SP met de zoekterm ‘na’:

Id Naam Gemeente 2 Lina Brussel 4 Elena Antwerpen 8 Amina Mechelen 20 Lina Kortrijk 22 Nina Roeselare

## Opgave 10

Schrijf een stored procedure met de naam ‘aantal_klanten’ die op het scherm toont hoeveel klanten er in de database zitten. Een voorbeeld van de output van het aanroepen van de SP:

@aantal 25

## Opgave 11

Schrijf een stored procedure met de naam ‘klanten_met_minimaal_X_bestellingen’ waarmee je een aantal kan meesturen. Zorg ervoor dat er een lijst wordt getoond van klanten die minimaal het meegestuurde aantal bestellingen plaatsten. Een voorbeeld van de output van het aanroepen van de SP met de waarde 4:

Klant Aantal bestellingen Amir 4 Yassin 6

## Opgave 12

Schrijf een stored procedure met de naam ‘toplijst_best_verkochte_producten’ waarmee je een aantal kan meesturen. Er wordt een lijst getoond waarin per product het aantal verkochte items getoond wordt, gesorteerd op meest verkochte producten. Het meegestuurde aantal bepaalt hoeveel rijen de resultaten tabel maximaal mag tonen (tip: LIMIT). Een voorbeeld van de output van het aanroepen van de SP met de waarde 3:

Product Aantal Sportabonnement 22 Camera 20 Sneaker 18

## Scripts

### calibratie_labo_15.sql

```sql
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


--
-- Table structure for table `klanten`
--

DROP TABLE IF EXISTS `klanten`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `klanten` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Naam` varchar(50) DEFAULT NULL,
  `Gemeente` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `klanten`
--

LOCK TABLES `klanten` WRITE;
/*!40000 ALTER TABLE `klanten` DISABLE KEYS */;
INSERT INTO `klanten` VALUES (1,'Yassin','Brussel'),(2,'Lina','Brussel'),(3,'Felix','Antwerpen'),(4,'Elena','Antwerpen'),(5,'Amir','Gent'),(6,'Aya','Leuven'),(7,'Oscar','Luik'),(8,'Amina','Mechelen'),(9,'Mohammed','Brugge'),(10,'Lotte','Hasselt'),(11,'Ayoub','Mons'),(12,'Sofia','Namur'),(13,'Ali','Charleroi'),(14,'Zara','Tournai'),(15,'Adam','Oostende'),(16,'Noor','Aalst'),(17,'Nour','Seraing'),(18,'Mila','Louvain-la-Neuve'),(19,'Jules','La Louvière'),(20,'Lina','Kortrijk'),(21,'Amin','Genk'),(22,'Nina','Roeselare'),(23,'Ayoub','Verviers'),(24,'Sara','Evergem'),(25,'Jef','Poperinge');
/*!40000 ALTER TABLE `klanten` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producten`
--

DROP TABLE IF EXISTS `producten`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producten` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ProductOmschrijving` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producten`
--

LOCK TABLES `producten` WRITE;
/*!40000 ALTER TABLE `producten` DISABLE KEYS */;
INSERT INTO `producten` VALUES (1,'Concertticket'),(2,'Gameconsole'),(3,'Festivalpas'),(4,'Smartphonehoesje'),(5,'Skateboard'),(6,'Boekenbon'),(7,'Koptelefoon'),(8,'Sneaker'),(9,'Camera'),(10,'Sportabonnement');
/*!40000 ALTER TABLE `producten` ENABLE KEYS */;
UNLOCK TABLES;


--
-- Table structure for table `bestellingen`
--

DROP TABLE IF EXISTS `bestellingen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bestellingen` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Aantal` int DEFAULT NULL,
  `Producten_Id` int DEFAULT NULL,
  `Klanten_Id` int DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `Producten_Id` (`Producten_Id`),
  KEY `Klanten_Id` (`Klanten_Id`),
  CONSTRAINT `bestellingen_ibfk_1` FOREIGN KEY (`Producten_Id`) REFERENCES `producten` (`Id`),
  CONSTRAINT `bestellingen_ibfk_2` FOREIGN KEY (`Klanten_Id`) REFERENCES `klanten` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bestellingen`
--

LOCK TABLES `bestellingen` WRITE;
/*!40000 ALTER TABLE `bestellingen` DISABLE KEYS */;
INSERT INTO `bestellingen` VALUES (1,2,1,1),(2,1,2,2),(3,4,3,3),(4,3,4,1),(5,1,5,4),(6,2,6,5),(7,3,7,6),(8,4,8,7),(9,5,9,8),(10,6,10,9),(11,7,1,1),(12,8,2,1),(13,9,3,1),(14,10,4,1),(15,11,5,3),(16,12,6,4),(17,13,7,4),(18,14,8,5),(19,15,9,5),(20,16,10,5);
/*!40000 ALTER TABLE `bestellingen` ENABLE KEYS */;
UNLOCK TABLES;


/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-11-09 17:11:21
```

