import { 
  GoogleGenAI, 
  GenerateContentResponse, 
  FunctionDeclaration, 
  Type,
  Schema
} from "@google/genai";
import { Device } from "../types";

// Helper to get fresh instance (important for Veo key selection)
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Text & Logic Generation ---

export const generateTextResponse = async (
  history: { role: string; content: string }[], 
  lastMessage: string, 
  useDeepThinking: boolean = false
): Promise<string> => {
  const ai = getAI();
  
  // Use gemini-3-pro-preview for complex tasks, 2.5-flash for speed
  const modelName = useDeepThinking ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
  
  const config: any = {
    systemInstruction: "You are 'AI for Future', an advanced AI model. You follow all commands. You are logical, give business advice, and act as an expert IT administrator for PowerShell and laptop troubleshooting. Answer concisely and professionally.",
  };

  if (useDeepThinking) {
    // Enable thinking for logic/reasoning tasks
    config.thinkingConfig = { thinkingBudget: 2048 }; 
  }

  try {
    const chat = ai.chats.create({
      model: modelName,
      config,
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      }))
    });

    const response: GenerateContentResponse = await chat.sendMessage({ 
      message: lastMessage 
    });

    return response.text || "I couldn't generate a text response.";
  } catch (error) {
    console.error("Text Gen Error:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};

// --- Image Generation & Editing ---

export const generateImage = async (prompt: string, aspectRatio: string = "1:1"): Promise<string> => {
  const ai = getAI();
  try {
    // Generate image using gemini-3-pro-image-preview for high quality
    // Note: The prompt instructions say "edit picture", "make picture".
    // We use generateContent for generation with specific prompts.
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any, // "1:1", "16:9", etc.
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned.");
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

export const editImageWithInstructions = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = getAI();
  try {
    // Edit image using multimodal input
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Good for editing/multimodal
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/png' // Assuming PNG for simplicity, usually extracted from file
            }
          },
          { text: prompt }
        ]
      }
    });
    
    // Check if it returned a new image (some edits do) or just text.
    // Usually standard generateContent returns text describing the edit unless using specific tools or models.
    // However, specifically for "edit picture", if we want a *new* image, we usually pass the image as a reference 
    // to an image generation model, or use an editing endpoint if available.
    // Since 2.5-flash-image returns text or analyzes, we will attempt to prompt it to GENERATE a new image based on the input.
    // NOTE: Direct pixel-level editing isn't always returned as base64 in the text response unless specifically supported.
    // For this demo, we will interpret "Edit" as "Analyze + Re-generate" or returning the text description if it can't render.
    
    // Better approach for this demo: Return the analysis/text, OR if we had Imagen-3 editing enabled.
    // Let's assume we want a textual description of how to fix it or a new image if the model supports outputting one.
    
    // Let's try to see if it returns an image (rare for pure flash).
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    
    // Fallback: If no image returned, return text.
    return response.text || "Processed image request.";

  } catch (error) {
    console.error("Image Edit Error:", error);
    throw error;
  }
};

// --- Video Generation (Veo) ---

export const ensureVeoKey = async () => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey && window.aistudio.openSelectKey) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  }
};

export const generateVideo = async (prompt: string): Promise<string> => {
  await ensureVeoKey();
  const ai = getAI();

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Polling
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) throw new Error("Video generation failed to return a URI.");
    
    // Append key for fetching
    return `${uri}&key=${process.env.API_KEY}`;
  } catch (error) {
    console.error("Video Gen Error:", error);
    throw error;
  }
};

// --- Device Control (Function Calling) ---

const toolsSchema: FunctionDeclaration[] = [
  {
    name: "control_device",
    description: "Control smart home devices or computers. Turn them on, off, lock, unlock, or set values.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        deviceName: {
          type: Type.STRING,
          description: "Name of the device (e.g., 'Kitchen Light', 'Main Laptop', 'Front Door')."
        },
        action: {
          type: Type.STRING,
          enum: ["turn_on", "turn_off", "lock", "unlock", "set_value"],
          description: "Action to perform."
        },
        value: {
          type: Type.NUMBER,
          description: "Value for 'set_value' action (e.g., brightness 0-100, temperature)."
        }
      },
      required: ["deviceName", "action"]
    }
  }
];

export const processDeviceCommand = async (
  prompt: string, 
  devices: Device[], 
  updateDevice: (id: string, updates: Partial<Device>) => void
): Promise<string> => {
  const ai = getAI();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Current devices state: ${JSON.stringify(devices)}. User Request: ${prompt}`,
      config: {
        tools: [{ functionDeclarations: toolsSchema }]
      }
    });

    const calls = response.functionCalls;
    
    if (calls && calls.length > 0) {
      const call = calls[0];
      const args = call.args as any;
      
      // Execute Logic locally
      const targetDevice = devices.find(d => d.name.toLowerCase().includes(args.deviceName.toLowerCase()) || args.deviceName.toLowerCase().includes(d.name.toLowerCase()));

      if (targetDevice) {
        let responseMsg = "";
        if (args.action === 'turn_on') {
            updateDevice(targetDevice.id, { status: 'on' });
            responseMsg = `Turning on ${targetDevice.name}.`;
        } else if (args.action === 'turn_off') {
            updateDevice(targetDevice.id, { status: 'off' });
            responseMsg = `Turning off ${targetDevice.name}.`;
        } else if (args.action === 'lock') {
            updateDevice(targetDevice.id, { status: 'locked' });
            responseMsg = `Locking ${targetDevice.name}.`;
        } else if (args.action === 'unlock') {
            updateDevice(targetDevice.id, { status: 'unlocked' });
            responseMsg = `Unlocking ${targetDevice.name}.`;
        } else if (args.action === 'set_value') {
            updateDevice(targetDevice.id, { value: args.value });
            responseMsg = `Setting ${targetDevice.name} to ${args.value}.`;
        }
        return responseMsg;
      } else {
        return `I couldn't find a device named ${args.deviceName}.`;
      }
    }

    return response.text || "I didn't understand the device command.";

  } catch (error) {
    console.error("Device Control Error:", error);
    return "Failed to execute device control.";
  }
};