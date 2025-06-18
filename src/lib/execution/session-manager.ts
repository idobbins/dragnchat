// Execution session management for real-time updates

import type { ExecutionProgress } from "./types";

export interface ExecutionSession {
  id: string;
  projectId: string;
  userId: string;
  status: "running" | "completed" | "error" | "cancelled";
  startTime: Date;
  endTime?: Date;
  currentNodeId?: string;
  totalNodes: number;
  completedNodes: number;
  errors: string[];
  controllers: Set<ReadableStreamDefaultController<Uint8Array>>; // SSE stream controllers
}

class ExecutionSessionManager {
  private sessions = new Map<string, ExecutionSession>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up completed sessions every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupCompletedSessions();
      },
      5 * 60 * 1000,
    );
  }

  /**
   * Create a new execution session
   */
  createSession(projectId: string, userId: string, totalNodes: number): string {
    const sessionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: ExecutionSession = {
      id: sessionId,
      projectId,
      userId,
      status: "running",
      startTime: new Date(),
      totalNodes,
      completedNodes: 0,
      errors: [],
      controllers: new Set(),
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  /**
   * Get an execution session
   */
  getSession(sessionId: string): ExecutionSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Add SSE controller to session
   */
  addController(
    sessionId: string,
    controller: ReadableStreamDefaultController<Uint8Array>,
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.controllers.add(controller);
    return true;
  }

  /**
   * Remove SSE controller from session
   */
  removeController(
    sessionId: string,
    controller: ReadableStreamDefaultController<Uint8Array>,
  ): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.controllers.delete(controller);
    }
  }

  /**
   * Broadcast progress update to all clients
   */
  broadcastProgress(sessionId: string, progress: ExecutionProgress): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Update session state
    session.currentNodeId = progress.nodeId;

    if (progress.status === "completed") {
      session.completedNodes++;
    } else if (progress.status === "error") {
      session.errors.push(progress.error ?? "Unknown error");
    }

    // Create SSE message
    const sseData = {
      type: "progress",
      data: {
        ...progress,
        sessionId,
        totalNodes: session.totalNodes,
        completedNodes: session.completedNodes,
      },
    };

    const message = `data: ${JSON.stringify(sseData)}\n\n`;
    const encoder = new TextEncoder();

    // Send to all connected clients
    const deadControllers: ReadableStreamDefaultController<Uint8Array>[] = [];

    for (const controller of session.controllers) {
      try {
        controller.enqueue(encoder.encode(message));
      } catch {
        // Client disconnected, mark for removal
        deadControllers.push(controller);
      }
    }

    // Remove dead controllers
    deadControllers.forEach((controller) =>
      session.controllers.delete(controller),
    );
  }

  /**
   * Mark session as completed
   */
  completeSession(
    sessionId: string,
    success: boolean,
    errors: string[] = [],
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.status = success ? "completed" : "error";
    session.endTime = new Date();
    session.errors.push(...errors);

    // Broadcast completion
    const sseData = {
      type: "complete",
      data: {
        sessionId,
        success,
        errors: session.errors,
        totalNodes: session.totalNodes,
        completedNodes: session.completedNodes,
        duration: session.endTime.getTime() - session.startTime.getTime(),
      },
    };

    const message = `data: ${JSON.stringify(sseData)}\n\n`;
    const encoder = new TextEncoder();

    // Send completion message to all clients and close streams
    for (const controller of session.controllers) {
      try {
        controller.enqueue(encoder.encode(message));
        controller.close();
      } catch {
        // Ignore errors when closing
      }
    }

    // Clear controllers
    session.controllers.clear();
  }

  /**
   * Cancel an execution session
   */
  cancelSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "running") return false;

    session.status = "cancelled";
    session.endTime = new Date();

    // Broadcast cancellation
    const sseData = {
      type: "cancelled",
      data: {
        sessionId,
        message: "Execution cancelled by user",
      },
    };

    const message = `data: ${JSON.stringify(sseData)}\n\n`;
    const encoder = new TextEncoder();

    // Send cancellation message to all clients and close streams
    for (const controller of session.controllers) {
      try {
        controller.enqueue(encoder.encode(message));
        controller.close();
      } catch {
        // Ignore errors when closing
      }
    }

    session.controllers.clear();
    return true;
  }

  /**
   * Clean up completed sessions older than 1 hour
   */
  private cleanupCompletedSessions(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    for (const [sessionId, session] of this.sessions) {
      if (
        session.status !== "running" &&
        session.endTime &&
        session.endTime < oneHourAgo
      ) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Get all active sessions for a user
   */
  getUserSessions(userId: string): ExecutionSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.userId === userId,
    );
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Close all active sessions
    for (const session of this.sessions.values()) {
      if (session.status === "running") {
        this.cancelSession(session.id);
      }
    }

    this.sessions.clear();
  }
}

// Singleton instance
export const executionSessionManager = new ExecutionSessionManager();

// Cleanup on process exit
process.on("SIGINT", () => {
  executionSessionManager.destroy();
  process.exit(0);
});

process.on("SIGTERM", () => {
  executionSessionManager.destroy();
  process.exit(0);
});
