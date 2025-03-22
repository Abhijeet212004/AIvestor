import { RunnableSequence } from "@langchain/core/runnables";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { searchDocuments } from "./documentService";
import { formatDocumentsAsString } from "langchain/util/document";

// Gemini API Key
const GEMINI_API_KEY = "AIzaSyBBINhHV1--cR8VisK8UKxf0oEfeNhmd_g";

// Initialize the LLM
const llm = new ChatGoogleGenerativeAI({
  apiKey: GEMINI_API_KEY,
  modelName: "gemini-pro",
  temperature: 0.7,
  maxOutputTokens: 1024,
});

// System prompt for the RAG chain
const SYSTEM_TEMPLATE = `You are FinAI, a sophisticated financial assistant powered by the latest AI technology.
Your goal is to provide accurate, helpful and ethical financial advice.

Use the following pieces of retrieved context to answer the user's question. 
If you don't know the answer or the context doesn't provide the necessary information, 
just say that you don't know, don't try to make up an answer.

Context: {context}

User preferences: {preferences}

When answering, provide thoughtful analysis and clear explanations. 
Reference specific information from the context when applicable.
Always present information clearly and avoid financial jargon unless necessary.

User's question: {question}
`;

const promptTemplate = PromptTemplate.fromTemplate(SYSTEM_TEMPLATE);

// Create RAG chain
export const createRagChain = () => {
  const ragChain = RunnableSequence.from([
    {
      context: async (input: { question: string; preferences: string }) => {
        const docs = await searchDocuments(input.question);
        return formatDocumentsAsString(docs);
      },
      question: (input: { question: string; preferences: string }) => input.question,
      preferences: (input: { question: string; preferences: string }) => input.preferences,
    },
    promptTemplate,
    llm,
    new StringOutputParser(),
  ]);

  return ragChain;
};

// Process a query through the RAG chain
export const processQuery = async (
  query: string, 
  userPreferences: string = ""
) => {
  const chain = createRagChain();
  const response = await chain.invoke({
    question: query,
    preferences: userPreferences,
  });
  return response;
}; 