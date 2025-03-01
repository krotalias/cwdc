DROP DATABASE IF EXISTS candidatos;

CREATE DATABASE candidatos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE candidatos;

CREATE TABLE Candidato (
    numero VARCHAR(5) NOT NULL,
    nome VARCHAR(127) NOT NULL,
    titulo VARCHAR(127) NOT NULL,
    partido VARCHAR(31) NOT NULL,
    foto VARCHAR(31) NOT NULL,
    votos INT NOT NULL DEFAULT 0,
    PRIMARY KEY (numero)
);

CREATE TABLE Vice (
    numero VARCHAR(5) UNIQUE NOT NULL,
    nome VARCHAR(127) NOT NULL,
    partido VARCHAR(31) NOT NULL,
    foto VARCHAR(31) NOT NULL,
    FOREIGN KEY (numero) REFERENCES Candidato(numero) ON DELETE CASCADE
);

INSERT INTO Candidato (numero, nome, titulo, partido, foto) VALUES
("51222", "Christianne Varão", "vereador", "PEN", "cv1.jpg"),
("55555", "Homero do Zé Filho", "vereador", "PSL", "cv2.jpg"),
("43333", "Dandor", "vereador", "PV", "cv3.jpg"),
("15123", "Filho", "vereador", "MDB", "cv4.jpg"),
("27222", "Joel Varão", "vereador", "PSDC", "cv5.jpg"),
("45000", "Professor Clebson Almeida", "vereador", "PSDB", "cv6.jpg"),
("12", "Chiquinho do Adbon", "prefeito", "PDT", "cp3.jpg"),
("15", "Malrinete Gralhada", "prefeito", "MDB", "cp2.jpg"),
("45", "Dr. Francisco", "prefeito", "PSC", "cp1.jpg"),
("54", "Zé Lopes", "prefeito", "PPL", "cp4.jpg"),
("65", "Lindomar Pescador", "prefeito", "PC do B", "cp5.jpg"),
("nulop", "NULO", "prefeito", "Nenhum", "cp5.jpg"),
("nulov", "NULO", "vereador", "Nenhum", "cv5.jpg");

INSERT INTO Vice VALUES
("12", "Arão", "PRP", "v3.jpg"),
("15", "Biga", "MDB", "v2.jpg"),
("45", "João Rodrigues", "PV", "v1.jpg"),
("54", "Francisca Ferreira Ramos", "PPL", "v4.jpg"),
("65", "Malú", "PC do B", "v5.jpg"),
("nulop", "NULO", "Nenhum", "v5.jpg");
