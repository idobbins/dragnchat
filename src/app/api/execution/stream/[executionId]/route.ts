import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { executionSessionManager } from "@/lib/execution/session-manager";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ executionId: string }> },
) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { executionId } = await params;

    // Get the execution session
    const session = executionSessionManager.getSession(executionId);
    if (!session) {
      return new Response("Execution session not found", { status: 404 });
    }

    // Verify user owns this session
    if (session.userId !== userId) {
      return new Response("Forbidden", { status: 403 });
    }

    // Create SSE stream
    let streamController:
      | ReadableStreamDefaultController<Uint8Array>
      | undefined;

    const stream = new ReadableStream({
      start(controller) {
        streamController =
          controller as ReadableStreamDefaultController<Uint8Array>;

        // Add controller to session
        executionSessionManager.addController(
          executionId,
          controller as ReadableStreamDefaultController<Uint8Array>,
        );

        // Send initial connection message
        const initialMessage = `data: ${JSON.stringify({
          type: "connected",
          data: {
            sessionId: executionId,
            status: session.status,
            totalNodes: session.totalNodes,
            completedNodes: session.completedNodes,
            currentNodeId: session.currentNodeId,
          },
        })}\n\n`;

        try {
          controller.enqueue(new TextEncoder().encode(initialMessage));
        } catch (error) {
          console.error("Error sending initial SSE message:", error);
        }

        // If session is already completed, send completion message
        if (session.status !== "running") {
          const completionMessage = `data: ${JSON.stringify({
            type: "complete",
            data: {
              sessionId: executionId,
              success: session.status === "completed",
              errors: session.errors,
              totalNodes: session.totalNodes,
              completedNodes: session.completedNodes,
              duration: session.endTime
                ? session.endTime.getTime() - session.startTime.getTime()
                : 0,
            },
          })}\n\n`;

          try {
            controller.enqueue(new TextEncoder().encode(completionMessage));
            controller.close();
          } catch (error) {
            console.error("Error sending completion SSE message:", error);
          }
        }
      },
      cancel() {
        // Remove controller from session when client disconnects
        if (streamController) {
          executionSessionManager.removeController(
            executionId,
            streamController,
          );
        }
      },
    });

    // Return SSE response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    });
  } catch (error) {
    console.error("SSE stream error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
