"""
Disease Prediction Machine Learning Model
Uses pattern matching and weighted scoring algorithm
"""

import numpy as np
import re
from typing import List, Dict, Tuple


class DiseasePredictionModel:
    """
    ML Model for predicting diseases based on symptoms
    Uses weighted scoring and pattern recognition algorithms
    """

    def __init__(self):
        """Initialize the disease prediction model with symptom weights"""
        # Symptom severity weights (medical literature-based)
        self.symptom_weights = {
            'chest pain': 10.0,
            'breathless': 9.0,
            'shortness of breath': 9.0,
            'fainting': 10.0,
            'confusion': 9.0,
            'left arm pain': 8.0,
            'jaw pain': 8.0,
            'sudden sweating': 8.0,
            'abdominal pain': 7.0,
            'vomiting': 6.0,
            'dizziness': 6.0,
            'nausea': 5.0,
            'back pain': 5.0,
            'headache': 4.0,
            'joint pain': 4.0,
            'diarrhea': 4.0,
            'fever': 3.0,
            'fatigue': 3.0,
            'rash': 3.0,
            'cough': 2.0,
            'sore throat': 2.0,
            'sneezing': 1.0,
            'running nose': 1.0
        }

        # Disease pattern database
        self.disease_patterns = {
            'cardiac': ['chest pain', 'breathless', 'left arm pain', 'jaw pain', 'sweating'],
            'respiratory': ['cough', 'breathless', 'chest pain', 'fever'],
            'digestive': ['nausea', 'vomiting', 'abdominal pain', 'diarrhea'],
            'neurological': ['headache', 'dizziness', 'confusion', 'fainting'],
            'musculoskeletal': ['joint pain', 'back pain', 'muscle ache'],
            'infectious': ['fever', 'fatigue', 'cough', 'sore throat']
        }

    def calculate_severity_score(self, symptoms: List[Dict]) -> float:
        """
        Calculate total severity score using weighted algorithm

        Args:
            symptoms: List of symptom dictionaries with name and severity

        Returns:
            float: Total weighted severity score
        """
        total_score = 0.0

        for symptom in symptoms:
            symptom_name = symptom.get('name', '').lower()
            severity = float(symptom.get('severity', 5))

            # Find matching weight
            weight = 0.0
            for key, value in self.symptom_weights.items():
                if key in symptom_name:
                    weight = value
                    break

            # If no match, use generic weight
            if weight == 0.0:
                weight = severity * 0.5
            else:
                # Weighted score: weight * (severity/10)
                weight = weight * (severity / 10.0)

            total_score += weight

        return round(total_score, 2)

    def detect_patterns(self, symptoms: List[Dict]) -> Dict[str, float]:
        """
        Detect disease patterns using pattern matching algorithm

        Args:
            symptoms: List of symptoms

        Returns:
            Dict mapping pattern types to confidence scores
        """
        symptom_text = ' '.join([s.get('name', '').lower() for s in symptoms])
        pattern_scores = {}

        for pattern_type, keywords in self.disease_patterns.items():
            matches = sum(1 for keyword in keywords if keyword in symptom_text)
            confidence = (matches / len(keywords)) * 100
            if confidence > 20:  # Threshold
                pattern_scores[pattern_type] = round(confidence, 1)

        return pattern_scores

    def predict(self, symptoms: List[Dict], profile: Dict) -> List[Dict]:
        """
        Predict diseases using ML algorithm

        Args:
            symptoms: List of patient symptoms
            profile: Patient profile (age, gender)

        Returns:
            List of predicted diseases with probabilities
        """
        # Calculate severity score
        severity_score = self.calculate_severity_score(symptoms)

        # Detect patterns
        patterns = self.detect_patterns(symptoms)

        # Generate predictions based on patterns
        predictions = []

        # Cardiac emergency detection
        if 'cardiac' in patterns and patterns['cardiac'] > 40:
            predictions.append({
                'condition': 'Cardiac Emergency / Heart Attack',
                'probability': min(95, int(patterns['cardiac'] + 20)),
                'description': 'Critical cardiac symptoms detected requiring immediate medical attention',
                'specialty': 'Cardiology'
            })

        # Respiratory conditions
        if 'respiratory' in patterns:
            if severity_score >= 8:
                predictions.append({
                    'condition': 'Severe Respiratory Infection / Pneumonia',
                    'probability': min(85, int(patterns['respiratory'] + 15)),
                    'description': 'Severe respiratory symptoms suggesting pneumonia or serious lung infection',
                    'specialty': 'Pulmonology'
                })
            elif 'infectious' in patterns:
                predictions.append({
                    'condition': 'Influenza (Flu)',
                    'probability': min(75, int(patterns['respiratory'] + 10)),
                    'description': 'Viral infection affecting respiratory system with fever',
                    'specialty': 'General Medicine'
                })
            else:
                predictions.append({
                    'condition': 'Common Cold / Upper Respiratory Infection',
                    'probability': min(70, int(patterns['respiratory'])),
                    'description': 'Mild viral infection of upper respiratory tract',
                    'specialty': 'General Medicine'
                })

        # Digestive conditions
        if 'digestive' in patterns:
            if severity_score >= 7:
                predictions.append({
                    'condition': 'Acute Gastroenteritis',
                    'probability': min(80, int(patterns['digestive'] + 10)),
                    'description': 'Severe stomach inflammation causing digestive symptoms',
                    'specialty': 'Gastroenterology'
                })
            else:
                predictions.append({
                    'condition': 'Gastritis / Indigestion',
                    'probability': min(70, int(patterns['digestive'])),
                    'description': 'Inflammation of stomach lining or digestive discomfort',
                    'specialty': 'General Medicine'
                })

        # Neurological conditions
        if 'neurological' in patterns and severity_score >= 6:
            predictions.append({
                'condition': 'Migraine / Severe Headache',
                'probability': min(75, int(patterns['neurological'] + 5)),
                'description': 'Severe headache possibly with neurological symptoms',
                'specialty': 'Neurology'
            })

        # Musculoskeletal conditions
        if 'musculoskeletal' in patterns:
            predictions.append({
                'condition': 'Musculoskeletal Pain / Arthritis',
                'probability': min(70, int(patterns['musculoskeletal'])),
                'description': 'Pain in muscles, joints, or bones',
                'specialty': 'Orthopedics'
            })

        # If no specific patterns, return general infection
        if not predictions:
            predictions.append({
                'condition': 'General Infection',
                'probability': 60,
                'description': 'Symptoms suggest a general infection or viral illness',
                'specialty': 'General Medicine'
            })

        # Sort by probability
        predictions.sort(key=lambda x: x['probability'], reverse=True)

        return predictions[:3]  # Return top 3 predictions
