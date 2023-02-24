CREATE TABLE `Payment_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
);


CREATE TABLE `Payment_transaction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `correlation_id` varchar(255) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `external_transaction_id` varchar(255) DEFAULT NULL,
   `method` varchar(100) DEFAULT NULL,
  `amount` double DEFAULT NULL,
  `currency` varchar(100) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `from` varchar(255) DEFAULT NULL,
    `to` varchar(255) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `callback_url` text DEFAULT NULL,
  `redirect_url` text DEFAULT NULL,
  `checkout_url` text DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
);


