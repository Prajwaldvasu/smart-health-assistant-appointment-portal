"""
Health Analyzer - Statistical analysis and health insights
Uses NumPy for data analysis
"""

import numpy as np
from typing import List, Dict
from datetime import datetime, timedelta


class HealthAnalyzer:
    """
    Analyzes health data and provides insights
    Uses statistical methods and data analysis
    """

    def calculate_severity(self, symptoms: List[Dict]) -> float:
        """
        Calculate severity score using numpy for numerical computation

        Args:
            symptoms: List of symptoms with severity ratings

        Returns:
            float: Calculated severity score
        """
        if not symptoms:
            return 0.0

        # Extract severity values
        severities = [float(s.get('severity', 5)) for s in symptoms]

        # Use numpy for statistical calculation
        severity_array = np.array(severities)

        # Weighted average (higher severities get more weight)
        weights = severity_array / 10.0
        weighted_score = np.average(severity_array, weights=weights)

        return round(float(weighted_score), 2)

    def get_triage_level(self, severity_score: float) -> Dict:
        """
        Determine triage level based on severity score

        Args:
            severity_score: Calculated severity score

        Returns:
            Dict with triage level and description
        """
        if severity_score >= 8.0:
            return {
                'level': 'Severe',
                'description': 'Severe symptoms detected. Immediate medical attention recommended.',
                'urgency': 'high'
            }
        elif severity_score >= 4.0:
            return {
                'level': 'Moderate',
                'description': 'Moderate symptoms detected. Medical consultation recommended.',
                'urgency': 'medium'
            }
        else:
            return {
                'level': 'Minor',
                'description': 'Mild symptoms detected. Self-care and monitoring recommended.',
                'urgency': 'low'
            }

    def generate_advice(self, predictions: List[Dict], severity_score: float) -> List[str]:
        """
        Generate personalized health advice based on predictions

        Args:
            predictions: List of disease predictions
            severity_score: Severity score

        Returns:
            List of advice strings
        """
        advice = []

        if severity_score >= 8.0:
            advice.extend([
                "🚨 URGENT: Seek immediate medical attention or call emergency services (108)",
                "🛑 Stop all physical activities immediately and rest",
                "💧 Stay hydrated with small sips of water",
                "📞 Have someone stay with you and keep emergency contacts ready"
            ])
        elif severity_score >= 4.0:
            advice.extend([
                "🛏️ REST: Get 7-8 hours of sleep to help recovery",
                "💧 HYDRATION: Drink 8-10 glasses of water daily",
                "🍲 NUTRITION: Eat nutritious meals and avoid junk food",
                "👨‍⚕️ Consult a doctor if symptoms persist beyond 2-3 days"
            ])
        else:
            advice.extend([
                "😊 REST: Get adequate rest and sleep",
                "💧 Stay well hydrated throughout the day",
                "🍎 Maintain a healthy diet",
                "📊 Monitor your symptoms for any changes"
            ])

        return advice

    def analyze_trends(self, logs: List[Dict]) -> Dict:
        """
        Analyze health log trends using statistical methods

        Args:
            logs: List of health log entries

        Returns:
            Dict containing health insights and trends
        """
        if not logs or len(logs) == 0:
            return {
                'message': 'No data available for analysis',
                'trends': {}
            }

        # Extract data arrays
        water_intake = np.array([log.get('waterIntake', 0) for log in logs])
        sleep_hours = np.array([log.get('sleepHours', 0) for log in logs])

        # Calculate statistics
        insights = {
            'waterIntake': {
                'average': round(float(np.mean(water_intake)), 1),
                'min': int(np.min(water_intake)),
                'max': int(np.max(water_intake)),
                'trend': 'increasing' if water_intake[-1] > np.mean(water_intake) else 'decreasing'
            },
            'sleep': {
                'average': round(float(np.mean(sleep_hours)), 1),
                'min': round(float(np.min(sleep_hours)), 1),
                'max': round(float(np.max(sleep_hours)), 1),
                'trend': 'increasing' if sleep_hours[-1] > np.mean(sleep_hours) else 'decreasing'
            },
            'recommendations': []
        }

        # Generate recommendations based on analysis
        if insights['waterIntake']['average'] < 8:
            insights['recommendations'].append(
                "💧 Increase water intake to 8+ glasses per day")

        if insights['sleep']['average'] < 7:
            insights['recommendations'].append(
                "😴 Aim for 7-8 hours of sleep nightly")

        if len(logs) >= 7:
            # Calculate variance for consistency
            water_variance = np.var(water_intake)
            if water_variance > 4:
                insights['recommendations'].append(
                    "📊 Try to maintain consistent water intake daily")

        return insights
