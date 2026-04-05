-- Lösche bestehende Tabellen, falls sie existieren
DROP TABLE IF EXISTS `account`;
DROP TABLE IF EXISTS `session`;
DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `verification`;
DROP TABLE IF EXISTS `conversation`;
DROP TABLE IF EXISTS `message`;
DROP TABLE IF EXISTS `daily_usage`;

-- Erstelle Tabellen NEU (exakt nach lib/schema.ts)
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`plan` text DEFAULT 'free' NOT NULL,
	`stripe_customer_id` text,
	`stripe_subscription_id` text
);
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);
CREATE UNIQUE INDEX `user_stripe_customer_id_unique` ON `user` (`stripe_customer_id`);
CREATE UNIQUE INDEX `user_stripe_subscription_id_unique` ON `user` (`stripe_subscription_id`);

CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`id_token` text,
	`password` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX `account_provider_id_account_id_unique` ON `account` (`provider_id`,`account_id`);

CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);

CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
CREATE UNIQUE INDEX `verification_identifier_value_unique` ON `verification` (`identifier`,`value`);

CREATE TABLE `conversation` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text DEFAULT 'New chat' NOT NULL,
	`model_key` text DEFAULT 'core' NOT NULL,
	`system_prompt` text DEFAULT '' NOT NULL,
	`canvas` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX `conversation_user_id_id_unique` ON `conversation` (`user_id`,`id`);

CREATE TABLE `message` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`attachments` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversation`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX `message_conversation_id_id_unique` ON `message` (`conversation_id`,`id`);

CREATE TABLE `daily_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date_key` text NOT NULL,
	`model_key` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX `daily_usage_user_date_model_unique` ON `daily_usage` (`user_id`,`date_key`,`model_key`);
