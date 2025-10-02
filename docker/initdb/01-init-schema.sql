-- --------------------------------------------------------
-- Server version:               11.8.2-MariaDB-log - MariaDB Server
-- Server OS:                    Linux
-- HeidiSQL Version:             12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for echoart
DROP DATABASE IF EXISTS `echoart`;
CREATE DATABASE IF NOT EXISTS `echoart` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `echoart`;

-- Dumping structure for table echoart.categories
DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `c_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`c_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table echoart.categories: ~1 rows (approximately)
DELETE FROM `categories`;
INSERT INTO `categories` (`c_id`, `name`) VALUES
	(1, 'Figure');

-- Dumping structure for table echoart.orders
DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `u_id` int(11) NOT NULL,
  `p_id` int(11) NOT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_amount` decimal(10,2) NOT NULL,
  `status_id` int(11) NOT NULL DEFAULT 1,
  `shipping_address` text NOT NULL,
  `description` text DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `bill_img` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `fk_orders_user` (`u_id`),
  KEY `fk_orders_status` (`status_id`),
  KEY `fk_orders_product` (`p_id`),
  CONSTRAINT `fk_orders_product` FOREIGN KEY (`p_id`) REFERENCES `products` (`p_id`),
  CONSTRAINT `fk_orders_status` FOREIGN KEY (`status_id`) REFERENCES `order_statuses` (`s_id`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`u_id`) REFERENCES `users` (`u_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table echoart.orders: ~1 rows (approximately)
DELETE FROM `orders`;
INSERT INTO `orders` (`order_id`, `u_id`, `p_id`, `order_date`, `total_amount`, `status_id`, `shipping_address`, `description`, `img`, `bill_img`) VALUES
	(2, 21, 1, '2025-10-02 08:08:22', 1.00, 5, '170 soi 55 japan', 'this is batman', NULL, NULL);

