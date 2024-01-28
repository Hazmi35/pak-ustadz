CREATE TABLE `server` (
	`id` text PRIMARY KEY NOT NULL,
	`enabled` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`city` text NOT NULL
);
