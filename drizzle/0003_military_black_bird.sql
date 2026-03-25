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
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_usage_user_date_model_unique` ON `daily_usage` (`user_id`,`date_key`,`model_key`);--> statement-breakpoint
ALTER TABLE `conversation` ADD `model_key` text DEFAULT 'core' NOT NULL;