-- Dumping structure for table echoart.order_statuses
DROP TABLE IF EXISTS `order_statuses`;
CREATE TABLE IF NOT EXISTS `order_statuses` (
  `s_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`s_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table echoart.order_statuses: ~6 rows (approximately)
DELETE FROM `order_statuses`;
INSERT INTO `order_statuses` (`s_id`, `name`) VALUES
	(1, 'Pending'),
	(2, 'Processing'),
	(3, 'Packing'),
	(4, 'Delivery'),
	(5, 'Completed'),
	(6, 'Cancelled');

-- Dumping structure for table echoart.products
DROP TABLE IF EXISTS `products`;
CREATE TABLE IF NOT EXISTS `products` (
  `p_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `size` varchar(50) NOT NULL DEFAULT '',
  `price` decimal(10,2) NOT NULL,
  `image` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`p_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table echoart.products: ~0 rows (approximately)
DELETE FROM `products`;
INSERT INTO `products` (`p_id`, `name`, `description`, `size`, `price`, `image`, `created_at`, `updated_at`) VALUES
	(1, 'BatMan', 'na na na', '2:3', 520.00, 'batman.jpg', '2025-10-01 08:19:31', '2025-10-02 20:58:46');

-- Dumping structure for table echoart.product_categories
DROP TABLE IF EXISTS `product_categories`;
CREATE TABLE IF NOT EXISTS `product_categories` (
  `p_id` int(11) NOT NULL,
  `c_id` int(11) NOT NULL,
  PRIMARY KEY (`p_id`,`c_id`),
  KEY `fk_category_link` (`c_id`),
  CONSTRAINT `fk_category_link` FOREIGN KEY (`c_id`) REFERENCES `categories` (`c_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_link` FOREIGN KEY (`p_id`) REFERENCES `products` (`p_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table echoart.product_categories: ~1 rows (approximately)
DELETE FROM `product_categories`;
INSERT INTO `product_categories` (`p_id`, `c_id`) VALUES
	(1, 1);

-- Dumping structure for table echoart.reviews
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE IF NOT EXISTS `reviews` (
  `review_id` int(11) NOT NULL AUTO_INCREMENT,
  `p_id` int(11) NOT NULL,
  `u_id` int(11) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `review_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `score` tinyint(4) NOT NULL CHECK (`score` >= 1 and `score` <= 5),
  PRIMARY KEY (`review_id`),
  KEY `fk_reviews_product` (`p_id`),
  KEY `fk_reviews_user` (`u_id`),
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`p_id`) REFERENCES `products` (`p_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`u_id`) REFERENCES `users` (`u_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table echoart.reviews: ~0 rows (approximately)
DELETE FROM `reviews`;

-- Dumping structure for table echoart.roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `role_id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='a role for each person''s job';

-- Dumping data for table echoart.roles: ~3 rows (approximately)
DELETE FROM `roles`;
INSERT INTO `roles` (`role_id`, `role_name`) VALUES
	(1, 'god'),
	(2, 'staff'),
	(3, 'customer');

-- Dumping structure for table echoart.users
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `u_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`u_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_users_role` (`role_id`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table echoart.users: ~8 rows (approximately)
DELETE FROM `users`;
INSERT INTO `users` (`u_id`, `username`, `password`, `email`, `role_id`, `created_at`) VALUES
	(3, 'john_doe', 'a_very_strong_hashed_password', 'john.doe@example.com', 2, '2025-09-27 14:50:21'),
	(9, 'staff@306', '306@it', 'it306@it.com', 1, '2025-09-27 14:59:30'),
	(16, 'auto', 'test@123', '66070077@kmitl.ac.th', 3, '2025-09-28 13:07:11'),
	(17, 'pao', 'scrypt:32768:8:1$2ejB4sef11zGFq7G$0e79f2f32462e3c9aee3d14496bf082ebcfe5fe36fc08ce8498d2177814d3bf2f3bd6ca7d42b54c565a22bf0bcea92f7ded21a57663355c0901a8587b5802d2e', '66070112@kmitl.ac.th', 3, '2025-09-28 13:16:55'),
	(18, 'hehe', 'scrypt:32768:8:1$GNo3nRoGatZb1m5u$7e7b1a473d4873d3894111abd00b68db95af08088eaebf51269640cd6da0d86360fcfbef036bd3fe263701ada4d7224e2e6a2fb72f1e9ace8b8af66abecfdcfd', '66070107@kmitl.ac.th', 3, '2025-09-28 13:29:58'),
	(19, 'testuser123', 'scrypt:32768:8:1$4rP5jxx2R5f3wwLt$b73b2b4d5c0661fe48132a8244811642300a0dff2c0def9d033518e69b906fe27402db8184a139447473fb92a89b76d422c32ed474e2af7c3ddd3e7362c88dbf', 'test@example.com', 3, '2025-09-28 13:46:13'),
	(20, 'test', 'scrypt:32768:8:1$sSjvY83s7CCqdnUg$1173d4fd291ed2f03f1ec1c923f0344f508ba6edf4a0af998bd2902435e11b64e61db9543b099b7a88349773db82566cd2ddd29b5d7c3e08074e72d4cf87a1a0', 'test@test.com', 3, '2025-10-01 12:12:54'),
	(21, 'pao@', 'scrypt:32768:8:1$LVxdfRjVE9Xkhpve$f85eef2dcf5191141005c03097afb8331e17e6ba9a96c9ab3c02d9aba48d4e77755e92f606b056d5e47d9fe555a5ce59826156b5dfccce2bfd163c0f64af2a1e', 'pao@pao.com', 1, '2025-10-01 12:27:23');

-- Dumping structure for table echoart.user_info
DROP TABLE IF EXISTS `user_info`;
CREATE TABLE IF NOT EXISTS `user_info` (
  `u_id` int(11) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `street_address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `telephone` varchar(25) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`u_id`),
  CONSTRAINT `fk_user_info_u_id` FOREIGN KEY (`u_id`) REFERENCES `users` (`u_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table echoart.user_info: ~8 rows (approximately)
DELETE FROM `user_info`;
INSERT INTO `user_info` (`u_id`, `firstname`, `lastname`, `street_address`, `city`, `postal_code`, `telephone`, `created_at`, `updated_at`) VALUES
	(3, 'John', 'Doe', NULL, NULL, NULL, '3063063062', '2025-09-27 14:54:05', '2025-09-27 14:54:05'),
	(9, 'Staff', '306', NULL, NULL, NULL, NULL, '2025-09-27 15:02:14', '2025-09-27 15:02:14'),
	(16, 'thanapol', 'wankumgud', '306 floor 3 it building kmitl 10520', 'กรุงเทพมหานคร', '10520', '5551237109', '2025-09-28 13:07:12', '2025-09-28 13:07:12'),
	(17, 'panot', 'liangpiboon', '306 floor 3 it building kmitl 10520', 'กรุงเทพมหานคร', '10520', '0972073201', '2025-09-28 13:16:55', '2025-09-28 13:16:55'),
	(18, 'niji', 'lovesensei', '306 floor 3 it building kmitl 10520', 'กรุงเทพมหานคร', '10520', '1231231234', '2025-09-28 13:29:59', '2025-09-28 13:29:59'),
	(19, 'Test', 'User', '', 'กรุงเทพมหานคร', '', '0812345678', '2025-09-28 13:46:14', '2025-09-28 13:46:14'),
	(20, 'test', 'test', '306 floor 3 it building kmitl 10520', 'กาฬสินธุ์', '10520', '1234567890', '2025-10-01 12:12:55', '2025-10-01 12:12:55'),
	(21, 'panot', 'liangpiboon', '306 floor 3 it building kmitl 10520', 'Bangkok', '10000', '081-252-1233', '2025-10-01 12:27:24', '2025-10-01 12:27:24');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
