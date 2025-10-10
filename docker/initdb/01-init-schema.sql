-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mariadb:3306
-- Generation Time: Oct 10, 2025 at 08:57 PM
-- Server version: 11.8.2-MariaDB-ubu2404-log
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `echoart`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `c_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`c_id`, `name`) VALUES
(1, 'Figure');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `u_id` int(11) NOT NULL,
  `p_id` int(11) NOT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `quantity` int(11) NOT NULL DEFAULT 1,
  `total_amount` decimal(10,2) NOT NULL,
  `status_id` int(11) NOT NULL DEFAULT 1,
  `shipping_address` text NOT NULL,
  `description` text DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `bill_img` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `u_id`, `p_id`, `order_date`, `quantity`, `total_amount`, `status_id`, `shipping_address`, `description`, `img`, `bill_img`) VALUES
(2, 21, 1, '2025-10-02 08:08:22', 1, 1.00, 5, '170 soi 55 japan', 'this is batman', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `order_statuses`
--

CREATE TABLE `order_statuses` (
  `s_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_statuses`
--

INSERT INTO `order_statuses` (`s_id`, `name`) VALUES
(6, 'Cancelled'),
(5, 'Completed'),
(4, 'Delivery'),
(3, 'Packing'),
(1, 'Pending'),
(2, 'Processing');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `p_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `size` varchar(50) NOT NULL DEFAULT '',
  `price` decimal(10,2) NOT NULL,
  `image` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`p_id`, `name`, `description`, `size`, `price`, `image`, `created_at`, `updated_at`) VALUES
(1, 'BatMan', 'na na na', '2:3', 520.00, 'batman.jpg', '2025-10-01 08:19:31', '2025-10-02 20:58:46');

-- --------------------------------------------------------

--
-- Table structure for table `product_categories`
--

