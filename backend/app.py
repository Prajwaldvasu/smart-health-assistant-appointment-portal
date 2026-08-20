"""
Smart Health Assistant - Python Backend API
Flask REST API for disease prediction and health analysis
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime
import json

# Import our ML modules
from disease_predictor import DiseasePredictionModel
from health_analyzer import HealthAnalyzer

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize ML models
disease_model = DiseasePredictionModel()
health_analyzer = HealthAnalyzer()


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Smart Health Assistant API',
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/analyze-symptoms', methods=['POST'])
def analyze_symptoms():
    """
    Analyze patient symptoms and predict diseases

    Request Body:
    {
        "symptoms": [
            {"name": "fever", "severity": 8, "duration": "2 days"},
            {"name": "cough", "severity": 6, "duration": "3 days"}
        ],
        "profile": {
            "age": 25,
            "gender": "Male"
        }
    }
    """
    try:
        data = request.json
        symptoms = data.get('symptoms', [])
        profile = data.get('profile', {})

        # Use ML model to predict diseases
        predictions = disease_model.predict(symptoms, profile)

        # Calculate severity score
        severity_score = health_analyzer.calculate_severity(symptoms)

        # Determine triage level
        triage = health_analyzer.get_triage_level(severity_score)

        # Generate self-care advice
        advice = health_analyzer.generate_advice(predictions, severity_score)

        return jsonify({
            'success': True,
            'predictions': predictions,
            'triageLevel': triage['level'],
            'triageDescription': triage['description'],
            'selfCareAdvice': advice,
            'severityScore': severity_score
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/health-insights', methods=['POST'])
def health_insights():
    """
    Analyze health logs and provide insights

    Request Body:
    {
        "logs": [
            {"date": "2024-01-01", "waterIntake": 8, "sleepHours": 7},
            ...
        ]
    }
    """
    try:
        data = request.json
        logs = data.get('logs', [])

        # Analyze health trends using numpy
        insights = health_analyzer.analyze_trends(logs)

        return jsonify({
            'success': True,
            'insights': insights
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    print("🚀 Starting Smart Health Assistant Python Backend...")
    print("📊 ML Models initialized")
    print("🌐 Server running on http://localhost:5000")
    app.run(debug=True, port=5000, host='0.0.0.0')
