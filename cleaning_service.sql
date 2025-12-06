-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 07, 2025 at 12:27 AM
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
-- Database: `cleaning_service`
--

-- --------------------------------------------------------

--
-- Table structure for table `bill`
--

CREATE TABLE `bill` (
  `bill_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('PENDING','PAID','DISPUTED','CANCELED') DEFAULT 'PENDING',
  `generated_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `billresponse`
--

CREATE TABLE `billresponse` (
  `response_id` int(11) NOT NULL,
  `bill_id` int(11) NOT NULL,
  `from_role` enum('ANNA','CLIENT') NOT NULL,
  `proposed_amount` decimal(10,2) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `action_type` enum('PAY','DISPUTE','ADJUST','COMMENT') NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `client`
--

CREATE TABLE `client` (
  `client_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `address` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `cc_last4` char(4) DEFAULT NULL,
  `cc_token` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `client`
--

INSERT INTO `client` (`client_id`, `first_name`, `last_name`, `address`, `phone`, `email`, `cc_last4`, `cc_token`, `created_at`) VALUES
(1, 'Suganeshwara', 'Anand', '3798 Sienna Drive', '2485258543', 'sugianand89@gmail.com', '456', NULL, '2025-12-05 01:25:56'),
(7, 'Steve', 'Harrington', 'updisde', '2345678901', 'stevyuhari@gmail.com', '', NULL, '2025-12-05 23:49:20'),
(8, 'Steve', 'Harrington', '42 W Warren Ave, Detroit, MI 48202', '(248) 525-8543', 'stevehair@gmail.com', '', NULL, '2025-12-05 23:50:15'),
(9, 'eddie', 'munson', 'Cleveland, OH', '2345678190', 'eddies@gmail.com', '', NULL, '2025-12-06 00:15:13');

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `payment_id` int(11) NOT NULL,
  `bill_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` enum('CREDIT_CARD') DEFAULT 'CREDIT_CARD',
  `transaction_ref` varchar(100) DEFAULT NULL,
  `status` enum('SUCCESS','FAILED') DEFAULT 'SUCCESS',
  `paid_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quote`
--

CREATE TABLE `quote` (
  `quote_id` int(11) NOT NULL,
  `request_id` int(11) NOT NULL,
  `from_role` enum('ANNA','CLIENT') NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `time_window_start` datetime DEFAULT NULL,
  `time_window_end` datetime DEFAULT NULL,
  `note` text DEFAULT NULL,
  `status` enum('PROPOSED','COUNTER','ACCEPTED','REJECTED','CANCELED') DEFAULT 'PROPOSED',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `requestphoto`
--

CREATE TABLE `requestphoto` (
  `photo_id` int(11) NOT NULL,
  `request_id` int(11) NOT NULL,
  `photo_url` varchar(255) NOT NULL,
  `uploaded_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `serviceorder`
--

CREATE TABLE `serviceorder` (
  `order_id` int(11) NOT NULL,
  `request_id` int(11) NOT NULL,
  `accepted_quote_id` int(11) NOT NULL,
  `status` enum('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELED') DEFAULT 'SCHEDULED',
  `scheduled_start` datetime DEFAULT NULL,
  `scheduled_end` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `servicerequest`
--

CREATE TABLE `servicerequest` (
  `request_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `service_address` varchar(255) NOT NULL,
  `cleaning_type` enum('BASIC','DEEP','MOVE_OUT') NOT NULL,
  `num_rooms` int(11) NOT NULL,
  `preferred_datetime` datetime DEFAULT NULL,
  `proposed_budget` decimal(10,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('PENDING','UNDER_NEGOTIATION','REJECTED','ACCEPTED','CANCELED') DEFAULT 'PENDING',
  `created_at` datetime DEFAULT current_timestamp(),
  `rejected_reason` text DEFAULT NULL,
  `rejected_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `useraccount`
--

CREATE TABLE `useraccount` (
  `user_id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('CLIENT','CONTRACTOR') NOT NULL,
  `client_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `useraccount`
--

INSERT INTO `useraccount` (`user_id`, `username`, `password`, `role`, `client_id`) VALUES
(1, 'anna', 'password123', 'CONTRACTOR', NULL),
(2, 'stevyuhari@gmail.com', '123445', 'CLIENT', 7),
(3, 'stevehair@gmail.com', 'millie', 'CLIENT', 8),
(4, 'eddies@gmail.com', 'chrissy', 'CLIENT', 9);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bill`
--
ALTER TABLE `bill`
  ADD PRIMARY KEY (`bill_id`),
  ADD UNIQUE KEY `order_id` (`order_id`);

--
-- Indexes for table `billresponse`
--
ALTER TABLE `billresponse`
  ADD PRIMARY KEY (`response_id`),
  ADD KEY `fk_billresponse_bill` (`bill_id`);

--
-- Indexes for table `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`client_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `fk_payment_bill` (`bill_id`),
  ADD KEY `fk_payment_client` (`client_id`);

--
-- Indexes for table `quote`
--
ALTER TABLE `quote`
  ADD PRIMARY KEY (`quote_id`),
  ADD KEY `fk_quote_request` (`request_id`);

--
-- Indexes for table `requestphoto`
--
ALTER TABLE `requestphoto`
  ADD PRIMARY KEY (`photo_id`),
  ADD KEY `fk_photo_request` (`request_id`);

--
-- Indexes for table `serviceorder`
--
ALTER TABLE `serviceorder`
  ADD PRIMARY KEY (`order_id`),
  ADD UNIQUE KEY `request_id` (`request_id`),
  ADD KEY `fk_order_quote` (`accepted_quote_id`);

--
-- Indexes for table `servicerequest`
--
ALTER TABLE `servicerequest`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `fk_request_client` (`client_id`);

--
-- Indexes for table `useraccount`
--
ALTER TABLE `useraccount`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `client_id` (`client_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bill`
--
ALTER TABLE `bill`
  MODIFY `bill_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `billresponse`
--
ALTER TABLE `billresponse`
  MODIFY `response_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `client`
--
ALTER TABLE `client`
  MODIFY `client_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quote`
--
ALTER TABLE `quote`
  MODIFY `quote_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `requestphoto`
--
ALTER TABLE `requestphoto`
  MODIFY `photo_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `serviceorder`
--
ALTER TABLE `serviceorder`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `servicerequest`
--
ALTER TABLE `servicerequest`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `useraccount`
--
ALTER TABLE `useraccount`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bill`
--
ALTER TABLE `bill`
  ADD CONSTRAINT `fk_bill_order` FOREIGN KEY (`order_id`) REFERENCES `serviceorder` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `billresponse`
--
ALTER TABLE `billresponse`
  ADD CONSTRAINT `fk_billresponse_bill` FOREIGN KEY (`bill_id`) REFERENCES `bill` (`bill_id`) ON DELETE CASCADE;

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `fk_payment_bill` FOREIGN KEY (`bill_id`) REFERENCES `bill` (`bill_id`),
  ADD CONSTRAINT `fk_payment_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`client_id`);

--
-- Constraints for table `quote`
--
ALTER TABLE `quote`
  ADD CONSTRAINT `fk_quote_request` FOREIGN KEY (`request_id`) REFERENCES `servicerequest` (`request_id`) ON DELETE CASCADE;

--
-- Constraints for table `requestphoto`
--
ALTER TABLE `requestphoto`
  ADD CONSTRAINT `fk_photo_request` FOREIGN KEY (`request_id`) REFERENCES `servicerequest` (`request_id`) ON DELETE CASCADE;

--
-- Constraints for table `serviceorder`
--
ALTER TABLE `serviceorder`
  ADD CONSTRAINT `fk_order_quote` FOREIGN KEY (`accepted_quote_id`) REFERENCES `quote` (`quote_id`),
  ADD CONSTRAINT `fk_order_request` FOREIGN KEY (`request_id`) REFERENCES `servicerequest` (`request_id`) ON DELETE CASCADE;

--
-- Constraints for table `servicerequest`
--
ALTER TABLE `servicerequest`
  ADD CONSTRAINT `fk_request_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`client_id`) ON DELETE CASCADE;

--
-- Constraints for table `useraccount`
--
ALTER TABLE `useraccount`
  ADD CONSTRAINT `useraccount_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `client` (`client_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
