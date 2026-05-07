CREATE TABLE `bid_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`car_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`max_bid` real NOT NULL,
	`message` text,
	`created_at` text DEFAULT '(datetime(''now''))' NOT NULL,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cars` (
	`id` text PRIMARY KEY NOT NULL,
	`brand` text NOT NULL,
	`model` text NOT NULL,
	`year` integer NOT NULL,
	`price` real NOT NULL,
	`mileage` integer NOT NULL,
	`transmission` text NOT NULL,
	`fuel_type` text NOT NULL,
	`engine_tier` text,
	`engine_volume` text,
	`image` text NOT NULL,
	`images` text,
	`auction_date` text NOT NULL,
	`lot_number` text NOT NULL,
	`location` text NOT NULL,
	`condition` text NOT NULL,
	`starting_bid` real NOT NULL,
	`created_at` text DEFAULT '(datetime(''now''))' NOT NULL
);
