import { NextResponse } from 'next/server';
import { TwelveLabs, TwelvelabsApi } from "twelvelabs-js";
import OpenAI from "openai";
import { BrowserUseClient } from "browser-use-sdk";

export async function POST(request: Request) {
    try {
        // const formData = await request.formData();
        // const actualVideoFile = formData.get('file') as File;

        // const client = new TwelveLabs({apiKey: process.env.TWELVELABS_API_KEY})

        // const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

        const browserUseClient = new BrowserUseClient({apiKey: process.env.BROWSER_USE_API_KEY!})

        // // (Twelvelabs) Step 1: Create index
        // let retrievedIndex = null;
        // let indexId = null;

        // try{
        //     const index = await client.indexes.create({indexName: "ar25-mini-hack-index",models: [{modelName: "marengo2.7",modelOptions: ["visual", "audio"]},{modelName: "pegasus1.2", modelOptions: ["visual", "audio"]}]})
        //     retrievedIndex = index;
        //     indexId = index.id;

        // }catch(error){
        //     retrievedIndex = await client.indexes.list({indexName: "ar25-mini-hack-index"});
        //     indexId = retrievedIndex.data[0].id;
        // }

        // console.log("Retrieved Index: ", retrievedIndex);
        // console.log("Index ID: ", indexId);

        // // (Twelvelabs) Step 2: Create task
        // const task = await client.tasks.create({indexId: indexId || "",videoFile: actualVideoFile})

        // // console.log("Task ID: ", task.id);

        // // check if task is completed
        // const task2 = await client.tasks.waitForDone(task.id!, {
        //     callback: (task: TwelvelabsApi.TasksRetrieveResponse) => {
        //       console.log(`  Status=${task.status}`);
        //     },
        // });
        // if (task2.status !== "ready") {
        //     throw new Error(`Indexing failed with status ${task2.status}`);
        // }

        // // (Twelvelabs) Step 3: Analyse video
        // const analysis = await client.analyze({videoId: task.id || "",prompt: "The video is a screen recording. Please explain what is going on in the screen recording video. Include the context of the web page.",})

        // console.log("Analysis: ", analysis.data);

        // // (OpenAI) Step 4: Generate steps
        // const response = await openai.chat.completions.create({model: "gpt-4o-2024-08-06",messages: [{ role: "system", content: "You are a helpful assistant. You are tasked with translating the text (from a multimodal model) into a structured format (a list of action steps). Each step should describe a specific action that was performed in the screen recording." },{role: "user",content: `Please analyze this screen recording description and convert it into structured action steps: ${analysis.data}`,},],response_format: {type: "json_schema",json_schema: {name: "action_steps",schema: {type: "object",properties: {action_steps: {type: "array",items: {type: "string",description: "A specific action that was performed in the screen recording"}}},required: ["action_steps"],additionalProperties: false}}}})

        // const actionSteps = JSON.parse(response.choices[0].message.content || '{}');
        // console.log("Response: ", actionSteps);
        // return NextResponse.json({ actionSteps });

        // (Browser-use) Step 5: Use agent to browse web
        const task3 = await browserUseClient.tasks.createTask({
            task: "Navigate to hackernews site and get article",
            flashMode: true
        })

        // Create a readable stream for the response
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                
                try {
                    // Send initial connection message
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', message: 'Stream started' })}\n\n`));
                    
                    for await (const step of task3.stream()) {
                        console.log('Streaming step:', step);
                        // Send each step as a JSON chunk with proper SSE format
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

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
       
    } catch (error) {
        console.error("Error processing video upload:", error);
        return NextResponse.json({ error: "An error occurred while processing the video upload" }, { status: 500 });
    }
}
