import {
  users,
  tasks,
  type User,
  type UpsertUser,
  type Task,
  type InsertTask,
  type UpdateTask,
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Task operations
  getTasks(userId: string): Promise<Task[]>;
  getTask(id: number, userId: string): Promise<Task | undefined>;
  createTask(task: InsertTask, userId: string): Promise<Task>;
  updateTask(id: number, updates: UpdateTask, userId: string): Promise<Task | undefined>;
  deleteTask(id: number, userId: string): Promise<boolean>;
  getSharedTasks(userEmail: string): Promise<Task[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tasks: Map<number, Task>;
  private currentTaskId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.currentTaskId = 1;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      ...userData,
      id: userData.id!,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id!, user);
    return user;
  }

  // Task operations
  async getTasks(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.userId === userId);
  }

  async getTask(id: number, userId: string): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    return task && task.userId === userId ? task : undefined;
  }

  async createTask(taskData: InsertTask, userId: string): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = {
      ...taskData,
      id,
      userId,
      shareWith: taskData.shareWith || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updates: UpdateTask, userId: string): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task || task.userId !== userId) {
      return undefined;
    }

    const updatedTask: Task = {
      ...task,
      ...updates,
      updatedAt: new Date(),
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number, userId: string): Promise<boolean> {
    const task = this.tasks.get(id);
    if (!task || task.userId !== userId) {
      return false;
    }
    return this.tasks.delete(id);
  }

  async getSharedTasks(userEmail: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => 
      task.shareWith && task.shareWith.includes(userEmail)
    );
  }
}

// Initialize with database storage
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Task operations
  async getTasks(userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async getTask(id: number, userId: string): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id) && eq(tasks.userId, userId));
    return task || undefined;
  }

  async createTask(taskData: InsertTask, userId: string): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({
        ...taskData,
        userId,
      })
      .returning();
    return task;
  }

  async updateTask(id: number, updates: UpdateTask, userId: string): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id) && eq(tasks.userId, userId))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, id) && eq(tasks.userId, userId))
      .returning();
    return result.length > 0;
  }

  async getSharedTasks(userEmail: string): Promise<Task[]> {
    const allTasks = await db.select().from(tasks);
    return allTasks.filter(task => 
      task.shareWith && task.shareWith.includes(userEmail)
    );
  }
}

export const storage = new DatabaseStorage();
