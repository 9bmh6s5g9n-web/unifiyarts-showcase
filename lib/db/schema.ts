import { pgTable, text, timestamp, boolean, serial, integer } from "drizzle-orm/pg-core"

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// --- App tables ------------------------------------------------------------

// A single work in the showcase (book, article, portfolio, video, infographic).
export const works = pgTable("works", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  title: text("title").notNull(),
  creator: text("creator").notNull().default(""),
  type: text("type").notNull().default("other"),
  side: text("side").notNull().default("fiction"), // "fiction" | "nonfiction"
  excerpt: text("excerpt").notNull().default(""),
  coverUrl: text("coverUrl").notNull().default(""), // book cover / thumbnail image
  link: text("link").notNull().default(""), // external link to read/buy the work
  words: integer("words").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// An art piece in the gallery. Doubles as a book-cover portfolio item.
export const artPieces = pgTable("art_pieces", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  imageUrl: text("imageUrl").notNull().default(""),
  side: text("side").notNull().default("fiction"),
  isBookCover: boolean("isBookCover").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  sort: integer("sort").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// External links: author profile, publication, socials.
export const authorLinks = pgTable("author_links", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  sort: integer("sort").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Per-platform performance for a work. One work can have many rows
// (e.g. Amazon, Website, YouTube), each with its own downloads + views.
export const workStats = pgTable("work_stats", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  workId: integer("workId").notNull(),
  platform: text("platform").notNull().default("Website"),
  downloads: integer("downloads").notNull().default(0),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})
