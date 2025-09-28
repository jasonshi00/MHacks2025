import os
import sys
from dotenv import load_dotenv
from typing import Dict, Any

# --- LangChain Imports ---
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnableLambda, RunnablePassthrough
from langchain.schema.output_parser import StrOutputParser

# --- LangServe Imports ---
from fastapi import FastAPI
from langserve import add_routes
from pydantic import BaseModel

# --- Load API Key ---
load_dotenv()
if not os.getenv("OPENAI_API_KEY", "").startswith("sk-"):
    print("\nERROR: OpenAI API key NOT FOUND or is invalid in .env file.")
    sys.exit(1)

# --- 1. SETUP THE VECTOR STORE ---
VECTOR_STORE_PATH = "./vector_store_db"
embeddings = OpenAIEmbeddings()

if os.path.exists(VECTOR_STORE_PATH):
    vector_store = Chroma(persist_directory=VECTOR_STORE_PATH, embedding_function=embeddings)

retriever = vector_store.as_retriever()

# --- 2. DEFINE THE FULL RAG + FEEDBACK CHAIN ---

class GenerateRequest(BaseModel):
    request_json: Dict[Any, Any]

def _format_request_from_json(request: dict) -> str:
    json_data = request['request_json']
    return f"""
    - API Endpoint: {json_data.get('api_endpoint', {}).get('method')} {json_data.get('api_endpoint', {}).get('path')}
    - Application Logic: {json_data.get('application_logic', {}).get('description')}
    - Database Interaction: {json_data.get('database', {}).get('operation')}
    - Response Handling:
        - Success: {json_data.get('response_handler', {}).get('success')}
        - Failure: {json_data.get('response_handler', {}).get('failure')}
    """

def save_to_vector_store(generated_code: str) -> str:
    print("Adding generated code back to memory...")
    vector_store.add_texts([generated_code])
    print("Memory updated.")
    return generated_code

# ✅ --- NEW, IMPROVED PROMPT ---
prompt_template = """
You are an expert Python FastAPI code generation assistant. Your sole purpose is to write clean, production-ready, and syntactically correct Python code for an API endpoint.

Follow these instructions precisely:
1. Your response MUST be ONLY the raw Python code.
2. Do NOT include any explanations, introductory sentences, apologies, or any text other than the code itself.
3. Do NOT wrap the code in markdown fences like ```python ... ```.
4. Use the provided context from existing code to match the style and patterns perfectly.

---
## CONTEXT (Existing Code Examples)
{context}
---
## USER'S REQUEST
{question}
---
## GENERATED CODE:
"""
prompt = ChatPromptTemplate.from_template(prompt_template)
# --------------------------------

llm = ChatOpenAI(model_name="gpt-4-turbo", temperature=0) # Set temperature to 0 for more deterministic output

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

full_chain = (
    RunnableLambda(_format_request_from_json)
    | rag_chain
    | RunnableLambda(save_to_vector_store)
)

# --- 3. SETUP LANGSERVE API SERVER ---
app = FastAPI(
    title="Self-Improving Code Generation Agent",
    description="An API that generates code and learns from its own output.",
)

add_routes(
    app,
    full_chain,
    path="/generate",
    input_type=GenerateRequest,
)

if __name__ == "__main__":
    import uvicorn
    print("\n🚀 LangServe API server is ready.")
    print("Navigate to http://127.0.0.1:8000/generate/playground/ for a testing UI.")
    uvicorn.run(app, host="0.0.0.0", port=8000)
