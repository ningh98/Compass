from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from google import genai
import json
from pydantic import BaseModel
from typing import List, Dict, Any
from app import models, db
from dotenv import load_dotenv
import os

load_dotenv()

# Initialize Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter(prefix="/api/knowledge-graph")

class Node(BaseModel):
    id: str
    label: str
    type: str  # "topic" or "title"
    roadmap_id: int = None
    group: int = None  # For coloring different roadmaps

class Edge(BaseModel):
    source: str
    target: str
    weight: float = 1.0
    relationship: str = "related"

class KnowledgeGraphResponse(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

@router.get("/", response_model=KnowledgeGraphResponse)
async def get_knowledge_graph(db_conn: Session = Depends(db.get_db)):
    """
    Generate knowledge graph data showing relationships between topics and titles.
    Returns nodes (topics/titles) and edges (connections) for visualization.
    """

    try:
        # Get all roadmaps with their items
        roadmaps = db_conn.query(models.Roadmap).all()
        roadmap_items = db_conn.query(models.RoadmapItem).all()

        if not roadmaps:
            return {"nodes": [], "edges": []}

        # Prepare content for AI analysis
        content_map = {}

        # Collect all topics and titles
        for roadmap in roadmaps:
            content_map[f"topic_{roadmap.id}"] = {
                "type": "topic",
                "content": roadmap.topic,
                "description": f"{roadmap.topic}: {roadmap.experience}",
                "roadmap_id": roadmap.id
            }

        for item in roadmap_items:
            content_map[f"title_{item.id}"] = {
                "type": "title",
                "content": item.title,
                "description": f"{item.title}: {item.summary}",
                "roadmap_id": item.roadmap_id
            }

        # Create intra-roadmap connections (topics to their titles)
        nodes = []
        edges = []

        # Assign group numbers for coloring (each roadmap gets a different color)
        roadmap_groups = {}
        group_counter = 0
        for roadmap in roadmaps:
            roadmap_groups[roadmap.id] = group_counter
            group_counter += 1

        # Create nodes
        for key, data in content_map.items():
            node = Node(
                id=key,
                label=data["content"],
                type=data["type"],
                roadmap_id=data["roadmap_id"],
                group=roadmap_groups.get(data["roadmap_id"], 0)
            )
            nodes.append(node)

        # Create intra-roadmap edges (topic -> titles in same roadmap)
        for item in roadmap_items:
            edges.append(Edge(
                source=f"topic_{item.roadmap_id}",
                target=f"title_{item.id}",
                weight=3.0,
                relationship="contains"
            ))

        # Analyze inter-roadmap relationships using AI
        if len([n for n in nodes if n.type == "title"]) > 1:
            title_nodes = [n for n in nodes if n.type == "title"]
            inter_edges = await analyze_relationships(title_nodes)

            # Filter out duplicate edges and add to main edges list
            existing_edges = {(e.source, e.target) for e in edges}
            for edge in inter_edges:
                if (edge.source, edge.target) not in existing_edges:
                    edges.append(edge)

        return {"nodes": nodes, "edges": edges}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate knowledge graph: {str(e)}")

async def analyze_relationships(title_nodes: List[Node]) -> List[Edge]:
    """Use AI to analyze relationships between different titles from different roadmaps."""

    if len(title_nodes) < 2:
        return []

    try:
        # Prepare content for AI analysis
        content_list = []
        for node in title_nodes:
            if node.type == "title":
                content_list.append({
                    "id": node.id,
                    "label": node.label,
                    "roadmap_id": node.roadmap_id
                })

        # Create prompt for relationship analysis
        relationships_prompt = f"""
        Analyze the following learning topics (titles) and identify meaningful relationships between them.
        Each topic is from a different learning roadmap (roadmap_id indicates which roadmap).

        Topics to analyze:
        {json.dumps(content_list, indent=2)}

        Instructions:
        1. Look for prerequisite relationships (where one topic is foundational for another)
        2. Look for complementary relationships (topics that build upon each other)
        3. Look for conceptual connections (sharing similar concepts or techniques)
        4. Consider cross-domain knowledge transfer (e.g., math concepts in programming)

        Return ONLY valid JSON with this exact structure:
        {{
          "relationships": [
            {{
              "source_id": "title_X",
              "target_id": "title_Y",
              "relationship_type": "prerequisite|complementary|conceptual|transfer",
              "weight": 1.0 to 3.0,
              "explanation": "Brief explanation of the relationship"
            }}
          ]
        }}

        - Only include relationships between titles from DIFFERENT roadmaps
        - weight 1.0 = weak connection, 2.0 = moderate, 3.0 = strong
        - Be selective - don't create meaningless connections
        - Focus on educational/practical relationships
        """

        # Call Gemini API
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=relationships_prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "object",
                    "properties": {
                        "relationships": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "source_id": {"type": "string"},
                                    "target_id": {"type": "string"},
                                    "relationship_type": {"type": "string"},
                                    "weight": {"type": "number"},
                                    "explanation": {"type": "string"}
                                },
                                "required": ["source_id", "target_id", "relationship_type", "weight", "explanation"]
                            }
                        }
                    },
                    "required": ["relationships"]
                }
            }
        )

        relationships_data = response.parsed

        # Convert to Edge objects
        edges = []
        for rel in relationships_data["relationships"]:
            edges.append(Edge(
                source=rel["source_id"],
                target=rel["target_id"],
                weight=float(rel["weight"]),
                relationship=rel["relationship_type"]
            ))

        return edges

    except Exception as e:
        print(f"Error analyzing relationships: {str(e)}")
        return []