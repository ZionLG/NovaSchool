CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`phone` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);