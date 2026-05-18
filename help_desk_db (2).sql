SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- 1. جدول المستخدمين الموحد (مواطنين، موظفين، مدراء)
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

-- 2. جدول الشكاوى (البلاغات) مع إضافة عمود القسم/التصنيف (category) ليتوافق مع الفلاتر
CREATE TABLE `complaints` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `governorate` varchar(50) DEFAULT NULL,
  `area` varchar(100) DEFAULT NULL,
  `category` varchar(100) DEFAULT 'عام', -- تم إضافته ليتوافق مع الواجهات (دعم، مياه، إنارة...)
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `status` enum('pending','in_progress','resolved') DEFAULT 'pending',
  `auto_lat` decimal(10,8) DEFAULT NULL,
  `auto_lng` decimal(11,8) DEFAULT NULL,
  `map_lat` decimal(10,8) DEFAULT NULL,
  `map_lng` decimal(11,8) DEFAULT NULL,
  `real_lat` decimal(10,8) DEFAULT NULL,
  `real_lng` decimal(11,8) DEFAULT NULL,
  `priority` enum('critical','high','medium','low') DEFAULT 'medium',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. جدول الإشعارات
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
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. إدخال البيانات التجريبية المتوافقة
INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `password`, `role`) VALUES
(1, 'صدام علي', 'sadam1@gmail.com', '0798621884', '1234', 'citizen'),
(2, 'يزن السيستم', 'yazan@system.com', '0796667525', 'yazan123', 'employee'),
(5, 'صدام العمري', 'admin@support.jo', '0790000000', 'admin', 'admin'),
(6, 'سلطان أحمد', 'employee2@support.jo', '0791111111', '123456', 'employee');

INSERT INTO `complaints` (`id`, `user_id`, `governorate`, `area`, `category`, `title`, `description`, `status`, `priority`, `created_at`) VALUES
(5, 1, 'العقبة', 'الخامسة', 'صيانة وأعمدة', 'مشكلة في إنارة الشارع', 'الأعمدة مطفية من أسبوع في المنطقة الخامسة', 'resolved', 'medium', '2026-03-10 00:31:15'),
(6, 1, 'جرش', 'سوف', 'مياه وصرف صحي', 'انفجار خط مياه', 'خط مياه رئيسي مكسور', 'in_progress', 'high', '2026-03-10 00:35:59');

INSERT INTO `notifications` (`id`, `user_id`, `complaint_id`, `title`, `message`, `is_read`) VALUES
(1, 1, 5, 'تحديث من الإدارة', 'أبشر! تم حل بلاغك (إنارة الشارع) بنجاح.', 1);

COMMIT;