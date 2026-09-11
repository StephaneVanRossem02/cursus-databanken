DROP TABLE IF EXISTS MinderNummers;

CREATE TABLE MinderNummers (
  Titel TEXT NOT NULL,
  Artiest TEXT NOT NULL,
  Album TEXT NOT NULL,
  Duurtijd INTEGER NOT NULL,
  Genre TEXT NOT NULL,
  ReleaseJaar INTEGER NOT NULL,
  Royalties INTEGER DEFAULT NULL
);

INSERT INTO MinderNummers VALUES ('The Rain Song','Led Zeppelin','Houses Of The Holy',459,'Rock',1999,55),('The Ocean','Led Zeppelin','Houses Of The Holy',271,'Rock',1975,32),('Please Mr. Postman','BackBeat','BackBeat Soundtrack',137,'Blues',1958,NULL),('Wiser TEXT','The Black Crowes','Live [Disc 1]',459,'Blues',1967,NULL),('The Wanton Song','Led Zeppelin','Physical Graffiti [Disc 2]',249,'Rock',1962,30),('I Can''t Stand It','Eric Clapton','The Cream Of Clapton',249,'Blues',1994,NULL),('Trampled Under Foot','Led Zeppelin','Physical Graffiti [Disc 1]',336,'Rock',1998,41),('What is and Should Never Be','Led Zeppelin','BBC Sessions [Disc 1] [Live]',260,'Rock',1983,31),('Stone Crazy','Buddy Guy','The Best Of Buddy Guy - The Millenium Collection',433,'Blues',1987,NULL),('Sting Me','The Black Crowes','Live [Disc 1]',268,'Blues',1973,NULL),('Walter''s Walk','Led Zeppelin','Coda',270,'Rock',2001,32),('Tea For One','Led Zeppelin','Presence',566,'Rock',2015,68),('Girl From A Pawnshop','The Black Crowes','Live [Disc 1]',404,'Blues',1988,NULL),('Hang ''Em High','Van Halen','Diver Down',210,'Rock',1970,13),('Dancing In The Street','Van Halen','Diver Down',225,'Rock',2004,13),('Little Guitars (Intro)','Van Halen','Diver Down',42,'Rock',1988,2);
