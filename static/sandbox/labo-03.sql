create table Liedjes (
Artiest TEXT,
Titel TEXT,
AantalVerkocht INTEGER,
ReleaseJaar INTEGER
);

create table Geboortes (
Voornaam TEXT,
Familienaam TEXT,
TijdstipGeboorte TEXT,
GewichtInKilogram REAL
);

create table Huisdieren (
Naam TEXT,
Diersoort TEXT,
Leeftijd INTEGER
);

insert into Liedjes (Artiest, AantalVerkocht, Titel, ReleaseJaar)
values
("Ghost", 35000, "Call Me Little Sunshine", 2021),
("Led Zeppelin", 1000000, "Stairway to Heaven", 1973),
("Jack Broadbent", 1000, "Woman", 2015),
("Larkin Poe", 15000, "Tom Devil", 2013);

insert into Geboortes (Voornaam, Familienaam, TijdstipGeboorte, GewichtInKilogram)
values
("Adnane", "Lazaar", "1973-07-13 08:11:25", 4.1),
("Dilara", "El Farisi", "1999-10-25 06:11:13", 3.7),
("Mehmet", "Cetinel", "1995-04-01 15:58:50", 2.9),
("Thijs", "Verbeeck", "1990-08-15 19:23:12", 2.7);

insert into Huisdieren (Naam, Diersoort, Leeftijd)
values
('Misty', 'Hond', 9),
('Ming', 'Hond', 11),
('Rambo', 'Kat', 16);
