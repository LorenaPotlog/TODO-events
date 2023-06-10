DROP TABLE evenimente;

DROP TYPE IF EXISTS categ_eveniment;
DROP TYPE IF EXISTS marime_eveniment;
DROP TYPE IF EXISTS tip_meniu;
DROP TYPE IF EXISTS anotimp;



CREATE TYPE categ_eveniment AS ENUM( 'Wedding', 'Birthday', 'Gender reveal', 'Corporate', 'Other');
CREATE TYPE marime_eveniment AS ENUM('Small', 'Medium','Large','X-Large');
CREATE TYPE tip_meniu AS ENUM('Traditional', 'Vegan','Vegetarian','Pescatarian');
CREATE TYPE anotimp AS ENUM('vara', 'iarna');

CREATE TABLE IF NOT EXISTS evenimente (
   id serial PRIMARY KEY,
   denumire VARCHAR(50) UNIQUE NOT NULL,
   descriere TEXT,
   cost_organizare NUMERIC(8,2) NOT NULL,
   cost_total NUMERIC(8,2),  
   marime marime_eveniment,
   categorie categ_eveniment DEFAULT 'Other',
   servicii_incluse VARCHAR [], 
   meniu tip_meniu,
   plata_vouchere BOOLEAN NOT NULL DEFAULT FALSE,
   imagine VARCHAR(300),
   anotimp anotimp,
   data_disponibila TIMESTAMP DEFAULT current_timestamp
);

INSERT into evenimente (denumire,descriere,cost_organizare,cost_total,marime,categorie,servicii_incluse,meniu,plata_vouchere,imagine,anotimp) VALUES
('Lake wedding', 'A beautiful event by the sea',400,1500,'Medium','Wedding','{f&b,music,bar,video,photo}','Vegan',TRUE,'lake-wedding.png','vara'),

('Forrest wedding', 'A beautiful event by the forrest',200,1500,'Small','Wedding','{f&b,music,candy-bar}','Traditional',FALSE,'forrest-wedding.png',null),

('Small wedding', 'A beautiful event.',300,2500,'Small','Wedding','{f&b,music,video,photo}','Traditional',TRUE,'Small-wedding.png','vara'),

('Palace wedding', 'A beautiful event.',700,4000,'Large','Wedding','{f&b,music,bar,video,candy-bar}','Traditional',FALSE,'palace-wedding.png','vara'),

('Fall wedding', 'A beautiful event.',600,3500,'X-Large','Wedding','{f&b,music,bar,video}','Vegan',FALSE,'fall-wedding.png',null),

('Surprise Birthday', 'A beautiful event',160,500,'X-Large','Birthday','{f&b,music}','Vegetarian',TRUE,'surprise-birthday.png',null),

('Simple Birthday', 'A beautiful event',80,300,'Small','Birthday','{f&b,music,candy-bar}','Vegetarian',FALSE,'simple-birthday.png',null),

('Themed Birthday', 'A beautiful event',80,300,'Small','Birthday','{f&b,music,candy-bar}','Vegan',TRUE,'themed-birthday.png',null),

('Big Birthday', 'A beautiful event',120,400,'Medium','Birthday','{f&b,music,video}','Vegan',FALSE,'big-birthday.png','vara'),

('Boy Gender Reveal', 'A beautiful event',150,400,'Medium','Gender reveal','{music,video,photo,candy-bar}','Vegan',FALSE,'boy-gender-reveal.png', 'iarna'),

('Girl Gender Reveal', 'A beautiful event',150,400,'Medium','Gender reveal','{music,video,photo}','Pescatarian',TRUE,'girl-gender-reveal.png', 'iarna'),

('Twins Gender Reveal', 'A beautiful event',200,450,'Large','Gender reveal','{f&b,music,video}','Traditional',TRUE,'twins-gender-reveal.png', 'iarna'),

('Teambuilding', 'A beautiful event',400,2000,'Large','Corporate','{f&b,music,video,bar,photo}','Traditional',FALSE,'teambuilding-corporate.png', 'iarna'),

('Company presentation', 'A beautiful event',300,1500,'Large','Corporate','{music,video,candy-bar}','Pescatarian',TRUE,'presentation-corporate.png', 'iarna'),

('Product reveal', 'A beautiful event',300,1000,'Medium','Corporate','{music,video,bar}','Traditional',TRUE,'product-reveal-corporate.png', 'iarna'),

('Baptism', 'A beautiful event',200,670,'Medium','Other','{f&b,music,video,candy-bar}','Vegetarian',FALSE,'events-default.png', 'iarna'),

('Concert', 'A beautiful event',500,1500,'Medium','Other','{f&b,music,video,bar,photo}','Vegetarian',TRUE,'events-default.png', 'iarna'),

('Bachelor party', 'A beautiful event',200,700,'Large','Other','{f&b,music,video}','Pescatarian',TRUE,'events-default.png',null);

CREATE USER lorena WITH ENCRYPTED PASSWORD 'lorena';
GRANT ALL PRIVILEGES ON DATABASE proiect_web TO lorena ;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lorena;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lorena;