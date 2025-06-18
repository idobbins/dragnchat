import "server-only";

import { z } from "zod";
import { eq, and, like, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { projects } from "@/server/db/schema";

// Input validation schemas
const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(255, "Project name too long"),
  projectData: z.record(z.any()).default({}),
});

const updateProjectSchema = z.object({
  uuid: z.string().uuid("Invalid project UUID"),
  name: z
    .string()
    .min(1, "Project name is required")
    .max(255, "Project name too long")
    .optional(),
  projectData: z.record(z.any()).optional(),
});

const projectByUuidSchema = z.object({
  uuid: z.string().uuid("Invalid project UUID"),
});

const searchProjectsSchema = z.object({
  name: z.string().min(1, "Search term is required"),
});

export const projectsRouter = createTRPCRouter({
  // Get all projects for the authenticated user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userProjects = await ctx.db
        .select()
        .from(projects)
        .where(eq(projects.userId, ctx.user.userId!))
        .orderBy(desc(projects.updatedAt));

      return userProjects;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch projects",
      });
    }
  }),

  // Get a specific project by UUID
  getById: protectedProcedure
    .input(projectByUuidSchema)
    .query(async ({ ctx, input }) => {
      try {
        const project = await ctx.db
          .select()
          .from(projects)
          .where(
            and(
              eq(projects.uuid, input.uuid),
              eq(projects.userId, ctx.user.userId!),
            ),
          )
          .limit(1);

        if (project.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        }

        return project[0];
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch project",
        });
      }
    }),

  // Search projects by name
  searchByName: protectedProcedure
    .input(searchProjectsSchema)
    .query(async ({ ctx, input }) => {
      try {
        const matchingProjects = await ctx.db
          .select()
          .from(projects)
          .where(
            and(
              eq(projects.userId, ctx.user.userId!),
              like(projects.name, `%${input.name}%`),
            ),
          )
          .orderBy(desc(projects.updatedAt));

        return matchingProjects;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search projects",
        });
      }
    }),

  // Create a new project
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const newProject = await ctx.db
          .insert(projects)
          .values({
            name: input.name,
            userId: ctx.user.userId!,
            projectData: input.projectData,
          })
          .returning();

        return newProject[0];
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create project",
        });
      }
    }),

  // Update an existing project
  update: protectedProcedure
    .input(updateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if the project exists and belongs to the user
        const existingProject = await ctx.db
          .select()
          .from(projects)
          .where(
            and(
              eq(projects.uuid, input.uuid),
              eq(projects.userId, ctx.user.userId!),
            ),
          )
          .limit(1);

        if (existingProject.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        }

        // Build update object with only provided fields
        const updateData: Partial<typeof projects.$inferInsert> = {
          updatedAt: new Date(),
        };

        if (input.name !== undefined) {
          updateData.name = input.name;
        }

        if (input.projectData !== undefined) {
          updateData.projectData = input.projectData;
        }

        const updatedProject = await ctx.db
          .update(projects)
          .set(updateData)
          .where(
            and(
              eq(projects.uuid, input.uuid),
              eq(projects.userId, ctx.user.userId!),
            ),
          )
          .returning();

        return updatedProject[0];
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update project",
        });
      }
    }),

  // Delete a project
  delete: protectedProcedure
    .input(projectByUuidSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if the project exists and belongs to the user
        const existingProject = await ctx.db
          .select()
          .from(projects)
          .where(
            and(
              eq(projects.uuid, input.uuid),
              eq(projects.userId, ctx.user.userId!),
            ),
          )
          .limit(1);

        if (existingProject.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        }

        await ctx.db
          .delete(projects)
          .where(
            and(
              eq(projects.uuid, input.uuid),
              eq(projects.userId, ctx.user.userId!),
            ),
          );

        return { success: true, deletedUuid: input.uuid };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete project",
        });
      }
    }),

  // Duplicate an existing project
  duplicate: protectedProcedure
    .input(
      z.object({
        uuid: z.string().uuid("Invalid project UUID"),
        newName: z
          .string()
          .min(1, "New project name is required")
          .max(255, "Project name too long")
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // First get the project to duplicate
        const originalProject = await ctx.db
          .select()
          .from(projects)
          .where(
            and(
              eq(projects.uuid, input.uuid),
              eq(projects.userId, ctx.user.userId!),
            ),
          )
          .limit(1);

        if (originalProject.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        }

        const original = originalProject[0]!;
        const duplicateName = input.newName ?? `${original.name} (Copy)`;

        // Create the duplicate
        const duplicatedProject = await ctx.db
          .insert(projects)
          .values({
            name: duplicateName,
            userId: ctx.user.userId!,
            projectData: original.projectData,
          })
          .returning();

        return duplicatedProject[0];
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to duplicate project",
        });
      }
    }),
});