CREATE TABLE `product_categories` (
  `p_id` int(11) NOT NULL,
  `c_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_categories`
--

INSERT INTO `product_categories` (`p_id`, `c_id`) VALUES
(1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `review_id` int(11) NOT NULL,
  `o_id` int(11) NOT NULL,
  `p_id` int(11) NOT NULL,
  `u_id` int(11) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `review_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `score` tinyint(4) NOT NULL CHECK (`score` >= 1 and `score` <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`review_id`, `o_id`, `p_id`, `u_id`, `title`, `description`, `review_date`, `score`) VALUES
(1, 2, 1, 21, 'ดีมากครับ', 'ได้ตามแบบเลยครับ', '2025-10-10 13:57:11', 4);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='a role for each person''s job';

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(3, 'customer'),
(1, 'god'),
(2, 'staff');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `u_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`u_id`, `username`, `password`, `email`, `role_id`, `created_at`) VALUES
(3, 'john_doe', 'a_very_strong_hashed_password', 'john.doe@example.com', 2, '2025-09-27 14:50:21'),
(9, 'staff@306', '306@it', 'it306@it.com', 1, '2025-09-27 14:59:30'),
(16, 'auto', 'test@123', '66070077@kmitl.ac.th', 3, '2025-09-28 13:07:11'),
(17, 'pao', 'scrypt:32768:8:1$2ejB4sef11zGFq7G$0e79f2f32462e3c9aee3d14496bf082ebcfe5fe36fc08ce8498d2177814d3bf2f3bd6ca7d42b54c565a22bf0bcea92f7ded21a57663355c0901a8587b5802d2e', '66070112@kmitl.ac.th', 3, '2025-09-28 13:16:55'),
(18, 'hehe', 'scrypt:32768:8:1$GNo3nRoGatZb1m5u$7e7b1a473d4873d3894111abd00b68db95af08088eaebf51269640cd6da0d86360fcfbef036bd3fe263701ada4d7224e2e6a2fb72f1e9ace8b8af66abecfdcfd', '66070107@kmitl.ac.th', 3, '2025-09-28 13:29:58'),
(19, 'testuser123', 'scrypt:32768:8:1$4rP5jxx2R5f3wwLt$b73b2b4d5c0661fe48132a8244811642300a0dff2c0def9d033518e69b906fe27402db8184a139447473fb92a89b76d422c32ed474e2af7c3ddd3e7362c88dbf', 'test@example.com', 3, '2025-09-28 13:46:13'),
(20, 'test', 'scrypt:32768:8:1$sSjvY83s7CCqdnUg$1173d4fd291ed2f03f1ec1c923f0344f508ba6edf4a0af998bd2902435e11b64e61db9543b099b7a88349773db82566cd2ddd29b5d7c3e08074e72d4cf87a1a0', 'test@test.com', 3, '2025-10-01 12:12:54'),
(21, 'pao@', 'scrypt:32768:8:1$LVxdfRjVE9Xkhpve$f85eef2dcf5191141005c03097afb8331e17e6ba9a96c9ab3c02d9aba48d4e77755e92f606b056d5e47d9fe555a5ce59826156b5dfccce2bfd163c0f64af2a1e', 'pao@pao.com', 1, '2025-10-01 12:27:23');

-- --------------------------------------------------------

--
-- Table structure for table `user_info`
--

CREATE TABLE `user_info` (
  `u_id` int(11) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `street_address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `telephone` varchar(25) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_info`
--

INSERT INTO `user_info` (`u_id`, `firstname`, `lastname`, `street_address`, `city`, `postal_code`, `telephone`, `created_at`, `updated_at`) VALUES
(3, 'John', 'Doe', NULL, NULL, NULL, '3063063062', '2025-09-27 14:54:05', '2025-09-27 14:54:05'),
(9, 'Staff', '306', NULL, NULL, NULL, NULL, '2025-09-27 15:02:14', '2025-09-27 15:02:14'),
(16, 'thanapol', 'wankumgud', '306 floor 3 it building kmitl 10520', 'กรุงเทพมหานคร', '10520', '5551237109', '2025-09-28 13:07:12', '2025-09-28 13:07:12'),
(17, 'panot', 'liangpiboon', '306 floor 3 it building kmitl 10520', 'กรุงเทพมหานคร', '10520', '0972073201', '2025-09-28 13:16:55', '2025-09-28 13:16:55'),
(18, 'niji', 'lovesensei', '306 floor 3 it building kmitl 10520', 'กรุงเทพมหานคร', '10520', '1231231234', '2025-09-28 13:29:59', '2025-09-28 13:29:59'),
(19, 'Test', 'User', '', 'กรุงเทพมหานคร', '', '0812345678', '2025-09-28 13:46:14', '2025-09-28 13:46:14'),
(20, 'test', 'test', '306 floor 3 it building kmitl 10520', 'กาฬสินธุ์', '10520', '1234567890', '2025-10-01 12:12:55', '2025-10-01 12:12:55'),
(21, 'panot', 'liangpiboon', '306 floor 3 it building kmitl 10520', 'Bangkok', '10000', '081-252-1233', '2025-10-01 12:27:24', '2025-10-01 12:27:24');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`c_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `fk_orders_user` (`u_id`),
  ADD KEY `fk_orders_status` (`status_id`),
  ADD KEY `fk_orders_product` (`p_id`);

--
-- Indexes for table `order_statuses`
--
ALTER TABLE `order_statuses`
  ADD PRIMARY KEY (`s_id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`p_id`);

--
-- Indexes for table `product_categories`
--
ALTER TABLE `product_categories`
  ADD PRIMARY KEY (`p_id`,`c_id`),
  ADD KEY `fk_category_link` (`c_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `fk_reviews_product` (`p_id`),
  ADD KEY `fk_reviews_user` (`u_id`),
  ADD KEY `idx_reviews_o_id` (`o_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`u_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_role` (`role_id`);

--
-- Indexes for table `user_info`
--
ALTER TABLE `user_info`
  ADD PRIMARY KEY (`u_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `c_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `order_statuses`
--
ALTER TABLE `order_statuses`
  MODIFY `s_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `p_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `u_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_product` FOREIGN KEY (`p_id`) REFERENCES `products` (`p_id`),
  ADD CONSTRAINT `fk_orders_status` FOREIGN KEY (`status_id`) REFERENCES `order_statuses` (`s_id`),
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`u_id`) REFERENCES `users` (`u_id`);

--
-- Constraints for table `product_categories`
--
ALTER TABLE `product_categories`
  ADD CONSTRAINT `fk_category_link` FOREIGN KEY (`c_id`) REFERENCES `categories` (`c_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_product_link` FOREIGN KEY (`p_id`) REFERENCES `products` (`p_id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_orders` FOREIGN KEY (`o_id`) REFERENCES `orders` (`order_id`),
  ADD CONSTRAINT `fk_reviews_product` FOREIGN KEY (`p_id`) REFERENCES `products` (`p_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reviews_user` FOREIGN KEY (`u_id`) REFERENCES `users` (`u_id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `user_info`
--
ALTER TABLE `user_info`
  ADD CONSTRAINT `fk_user_info_u_id` FOREIGN KEY (`u_id`) REFERENCES `users` (`u_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
