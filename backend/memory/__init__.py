from langchain.vectorstores import Qdrant
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.chains import ConversationalRetrievalChain
import os

class AgentMemory:
    def __init__(self):
        """Initialize the memory system with Qdrant vector store"""
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.qdrant = Qdrant(
            url=os.getenv("QDRANT_URL"),
            embeddings=self.embeddings
        )
        
    def store_memory(self, text: str, metadata: dict = None):
        """Store new memory in vector store"""
        try:
            return self.qdrant.add_texts(
                texts=[text],
                metadatas=[metadata] if metadata else None
            )
        except Exception as e:
            print(f"Error storing memory: {str(e)}")
            return None

    def get_memory_chain(self, llm=None):
        """Create a conversational chain with memory"""
        try:
            return ConversationalRetrievalChain.from_llm(
                llm=llm,
                retriever=self.qdrant.as_retriever(
                    search_kwargs={"k": 5}  # Return top 5 relevant memories
                )
            )
        except Exception as e:
            print(f"Error creating memory chain: {str(e)}")
            return None

    def search_memories(self, query: str, limit: int = 5):
        """Search for relevant memories"""
        try:
            return self.qdrant.similarity_search(
                query=query,
                k=limit
            )
        except Exception as e:
            print(f"Error searching memories: {str(e)}")
            return []
