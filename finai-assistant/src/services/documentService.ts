import { Document } from "@langchain/core/documents";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Gemini API Key
const GEMINI_API_KEY = "AIzaSyBBINhHV1--cR8VisK8UKxf0oEfeNhmd_g";

// Initialize embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GEMINI_API_KEY,
  modelName: "embedding-001",
});

// Create a ChromaDB collection for financial documents
let documentStore: Chroma | null = null;

// Initialize the vector store
export const initDocumentStore = async () => {
  try {
    // Try to load existing store
    documentStore = await Chroma.fromExistingCollection(embeddings, { collectionName: "financial_documents" });
    console.log("Loaded existing document store");
  } catch (error) {
    // Create new store if it doesn't exist
    documentStore = await Chroma.fromDocuments([], embeddings, { collectionName: "financial_documents" });
    console.log("Created new document store");
  }
  return documentStore;
};

// Add a document to the store
export const addDocument = async (
  content: string,
  metadata: Record<string, any> = {}
) => {
  if (!documentStore) {
    await initDocumentStore();
  }

  // Split text into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await textSplitter.createDocuments(
    [content],
    [metadata]
  );

  // Add to vector store
  await documentStore!.addDocuments(docs);
  return docs.length;
};

// Search for relevant documents
export const searchDocuments = async (query: string, k: number = 5) => {
  if (!documentStore) {
    await initDocumentStore();
  }

  const results = await documentStore!.similaritySearch(query, k);
  return results;
};

// Get document by ID
export const getDocumentById = async (docId: string) => {
  if (!documentStore) {
    await initDocumentStore();
  }

  // Implementation depends on the specific Chroma client
  // This is a placeholder for the actual implementation
  // return await documentStore!.get({ ids: [docId] });
};

// Delete document by ID
export const deleteDocumentById = async (docId: string) => {
  if (!documentStore) {
    await initDocumentStore();
  }

  // Implementation depends on the specific Chroma client
  // await documentStore!.delete({ ids: [docId] });
}; 