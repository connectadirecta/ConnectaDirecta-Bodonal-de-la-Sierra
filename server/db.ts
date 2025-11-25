import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { eq, sql } from "drizzle-orm";
import {
  users,
  reminders,
  messages,
  activities,
  chatSessions,
  insertUserSchema,
  insertReminderSchema,
  type User,
  type Reminder,
  type Message,
  type Activity,
  type ChatSession,
  type ReminderCompletion,
  reminderCompletions,
  type MetricsEvent,
  metricsEvents,
  type Analytics,
  analytics,
  professionalAssignments,
  municipalities,
  type Municipality,
  type InsertMunicipality,
  programActivities,
  type ProgramActivity,
  type InsertProgramActivity,
  conversationSummaries,
  memories,
  familyAssignments,
  consents,
  metricsAggregates
} from "@shared/schema";
import { migrate } from "drizzle-orm/postgres-js/migrator";


neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ 
  client: pool, 
  schema: {
    users,
    reminders,
    messages,
    activities,
    chatSessions,
    reminderCompletions,
    metricsEvents,
    analytics,
    professionalAssignments,
    municipalities,
    programActivities,
    conversationSummaries,
    memories,
    familyAssignments,
    consents,
    metricsAggregates
  }
});

// Asegurar que las tablas existen al inicializar
async function ensureTablesExist() {
  try {
    // Añadir columnas de consentimiento si no existen (una por una para evitar errores)
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS family_consent boolean DEFAULT false;
    `);

    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS personal_consent boolean DEFAULT false;
    `);

    // Crear tabla municipalities primero si no existe
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS municipalities (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL UNIQUE,
        photo_url text,
        description text,
        is_active boolean DEFAULT true,
        created_at timestamp with time zone DEFAULT now()
      );
    `);

    // Crear el municipio Bodonal de la Sierra si no existe
    await db.execute(sql`
      INSERT INTO municipalities (id, name, photo_url, is_active)
      VALUES ('99403701-0a87-46ba-a480-24baa30d24ce', 'Bodonal de la Sierra', '/Plaza_España-Bodonal.jpg', true)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Verificar y añadir columna municipality_id si no existe
    await db.execute(sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'municipality_id'
        ) THEN
          ALTER TABLE users ADD COLUMN municipality_id varchar;
        END IF;
      END $$;
    `);

    // Añadir la foreign key constraint si no existe
    await db.execute(sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'users_municipality_id_fkey'
        ) THEN
          ALTER TABLE users 
          ADD CONSTRAINT users_municipality_id_fkey 
          FOREIGN KEY (municipality_id) REFERENCES municipalities(id);
        END IF;
      END $$;
    `);

    // Verificar y crear tabla activities si no existe
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS activities (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id varchar NOT NULL REFERENCES users(id),
        activity_type varchar NOT NULL,
        description text NOT NULL,
        metadata jsonb,
        created_at timestamp with time zone DEFAULT now()
      );
    `);

    // Verificar y crear tabla program_activities si no existe
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS program_activities (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        professional_id varchar NOT NULL REFERENCES users(id),
        title text NOT NULL,
        description text NOT NULL,
        activity_type text NOT NULL,
        instructions text,
        difficulty text DEFAULT 'medium',
        assigned_users integer DEFAULT 0,
        is_active boolean DEFAULT true,
        created_at timestamp with time zone DEFAULT now()
      );
    `);

    // Crear tabla professional_assignments con estructura correcta si no existe
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS professional_assignments (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        professional_id varchar NOT NULL REFERENCES users(id),
        elderly_user_id varchar NOT NULL REFERENCES users(id),
        municipality_id varchar REFERENCES municipalities(id),
        organization text,
        specialization text,
        can_view_full_profile boolean DEFAULT true,
        can_manage_all_reminders boolean DEFAULT true,
        can_receive_critical_alerts boolean DEFAULT true,
        is_active boolean DEFAULT true,
        assigned_by varchar REFERENCES users(id),
        created_at timestamp with time zone DEFAULT now(),
        UNIQUE(professional_id, elderly_user_id)
      );
    `);

    // Crear tabla conversation_summaries si no existe
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS conversation_summaries (
        user_id varchar PRIMARY KEY,
        summary_text text NOT NULL,
        updated_at timestamp with time zone DEFAULT now()
      );
    `);

    // Crear tabla memories si no existe
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS memories (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id varchar NOT NULL REFERENCES users(id),
        type varchar NOT NULL,
        content text NOT NULL,
        importance smallint DEFAULT 3,
        confidence real DEFAULT 0.5,
        content_hash varchar NOT NULL,
        expires_at timestamp with time zone,
        last_reinforced_at timestamp with time zone DEFAULT now(),
        created_at timestamp with time zone DEFAULT now(),
        UNIQUE(user_id, content_hash)
      );
    `);

    console.log("Database tables verified/created successfully");
  } catch (error) {
    console.error("Error ensuring tables exist:", error);
  }
}

// Ejecutar al importar el módulo
ensureTablesExist();

export const storage = {
  // User methods
  async getUserById(id: string) {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  },

  async getUserByEmail(email: string) {
    return db.query.users.findFirst({ where: eq(users.email, email) });
  },

  async createUser(data: typeof insertUserSchema) {
    return db.insert(users).values(data).returning();
  },

  // Reminder methods
  async getRemindersByUserId(userId: string) {
    return db.query.reminders.findMany({
      where: eq(reminders.userId, userId),
      orderBy: [reminders.dueDate],
    });
  },

  async createReminder(data: typeof insertReminderSchema) {
    return db.insert(reminders).values(data).returning();
  },

  async deleteReminder(id: string) {
    return db.delete(reminders).where(eq(reminders.id, id));
  },

  async updateReminderCompletion(id: string, completed: boolean) {
    return db.update(reminderCompletions).set({ completed }).where(eq(reminderCompletions.reminderId, id));
  },

  // Message methods
  async getMessagesByChatSessionId(chatSessionId: string) {
    return db.query.messages.findMany({
      where: eq(messages.chatSessionId, chatSessionId),
      orderBy: [messages.createdAt],
    });
  },

  async createMessage(data: typeof messages.$inferInsert) {
    return db.insert(messages).values(data).returning();
  },

  // Activity methods
  async getActivityById(id: string) {
    return db.query.activities.findFirst({ where: eq(activities.id, id) });
  },

  async logActivity(data: typeof activities.$inferInsert) {
    return db.insert(activities).values(data).returning();
  },

  // Chat session methods
  async getChatSessionsByUserId(userId: string) {
    return db.query.chatSessions.findMany({
      where: eq(chatSessions.userId, userId),
      orderBy: [chatSessions.createdAt],
    });
  },

  async createChatSession(data: typeof chatSessions.$inferInsert) {
    return db.insert(chatSessions).values(data).returning();
  },

  async updateChatSession(id: string, data: Partial<typeof chatSessions.$inferInsert>) {
    return db.update(chatSessions).set(data).where(eq(chatSessions.id, id));
  },

  // Metrics methods
  async logMetricsEvent(data: typeof metricsEvents.$inferInsert) {
    return db.insert(metricsEvents).values(data).returning();
  },

  async getAnalyticsByUserId(userId: string) {
    return db.query.analytics.findMany({ where: eq(analytics.userId, userId) });
  },

  async createAnalytics(data: typeof analytics.$inferInsert) {
    return db.insert(analytics).values(data).returning();
  },

  // Professional user methods
  async getUsersByProfessionalId(professionalId: string) {
    const assignments = await db.query.professionalAssignments.findMany({
      where: eq(professionalAssignments.professionalId, professionalId),
      with: {
        elderlyUser: true
      }
    });

    return assignments.map(a => a.elderlyUser);
  },

  // Conversation memory implementation
  async getConversationSummary(userId: string) {
    const result = await db.query.conversationSummaries.findFirst({
      where: eq(conversationSummaries.userId, userId)
    });
    return result?.summaryText;
  },

  async saveConversationSummary(userId: string, summary: string) {
    await db.insert(conversationSummaries)
      .values({ userId, summaryText: summary, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: conversationSummaries.userId,
        set: { summaryText: summary, updatedAt: new Date() }
      });
  },

  async appendChatTurn(userId: string, turn: { role: string; content: string }) {
    // Store in activities for audit trail
    await db.insert(activities).values({
      userId,
      activityType: turn.role === "user" ? "chat_user" : "chat_assistant",
      description: turn.content.slice(0, 500),
      metadata: { role: turn.role }
    });
  },

  // Structured memory system implementation
  async upsertMemories(userId: string, items: any[]) {
    const crypto = await import('crypto');

    for (const item of items) {
      const hash = crypto.createHash('sha256')
        .update(`${item.type}|${item.content.trim().toLowerCase()}`)
        .digest('hex');

      await db.insert(memories)
        .values({
          userId,
          type: item.type,
          content: item.content,
          importance: item.importance ?? 3,
          confidence: 0.6,
          contentHash: hash,
          expiresAt: item.expires_at || null,
          lastReinforcedAt: new Date(),
          createdAt: new Date()
        })
        .onConflictDoUpdate({
          target: [memories.userId, memories.contentHash],
          set: {
            confidence: sql`LEAST(1.0, ${memories.confidence} + 0.1)`,
            lastReinforcedAt: new Date(),
            importance: sql`GREATEST(${memories.importance}, ${item.importance ?? 3})`,
            expiresAt: item.expires_at || sql`${memories.expiresAt}`
          }
        });
    }
  },

  async getTopMemories(userId: string, limit: number) {
    const result = await db.execute(sql`
      WITH scored AS (
        SELECT *,
          LEAST(0.3, GREATEST(0, 0.3 - 0.3 * EXTRACT(EPOCH FROM (now() - last_reinforced_at)) / (30*24*3600))) AS recency_boost
        FROM ${memories}
        WHERE user_id = ${userId}
          AND (expires_at IS NULL OR expires_at > now())
      )
      SELECT type, content
      FROM scored
      ORDER BY (importance*0.6 + confidence*0.3 + recency_boost*0.1) DESC, last_reinforced_at DESC
      LIMIT ${limit}
    `);

    return result.rows as Array<{ type: string; content: string }>;
  },

  async deleteMemorias(userId: string) {
    await db.delete(memories).where(eq(memories.userId, userId));
    await db.delete(conversationSummaries).where(eq(conversationSummaries.userId, userId));
  },
};

// Migrations
export async function runMigrations() {
  try {
    await migrate(db, { migrationsFolder: "drizzle/migrations" });
    console.log("Migrations applied successfully");
  } catch (error) {
    console.error("Error applying migrations:", error);
  }
}