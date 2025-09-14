import { NextResponse } from 'next/server';
import { BrowserUseClient } from "browser-use-sdk";

export async function POST(request: Request) {
    const body = await request.json();
    const textInput = body.text as string;

    if (!textInput || !textInput.trim()) {
        return NextResponse.json({ error: "Text input is required" }, { status: 400 });
    }

    const browserUseClient = new BrowserUseClient({apiKey: process.env.BROWSER_USE_API_KEY!})

    // (Browser-use) Use agent to browse web based on text input
    const task3 = await browserUseClient.tasks.createTask({
        task: textInput,
        flashMode: true
    })

    // Create a readable stream for the response
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            
            try {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', message: 'Stream started' })}\n\n`));
                
                for await (const step of task3.stream()) {
                    const chunk = `data: ${JSON.stringify({ type: 'step', data: step, timestamp: new Date().toISOString() })}\n\n`;
                    controller.enqueue(encoder.encode(chunk));
                }
                
                // Send completion message
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'completed', message: 'Task completed' })}\n\n`));
                controller.close();
            } catch (error) {
                console.error('Stream error:', error);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: error instanceof Error ? error.message : 'Unknown error' })}\n\n`));
                controller.close();
            }
        }
    });

    return new Response(stream, {headers: {'Content-Type': 'text/event-stream','Cache-Control': 'no-cache','Connection': 'keep-alive','Access-Control-Allow-Origin': '*','Access-Control-Allow-Methods': 'GET, POST, OPTIONS','Access-Control-Allow-Headers': 'Content-Type',},});
}
