import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id:           text("id").primaryKey(),
  username:     text("username").unique().notNull(),
  email:        text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt:    integer("created_at").notNull().default(sql`(unixepoch())`),
});

export const plants = sqliteTable("plants", {
  id:             text("id").primaryKey(),
  userId:         text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name:           text("name").notNull(),
  templateIndex:  integer("template_index").notNull(),
  angleVariation: real("angle_variation").notNull(),
  color:          text("color").notNull(),
  plantedAt:      integer("planted_at").notNull().default(sql`(unixepoch())`),
  position:       integer("position").notNull(),
});

export const checkins = sqliteTable("checkins", {
  id:        text("id").primaryKey(),
  userId:    text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date:      text("date").notNull(),
  plantId:   text("plant_id").references(() => plants.id),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
}, (table) => [
  uniqueIndex("checkins_user_date_idx").on(table.userId, table.date),
]);
