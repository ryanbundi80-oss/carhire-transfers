-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 14, 2026 at 10:54 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bunvic_tours`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `fullName` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `adults` int(11) DEFAULT 0,
  `children` int(11) DEFAULT 0,
  `tourPackage` varchar(100) DEFAULT NULL,
  `accommodation` varchar(50) DEFAULT NULL,
  `vehicleType` varchar(50) DEFAULT NULL,
  `pickup` varchar(100) DEFAULT NULL,
  `dropoff` varchar(100) DEFAULT NULL,
  `arrivalDate` datetime DEFAULT NULL,
  `arrivalTime` time DEFAULT NULL,
  `serviceType` varchar(50) DEFAULT NULL,
  `specialRequests` text DEFAULT NULL,
  `status` enum('Pending','Confirmed','Cancelled') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `fullName`, `email`, `phone`, `country`, `adults`, `children`, `tourPackage`, `accommodation`, `vehicleType`, `pickup`, `dropoff`, `arrivalDate`, `arrivalTime`, `serviceType`, `specialRequests`, `status`, `created_at`) VALUES
(17, 'lolipop greg', 'bunvictravel@gmail.com', '07917484930', 'United States', 2, 2, 'Coastal Getaway', 'Luxury', 'Van', 'N/A', 'N/A', '2025-11-04 00:00:00', '00:00:00', 'car', NULL, 'Confirmed', '2025-11-04 06:12:16'),
(19, 'ronald Lando', 'Ryanbuni80@gmailcom', '0722725667', 'Kenya', 3, 1, NULL, 'Budget', 'Van', 'N/A', 'N/A', '2025-11-04 00:00:00', '00:00:00', 'tour', NULL, 'Cancelled', '2025-11-04 06:15:17'),
(21, 'Amira K.something', 'amirak@gmail.com', '0789328974', 'United States', 2, 1, 'Amboseli Adventure', 'Budget', 'Van', 'N/A', 'N/A', '2025-11-04 00:00:00', '00:00:00', 'tour', NULL, 'Pending', '2025-11-04 11:30:46'),
(23, 'array queue', 'pleaseadd@gmail.com', '0791474726', 'Kenya', 1, 1, 'Maasai Mara Safari', 'Budget', 'Van', 'N/A', 'N/A', '2025-11-05 00:00:00', '00:00:00', 'tour', NULL, 'Confirmed', '2025-11-05 10:05:27'),
(26, 'lando Odera', 'Landoodera@gmail.com', '0729474791', 'Kenya', 1, 2, 'Amboseli Adventure', 'Budget', NULL, 'N/A', 'N/A', '2025-12-08 00:00:00', '00:00:00', 'tour', 'we might change our mind', 'Pending', '2025-12-08 18:43:11'),
(27, 'Amira K.something', 'trinabundii@gmail.com', '0791474726', 'Kenya', 1, 1, NULL, 'Budget', 'Van', 'N/A', 'N/A', '2025-12-11 00:00:00', '00:00:00', 'car', NULL, 'Pending', '2025-12-11 09:45:13'),
(31, 'Ryan Bunda', 'ryanbundi80@gmail.com', '0791474726', 'Kenya', 2, 0, 'Maasai Mara Safari', 'Budget', NULL, 'N/A', 'N/A', '2025-12-17 00:00:00', '00:00:00', 'tour', NULL, 'Cancelled', '2025-12-17 11:22:02'),
(33, 'BILL Verena', 'bunvictravel@gmail.com', '0791474726', 'United States', 3, 1, NULL, 'Budget', 'Van', 'N/A', 'N/A', '2025-12-17 00:00:00', '00:00:00', 'car', NULL, 'Cancelled', '2025-12-17 11:25:30'),
(34, 'Amira Lando', 'bunvictravel@gmail.com', '0791474726', 'United States', 1, 1, 'Coastal Getaway', 'Luxury', NULL, 'N/A', 'N/A', '2026-01-05 00:00:00', '00:00:00', 'tour', NULL, 'Confirmed', '2026-01-05 16:19:42'),
(35, 'gio bob', 'trinabundii@gmail.com', '0791474726', 'Kenya', 3, 1, NULL, 'Budget', 'SUV', 'N/A', 'N/A', '2026-01-06 00:00:00', '00:00:00', 'car', 'lol', 'Confirmed', '2026-01-06 11:38:02'),
(37, 'Amira greg', 'bunvictravel@gmail.com', '0791474726', 'United States', 1, 1, NULL, 'Budget', 'Luxury Sedan', 'N/A', 'N/A', '2026-01-19 00:00:00', '00:00:00', 'car', NULL, 'Cancelled', '2026-01-19 05:17:38'),
(39, 'ryan K.something', 'Ryanbuni80@gmailcom', '0791474726', 'Kenya', 1, 2, 'Maasai Mara Safari', 'Luxury', NULL, 'N/A', 'N/A', '2026-01-19 00:00:00', '00:00:00', 'tour', NULL, 'Confirmed', '2026-01-19 09:54:03'),
(40, 'BILL greg', 'bunvictravel@gmail.com', '0791474726', 'United States', 2, 1, NULL, 'Budget', 'Luxury Sedan', 'N/A', 'N/A', '2026-01-19 00:00:00', '00:00:00', 'car', NULL, 'Pending', '2026-01-19 14:23:39'),
(42, 'ryan bundi', 'trinabundii@gmail.com', '0791474726', 'Kenya', 1, 0, 'Amboseli Adventure', 'Luxury', 'SUV', 'N/A', 'N/A', '2025-11-04 00:00:00', '00:00:00', 'car', NULL, 'Cancelled', '2026-01-21 12:26:20');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
