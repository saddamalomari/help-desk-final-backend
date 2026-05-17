SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('citizen','employee','admin') DEFAULT 'citizen',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'employee',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `complaints` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `governorate` varchar(50) DEFAULT NULL,
  `area` varchar(100) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `status` enum('pending','in_progress','resolved') DEFAULT 'pending',
  `auto_lat` decimal(10,8) DEFAULT NULL,
  `auto_lng` decimal(11,8) DEFAULT NULL,
  `map_lat` decimal(10,8) DEFAULT NULL,
  `map_lng` decimal(11,8) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `real_lat` decimal(10,8) DEFAULT NULL,
  `real_lng` decimal(11,8) DEFAULT NULL,
  `priority` enum('critical','high','medium','low') DEFAULT 'medium',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `complaints_ibfk_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `complaint_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `users`
(`id`, `full_name`, `email`, `phone`, `password`, `role`)
VALUES
(1, 'صدام علي', 'sadam1@gmail.com', '0798621884', '1234', 'citizen'),
(2, 'يزن السيستم', 'yazan@system.com', '0796667525', 'yazan123', 'employee'),
(5, 'صدام العمري', 'admin@support.jo', '', 'admin', 'admin'),
(6, 'صدام العمري', 'saddam@support.jo', '0790000000', 'system', 'admin');

INSERT INTO `complaints`
(`id`, `user_id`, `first_name`, `last_name`, `phone`, `governorate`, `area`, `title`, `description`, `image_url`, `status`, `auto_lat`, `auto_lng`, `map_lat`, `map_lng`, `created_at`, `real_lat`, `real_lng`, `priority`)
VALUES
(5, 1, NULL, NULL, NULL, 'العقبة', 'الخامسة', 'مشكلة في إنارة الشارع', 'الأعمدة مطفية من أسبوع في المنطقة الخامسة', NULL, 'resolved', NULL, NULL, NULL, NULL, '2026-03-10 00:31:15', NULL, NULL, 'medium'),
(6, 1, 'sadam', 'alomari ', '0798621881', 'جرش', 'سوف', 'انفجار خط مياه', 'خط مياه ', '/uploads/complaint-1773102959454.jpg', 'resolved', 29.52681870, 35.00633060, 29.53619044, 35.01075022, '2026-03-10 00:35:59', NULL, NULL, 'medium');

INSERT INTO `notifications`
(`id`, `user_id`, `complaint_id`, `title`, `message`, `is_read`, `created_at`)
VALUES
(1, 1, 11, 'تحديث من الإدارة', 'نعتذر منك، تم رفض البلاغ (تعبيد الطريق) لمخالفته الشروط.', 1, '2026-03-10 01:20:02'),
(2, 1, 11, 'تحديث من الإدارة', 'أبشر! تم حل بلاغك (تعبيد الطريق) بنجاح. شكراً لتعاونك!', 1, '2026-03-10 01:20:06');

COMMIT;