import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";
import { DAGExecutor } from "@/lib/execution/dag-executor";
import type { CustomNode, CustomEdge } from "@/app/_components/editor/editor";

// Interface for Clerk private metadata
interface ClerkPrivateMetadata {
  openrouterApiKey?: string;
}

// Input validation schemas
const executeWorkflowSchema = z.object({
  projectId: z.string().uuid("Invalid project UUID"),
  nodes: z.array(z.any()), // CustomNode array
  edges: z.array(z.any()), // CustomEdge array
});

const validateWorkflowSchema = z.object({
  nodes: z.array(z.any()), // CustomNode array
  edges: z.array(z.any()), // CustomEdge array
});

export const executionRouter = createTRPCRouter({
  // Execute a workflow
  executeWorkflow: protectedProcedure
    .input(executeWorkflowSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.user.userId) {
          throw new Error("User ID not found");
        }

        // Get the user's API key from Clerk private metadata
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(ctx.user.userId);
        const privateMetadata = user.privateMetadata as ClerkPrivateMetadata;
        const apiKey = privateMetadata?.openrouterApiKey;

        if (!apiKey) {
          throw new Error(
            "OpenRouter API key not found. Please add your API key in your profile.",
          );
        }

        // Create execution context
        const executionContext = {
          projectId: input.projectId,
          userId: ctx.user.userId,
          apiKey,
        };

        // Create and execute the DAG
        const executor = new DAGExecutor(
          input.nodes as CustomNode[],
          input.edges as CustomEdge[],
          executionContext
        );

        const result = await executor.execute();
        
        if (!result.success) {
          return {
            success: false,
            errors: result.errors,
          };
        }

        // Get execution results
        const executionResults = executor.getExecutionResults();

        return {
          success: true,
          results: executionResults,
        };
      } catch (error) {
        return {
          success: false,
          errors: [error instanceof Error ? error.message : "Unknown execution error"],
        };
      }
    }),

  // Validate a workflow without executing it
  validateWorkflow: protectedProcedure
    .input(validateWorkflowSchema)
    .query(async ({ input }) => {
      try {
        // Create a dummy execution context for validation
        const executionContext = {
          projectId: "dummy",
          userId: "dummy",
          apiKey: "dummy",
        };

        // Create executor just for validation
        const executor = new DAGExecutor(
          input.nodes as CustomNode[],
          input.edges as CustomEdge[],
          executionContext
        );

        const graph = executor.getGraph();
        const validation = await import("@/lib/execution/utils").then(
          (utils) => utils.validateExecutionGraph(graph)
        );

        return {
          valid: validation.valid,
          errors: validation.errors,
          executionOrder: graph.executionOrder,
        };
      } catch (error) {
        return {
          valid: false,
          errors: [error instanceof Error ? error.message : "Validation error"],
          executionOrder: [],
        };
      }
    }),

  // Get execution status for a workflow (placeholder for future real-time updates)
  getExecutionStatus: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ input }) => {
      // This is a placeholder for future real-time execution status
      // For now, we'll return a simple status
      return {
        projectId: input.projectId,
        status: "idle" as const,
        progress: 0,
        currentNode: null,
      };
    }),
});
