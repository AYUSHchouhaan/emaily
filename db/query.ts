import { eq, desc, and, or } from 'drizzle-orm';
import { db } from './drizzleclient';
import { users, rules } from './schema';


// User queries
export const userQueries = {
  // Get user by email
  getUserByEmail: async (email: string) => {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    return result[0] || null;
  },

  // Get user by ID
  getUserById: async (id: string) => {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    return result[0] || null;
  },

  // Create a new user
  createUser: async (userData: { email: string; hashedPassword?: string | null; username: string }) => {
    const result = await db
      .insert(users)
      .values(userData)
      .returning();
    
    return result[0];
  },

  // Update user password (for setting password after OAuth signup)
  updateUserPassword: async (id: string, hashedPassword: string) => {
    const result = await db
      .update(users)
      .set({ hashedPassword })
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  },
};

// Rules queries
export const rulesQueries = {
  // Get all rules for a user, ordered by priority (descending)
  getRulesByUser: async (userId: string) => {
    const result = await db
      .select()
      .from(rules)
      .where(eq(rules.userId, userId))
      .orderBy(desc(rules.priority));
    
    return result;
  },

  // Get active rules for a user
  getActiveRulesByUser: async (userId: string) => {
    const result = await db
      .select()
      .from(rules)
      .where(and(eq(rules.userId, userId), eq(rules.isActive, 1)))
      .orderBy(desc(rules.priority));
    
    return result;
  },

  // Get rule by ID
  getRuleById: async (id: string) => {
    const result = await db
      .select()
      .from(rules)
      .where(eq(rules.id, id))
      .limit(1);
    
    return result[0] || null;
  },

  // Create a new rule
  createRule: async (ruleData: {
    userId: string;
    name: string;
    condition: string;
    label: string;
    priority?: number;
  }) => {
    const result = await db
      .insert(rules)
      .values({
        ...ruleData,
        priority: ruleData.priority || 0,
      })
      .returning();
    
    return result[0];
  },

  // Update a rule
  updateRule: async (id: string, ruleData: Partial<{
    name: string;
    condition: string;
    label: string;
    priority: number;
    isActive: number;
  }>) => {
    const result = await db
      .update(rules)
      .set({
        ...ruleData,
        updatedAt: new Date(),
      })
      .where(eq(rules.id, id))
      .returning();
    
    return result[0];
  },

  // Delete a rule
  deleteRule: async (id: string) => {
    const result = await db
      .delete(rules)
      .where(eq(rules.id, id))
      .returning();
    
    return result[0];
  },

  // Toggle rule active status
  toggleRuleStatus: async (id: string) => {
    const rule = await db
      .select()
      .from(rules)
      .where(eq(rules.id, id))
      .limit(1);
    
    if (!rule[0]) return null;

    const newStatus = rule[0].isActive === 1 ? 0 : 1;
    const result = await db
      .update(rules)
      .set({ isActive: newStatus, updatedAt: new Date() })
      .where(eq(rules.id, id))
      .returning();
    
    return result[0];
  },
};