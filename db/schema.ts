import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	email: text("email").notNull().unique(),
	hashedPassword: text("hashed_password"), // Nullable - OAuth users may not have passwords
	username: text("username").notNull(),
	messageCount: integer("message_count").notNull().default(50),
	createdAt: timestamp("created_at").defaultNow(),
});	

export type Users = typeof users;

// Rules table for email labeling
export const rules = pgTable("rules", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	condition: text("condition").notNull(), // Natural language rule condition
	label: text("label").notNull(), // Label to apply when rule matches
	priority: integer("priority").notNull().default(0), // Higher priority rules are checked first
	isActive: integer("is_active").notNull().default(1), // 1 = active, 0 = inactive
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export type Rules = typeof rules;
