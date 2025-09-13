import { NextResponse } from 'next/server';
import { TwelveLabs, TwelvelabsApi } from "twelvelabs-js";
import OpenAI from "openai";
import { BrowserUseClient } from "browser-use-sdk";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const actualVideoFile = formData.get('file') as File;

        const client = new TwelveLabs({apiKey: process.env.TWELVELABS_API_KEY})

        const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

        const browserUseClient = new BrowserUseClient({apiKey: process.env.BROWSER_USE_API_KEY!})

        // (Twelvelabs) Step 1: Create index
        const index = await client.indexes.create({indexName: "ar25-mini-hack-index",models: [{modelName: "marengo2.7",modelOptions: ["visual", "audio"]},{modelName: "pegasus1.2", modelOptions: ["visual", "audio"]}]})

        // console.log("Index ID: ", index.id);

        // (Twelvelabs) Step 2: Create task
        const task = await client.tasks.create({indexId: index.id || "",videoFile: actualVideoFile})

        // console.log("Task ID: ", task.id);

        // (Twelvelabs) Step 3: Analyse video
        const analysis = await client.analyze({videoId: "68c364dd36ebfbf321c09138",prompt: "The video is a screen recording. Please explain what is going on in the screen recording video. Include the context of the web page.",})

        console.log("Analysis: ", analysis.data);

        // (OpenAI) Step 4: Generate steps
        const response = await openai.chat.completions.create({model: "gpt-4o-2024-08-06",messages: [{ role: "system", content: "You are a helpful assistant. You are tasked with translating the text (from a multimodal model) into a structured format (a list of action steps). Each step should describe a specific action that was performed in the screen recording." },{role: "user",content: `Please analyze this screen recording description and convert it into structured action steps: ${analysis.data}`,},],response_format: {type: "json_schema",json_schema: {name: "action_steps",schema: {type: "object",properties: {action_steps: {type: "array",items: {type: "string",description: "A specific action that was performed in the screen recording"}}},required: ["action_steps"],additionalProperties: false}}}})

        const actionSteps = JSON.parse(response.choices[0].message.content || '{}');
        console.log("Response: ", actionSteps);

        // (Browser-use) Step 5: Use agent to browse web
        // const task3 = await browserUseClient.tasks.createTask({
        //     task: "Navigate to news site and get headlines",
        //     flashMode: true
        // })

        // for await (const step of task3.stream()) {
        //     console.log(step);
        // }

        // // return task3.stream()
        return NextResponse.json({ 
            message: "Video file uploaded successfully",
            fileInfo: {
                name: actualVideoFile.name,
                size: actualVideoFile.size,
                type: actualVideoFile.type
            }
        });
    } catch (error) {
        console.error("Error processing video upload:", error);
        return NextResponse.json({ error: "An error occurred while processing the video upload" }, { status: 500 });
    }
}
