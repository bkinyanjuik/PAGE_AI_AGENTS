from fastapi import WebSocket
from typing import List, Dict
import json
import asyncio
from .config.model_config import AgentType, ModelConfig

class AgentWebsocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.agent_models: Dict[str, ModelConfig] = {}
        
    async def connect(self, websocket: WebSocket, agent_type: AgentType):
        await websocket.accept()
        self.active_connections.append(websocket)
        model_config = get_model_for_agent(agent_type)
        self.agent_models[websocket] = model_config
        
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        if websocket in self.agent_models:
            del self.agent_models[websocket]
        
    async def broadcast(self, message: Dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                await self.disconnect(connection)

manager = AgentWebsocketManager()
