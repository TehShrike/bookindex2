/*
SQLyog Ultimate v13.1.7 (64 bit)
MySQL - 8.0.20 : Database - bookindex2
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`bookindex2` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE bookindex2;

/*Table structure for table `author` */

CREATE TABLE `author` (
  `author_id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  PRIMARY KEY (`author_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `isbn` */

CREATE TABLE `isbn` (
  `isbn_id` int unsigned NOT NULL AUTO_INCREMENT,
  `isbn` char(13) NOT NULL,
  PRIMARY KEY (`isbn_id`),
  UNIQUE KEY `isbn` (`isbn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `location` */

CREATE TABLE `location` (
  `location_id` int unsigned NOT NULL AUTO_INCREMENT,
  `barcode` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  PRIMARY KEY (`location_id`),
  UNIQUE KEY `barcode` (`barcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `book` */

CREATE TABLE `book` (
  `book_id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `subtitle` varchar(500),
  `location_id` int unsigned,
  `source` varchar(50),
  PRIMARY KEY (`book_id`),
  KEY `location` (`location_id`),
  CONSTRAINT `book_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `book_author` */

CREATE TABLE `book_author` (
  `book_author_id` int unsigned NOT NULL AUTO_INCREMENT,
  `book_id` int unsigned NOT NULL,
  `author_id` int unsigned NOT NULL,
  PRIMARY KEY (`book_author_id`),
  UNIQUE KEY `book_author` (`book_id`,`author_id`),
  KEY `author` (`author_id`),
  CONSTRAINT `book_author_author` FOREIGN KEY (`author_id`) REFERENCES `author` (`author_id`),
  CONSTRAINT `book_author_book` FOREIGN KEY (`book_id`) REFERENCES `book` (`book_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `book_isbn` */

CREATE TABLE `book_isbn` (
  `book_isbn_id` int unsigned NOT NULL AUTO_INCREMENT,
  `book_id` int unsigned NOT NULL,
  `isbn_id` int unsigned NOT NULL,
  PRIMARY KEY (`book_isbn_id`),
  UNIQUE KEY `book_isbn` (`book_id`,`isbn_id`),
  KEY `isbn` (`isbn_id`),
  CONSTRAINT `book_isbn_book` FOREIGN KEY (`book_id`) REFERENCES `book` (`book_id`),
  CONSTRAINT `book_isbn_isbn` FOREIGN KEY (`isbn_id`) REFERENCES `isbn` (`isbn_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
