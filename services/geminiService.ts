
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Gemma 3 Powered Smart OCR & Extraction
 * Optimized for Bakery Wholesaler Invoices
 */
export const parseInvoiceImage = async (base64Image: string) => {
  if (!API_KEY || API_KEY === "PLACEHOLDER_API_KEY" || API_KEY === "") {
    console.warn("BITA AI: Gemini API Key is missing. Smart Scan disabled.");
    return null;
  }

  // Using Gemma 3 27B for maximum accuracy and multimodal understanding
  const modelName = 'gemma-3-27b-it';

  try {
    console.log(`BITA AI: Initializing ${modelName} for deep scan...`);

    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
      You are the BITA (Bakery Intelligence & Tracking Assistant) specialized in OCR.
      Analyze this invoice/receipt image from a bakery vendor with 100% precision.
      
      EXTRACT THE FOLLOWING INTO JSON:
      1. vendorName: The clear name of the wholesaler/vendor.
      2. invoiceNumber: The unique bill/invoice number.
      3. issueDate: The date the invoice was issued in YYYY-MM-DD format.
      4. lineItems: Array of objects with { name (item description), category (e.g. Flour, Dairy, Sugar), quantity, unitPrice, total }.
      5. totalAmount: The final grand total of the invoice.

      RULES:
      - If a field is missing, use null or appropriate defaults.
      - Return ONLY the raw JSON object. No markdown tags, no preamble.
      - Ensure mathematical consistency (quantity * unitPrice should match total).
      - Look specifically for "Date", "Invoice Date", "Tax Invoice Date".
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    let jsonStr = response.text();

    // Aggressive cleaning of the response
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();

    // Find the first { and last } to isolate JSON if the model added extra text
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }

    const parsedData = JSON.parse(jsonStr);
    console.log("BITA AI: Scan successful.", parsedData.vendorName);
    return parsedData;
  } catch (e) {
    console.error("BITA AI: Gemma 3 engine failure:", e);
    // Fallback if gemma-3 is not yet mapped correctly in the SDK version
    return fallbackToGemini(base64Image);
  }
};

const fallbackToGemini = async (base64Image: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([
      "Extract invoice data as JSON: vendorName, invoiceNumber, date, lineItems, totalAmount.",
      { inlineData: { mimeType: "image/jpeg", data: base64Image } }
    ]);
    const text = result.response.text();
    return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
  } catch (err) {
    return null;
  }
};
