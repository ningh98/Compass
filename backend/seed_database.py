"""
Seed the database with static demo data for roadmaps, quiz questions, and knowledge graph.
"""
import os
import json
from datetime import datetime
from app.db import get_db, engine
from app import models

def seed_database():
    db = next(get_db())

    # Clear existing data (optional, for clean seeding)
    db.query(models.QuizProgress).delete()
    db.query(models.QuizQuestion).delete()
    db.query(models.KnowledgeGraphEdge).delete()
    db.query(models.KnowledgeGraphNode).delete()
    db.query(models.RoadmapItem).delete()
    db.query(models.Roadmap).delete()
    db.commit()

    now = datetime.now().isoformat()

    # Roadmap 1: Python Programming
    roadmap1 = models.Roadmap(
        topic="Python Programming",
        experience="Beginner - I know basic programming concepts but new to Python",
        created_at=now
    )
    db.add(roadmap1)
    db.flush()

    items1 = [
        {
            'title': "Variables and Data Types",
            'summary': "Understanding how to store and manipulate data in Python using variables, strings, numbers, lists, and dictionaries.",
            'level': 1,
            'study_material': ["https://docs.python.org/3/tutorial/introduction.html", "https://realpython.com/python-data-types/"],
            'questions': [
                {
                    "question": "Which of these is NOT a Python data type?",
                    "options": ["list", "tuple", "array", "dict"],
                    "correct": 2
                },
                {
                    "question": "How do you create a variable in Python?",
                    "options": ["var x = 5", "x := 5", "x = 5", "int x = 5"],
                    "correct": 2
                },
                {
                    "question": "Which method is used to add an item to a list?",
                    "options": [".add()", ".append()", ".push()", ".insert()"],
                    "correct": 1
                },
                {
                    "question": "What will print(type('hello')) output?",
                    "options": ["<class 'str'>", "<class 'string'>", "'str'", "string"],
                    "correct": 0
                }
            ]
        },
        {
            'title': "Control Structures",
            'summary': "Master conditional statements (if/elif/else) and loops (for/while) to control program flow.",
            'level': 1,
            'study_material': ["https://docs.python.org/3/tutorial/controlflow.html", "https://realpython.com/python-conditional-statements/"],
            'questions': [
                {
                    "question": "What keyword is used for conditional statements?",
                    "options": ["when", "if", "condition", "switch"],
                    "correct": 1
                },
                {
                    "question": "Which loop repeats while a condition is true?",
                    "options": ["for", "while", "repeat", "until"],
                    "correct": 1
                },
                {
                    "question": "How do you write an elif statement?",
                    "options": ["else if", "elsif", "elif", "else-and-if"],
                    "correct": 2
                },
                {
                    "question": "What will break do in a loop?",
                    "options": ["Pause", "Exit the loop", "Skip to next iteration", "Restart the loop"],
                    "correct": 1
                }
            ]
        },
        {
            'title': "Functions",
            'summary': "Learn to define reusable code blocks with parameters and return values.",
            'level': 2,
            'study_material': ["https://docs.python.org/3/tutorial/controlflow.html#defining-functions", "https://realpython.com/defining-your-own-python-function/"],
            'questions': [
                {
                    "question": "Which keyword defines a function?",
                    "options": ["function", "def", "fun", "define"],
                    "correct": 1
                },
                {
                    "question": "What does return do in a function?",
                    "options": ["Print output", "Send value back", "End the program", "Pause execution"],
                    "correct": 1
                },
                {
                    "question": "How are function parameters separated?",
                    "options": [";", ":", ",", ":="],
                    "correct": 2
                },
                {
                    "question": "What's the difference between a parameter and an argument?",
                    "options": ["No difference", "Parameter in definition, argument in call", "Argument in definition, parameter in call", "Only naming convention"],
                    "correct": 1
                }
            ]
        }
    ]

    roadmap1_items = []
    for item_data in items1:
        item = models.RoadmapItem(
            roadmap_id=roadmap1.id,
            title=item_data['title'],
            summary=item_data['summary'],
            level=item_data['level'],
            study_material=json.dumps(item_data['study_material'])
        )
        db.add(item)
        db.flush()
        roadmap1_items.append(item)

        # Add quiz questions
        for q_data in item_data['questions']:
            question = models.QuizQuestion(
                roadmap_item_id=item.id,
                question=q_data['question'],
                options=json.dumps(q_data['options']),
                correct=q_data['correct']
            )
            db.add(question)

    # Roadmap 2: Introduction to Machine Learning
    roadmap2 = models.Roadmap(
        topic="Introduction to Machine Learning",
        experience="Intermediate - I know Python and statistics basics",
        created_at=now
    )
    db.add(roadmap2)
    db.flush()

    items2 = [
        {
            'title': "Linear Regression",
            'summary': "Understanding the foundational algorithm for predicting continuous values using a straight line model.",
            'level': 1,
            'study_material': ["https://scikit-learn.org/stable/modules/linear_model.html", "https://towardsdatascience.com/linear-regression-explained-1b36f97b6bfd"],
            'questions': [
                {
                    "question": "What does linear regression predict?",
                    "options": ["Categories", "Continuous values", "Images", "Sequences"],
                    "correct": 1
                },
                {
                    "question": "What is the cost function in linear regression?",
                    "options": ["Accuracy", "Mean Squared Error", "Precision", "Recall"],
                    "correct": 1
                },
                {
                    "question": "What is gradient descent used for?",
                    "options": ["Feature selection", "Parameter optimization", "Data preprocessing", "Model evaluation"],
                    "correct": 1
                },
                {
                    "question": "What is R-squared?",
                    "options": ["Error metric", "Accuracy metric", "Both", "Neither"],
                    "correct": 2
                }
            ]
        },
        {
            'title': "Classification Basics",
            'summary': "Learn binary and multi-class classification using algorithms like logistic regression and decision trees.",
            'level': 1,
            'study_material': ["https://scikit-learn.org/stable/supervised_learning.html", "https://towardsdatascience.com/classification-algorithms-explained-2bafb3239ce6"],
            'questions': [
                {
                    "question": "What is classification?",
                    "options": ["Predicting numbers", "Predicting categories", "Data clustering", "Dimensionality reduction"],
                    "correct": 1
                },
                {
                    "question": "What does logistic regression output?",
                    "options": ["Continuous value", "Probability", "Category directly", "Distance"],
                    "correct": 1
                },
                {
                    "question": "What is overfitting?",
                    "options": ["Underfitting", "Poor generalization", "Good performance on test data", "Simple model"],
                    "correct": 1
                },
                {
                    "question": "What is a confusion matrix used for?",
                    "options": ["Feature scaling", "Model evaluation", "Data visualization", "Hyperparameter tuning"],
                    "correct": 1
                }
            ]
        },
        {
            'title': "Neural Networks",
            'summary': "Introduction to artificial neural networks, deep learning concepts, and backpropagation.",
            'level': 2,
            'study_material': ["https://pytorch.org/tutorials/", "https://towardsdatascience.com/neural-networks-explained-7b4f5fd3d67a"],
            'questions': [
                {
                    "question": "What is a neuron in ML?",
                    "options": ["Brain cell", "Computational unit", "Data point", "Algorithm"],
                    "correct": 1
                },
                {
                    "question": "What is backpropagation?",
                    "options": ["Forward pass", "Backward pass for learning", "Data preprocessing", "Prediction step"],
                    "correct": 1
                },
                {
                    "question": "What is an activation function?",
                    "options": ["Loss function", "Non-linear transformation", "Optimizer", "Regularizer"],
                    "correct": 1
                },
                {
                    "question": "What makes deep learning 'deep'?",
                    "options": ["Large datasets", "Many layers", "Complex math", "Fast computers"],
                    "correct": 1
                }
            ]
        }
    ]

    roadmap2_items = []
    for item_data in items2:
        item = models.RoadmapItem(
            roadmap_id=roadmap2.id,
            title=item_data['title'],
            summary=item_data['summary'],
            level=item_data['level'],
            study_material=json.dumps(item_data['study_material'])
        )
        db.add(item)
        db.flush()
        roadmap2_items.append(item)

        # Add quiz questions
        for q_data in item_data['questions']:
            question = models.QuizQuestion(
                roadmap_item_id=item.id,
                question=q_data['question'],
                options=json.dumps(q_data['options']),
                correct=q_data['correct']
            )
            db.add(question)

    # Knowledge Graph Nodes
    # Group for coloring
    group1 = 0
    group2 = 1

    # Roadmap 1 nodes
    topic1_node = models.KnowledgeGraphNode(
        id=f"topic_{roadmap1.id}",
        label=roadmap1.topic,
        node_type="topic",
        roadmap_id=roadmap1.id,
        group=group1,
        created_at=datetime.utcnow()
    )
    db.add(topic1_node)

    for item in roadmap1_items:
        title_node = models.KnowledgeGraphNode(
            id=f"title_{item.id}",
            label=item.title,
            node_type="title",
            roadmap_id=roadmap1.id,
            group=group1,
            created_at=datetime.utcnow()
        )
        db.add(title_node)

        # Intra-roadmap edge
        edge = models.KnowledgeGraphEdge(
            source=f"topic_{roadmap1.id}",
            target=f"title_{item.id}",
            weight=3.0,
            relationship="contains",
            created_at=datetime.utcnow()
        )
        db.add(edge)

    # Roadmap 2 nodes
    topic2_node = models.KnowledgeGraphNode(
        id=f"topic_{roadmap2.id}",
        label=roadmap2.topic,
        node_type="topic",
        roadmap_id=roadmap2.id,
        group=group2,
        created_at=datetime.utcnow()
    )
    db.add(topic2_node)

    for item in roadmap2_items:
        title_node = models.KnowledgeGraphNode(
            id=f"title_{item.id}",
            label=item.title,
            node_type="title",
            roadmap_id=roadmap2.id,
            group=group2,
            created_at=datetime.utcnow()
        )
        db.add(title_node)

        # Intra-roadmap edge
        edge = models.KnowledgeGraphEdge(
            source=f"topic_{roadmap2.id}",
            target=f"title_{item.id}",
            weight=3.0,
            relationship="contains",
            created_at=datetime.utcnow()
        )
        db.add(edge)

    # Cross-roadmap relationships
    cross_relationships = [
        # Functions (Python) prerequisite for Neural Networks (ML)
        (f"title_{roadmap1_items[2].id}", f"title_{roadmap2_items[2].id}", "prerequisite", 2.5),
        # Control Structures prerequisite for Classification
        (f"title_{roadmap1_items[1].id}", f"title_{roadmap2_items[1].id}", "prerequisite", 2.0),
        # Linear Regression complementary to Functions
        (f"title_{roadmap2_items[0].id}", f"title_{roadmap1_items[2].id}", "complementary", 2.2),
    ]

    for source, target, rel, weight in cross_relationships:
        edge = models.KnowledgeGraphEdge(
            source=source,
            target=target,
            weight=weight,
            relationship=rel,
            created_at=datetime.utcnow()
        )
        db.add(edge)

    db.commit()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()
