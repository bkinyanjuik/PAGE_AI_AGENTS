from fastapi import FastAPI, HTTPException, WebSocket
from pydantic import BaseModel
from typing import List, Dict
from .memory import AgentMemory
from .workflows import FinTechWorkflows
from .websocket import manager
from .models.metrics import metrics_store, AgentMetrics, WorkflowMetrics
import os

app = FastAPI(title="FinTech AI Agents API")
memory = AgentMemory()
workflows = FinTechWorkflows(memory.get_memory_chain())

class WorkflowRequest(BaseModel):
    workflow_type: str
    parameters: Dict = {}

@app.post("/workflows/credit-scoring")
async def run_credit_scoring_workflow(request: WorkflowRequest):
    """Run the credit scoring development workflow"""
    try:
        crew = workflows.credit_scoring_development()
        result = crew.kickoff()
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/workflows/compliance-review")
async def run_compliance_review(request: WorkflowRequest):
    """Run the compliance review workflow"""
    try:
        crew = workflows.compliance_review_workflow()
        result = crew.kickoff()
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/workflows/product-development")
async def run_product_development(request: WorkflowRequest):
    """Run the product development workflow"""
    try:
        crew = workflows.product_development()
        result = crew.kickoff()
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/workflows/risk-assessment")
async def run_risk_assessment(request: WorkflowRequest):
    """Run the risk assessment workflow"""
    try:
        crew = workflows.risk_assessment()
        result = crew.kickoff()
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle any incoming messages if needed
    except:
        manager.disconnect(websocket)

@app.get("/api/agents")
async def get_agents():
    """Get status of all agents"""
    return metrics_store.get_all_agents()

@app.get("/api/workflows")
async def get_workflows():
    """Get status of all workflows"""
    return metrics_store.get_all_workflows()

@app.post("/api/metrics/agent")
async def update_agent_metrics(metrics: AgentMetrics):
    metrics_store.update_agent(metrics)
    await manager.broadcast({
        "type": "agent_update",
        "agent": metrics.dict()
    })
    return {"status": "success"}

@app.post("/api/metrics/workflow")
async def update_workflow_metrics(metrics: WorkflowMetrics):
    metrics_store.update_workflow(metrics)
    await manager.broadcast({
        "type": "workflow_update",
        "workflow": metrics.dict()
    })
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
