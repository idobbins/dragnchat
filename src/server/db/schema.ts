import { relations, sql } from "drizzle-orm";
import { index, jsonb, pgTableCreator, serial, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `dragnchat_${name}`);

export const projects = createTable(
	"project",
	(d) => ({
		id: d.serial().primaryKey(), // Internal auto-incrementing ID
		uuid: d
			.varchar({ length: 255 })
			.notNull()
			.$defaultFn(() => crypto.randomUUID()), // UUID for external references
		name: d.varchar({ length: 255 }).notNull(), // Project name
		userId: d.varchar({ length: 255 }).notNull(), // Clerk user ID
		projectData: d.jsonb().notNull(), // Binary JSON blob for project data
		createdAt: d
			.timestamp({ mode: "date", withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`),
		updatedAt: d
			.timestamp({ mode: "date", withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`),
	}),
	(t) => [
		index("project_user_id_idx").on(t.userId), // Index for efficient user queries
		index("project_uuid_idx").on(t.uuid), // Index for UUID lookups
	],
);
