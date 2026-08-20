import React from 'react';
// @ts-ignore
import { jsPDF } from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import { AnalysisResult, UserProfile, Symptom } from '../../shared/types';
import { HeartIcon, StethoscopeIcon } from '../../shared/Icons';

interface PatientSummaryPDFProps {
  userProfile: UserProfile | null;
  symptoms: Symptom[];
  analysisResult: AnalysisResult | null;
  onClose: () => void;
}

const PatientSummaryPDF: React.FC<PatientSummaryPDFProps> = ({ 
  userProfile, 
  symptoms, 
  analysisResult,
  onClose
}) => {
  const generatePDF = () => {
    if (!userProfile || !analysisResult) return;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(22);
    doc.setTextColor(0, 102, 102);
    doc.text('Smart Health Assistant', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Patient Health Summary', 105, 30, { align: 'center' });
    
    // Add patient information
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Patient: ${userProfile.name}`, 20, 45);
    doc.text(`Age: ${userProfile.age}`, 20, 52);
    doc.text(`Gender: ${userProfile.gender}`, 20, 59);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 66);
    
    // Add symptoms section
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 102);
    doc.text('Reported Symptoms:', 20, 78);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    const symptomData = symptoms.map((symptom, index) => [
      index + 1,
      symptom.name,
      symptom.bodyPart,
      symptom.severity,
      symptom.duration
    ]);
    
    autoTable(doc, {
      startY: 82,
      head: [['#', 'Symptom', 'Body Part', 'Severity (1-10)', 'Duration']],
      body: symptomData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 102, 102] },
      margin: { left: 20, right: 20 }
    });
    
    // Add triage information
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 102);
    doc.text('Triage Assessment:', 20, finalY);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Level: ${analysisResult.triageLevel}`, 20, finalY + 7);
    doc.text(`Description: ${analysisResult.triageDescription}`, 20, finalY + 14, { maxWidth: 170 });
    
    // Add predictions
    const predictionStartY = finalY + 25;
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 102);
    doc.text('Predicted Conditions:', 20, predictionStartY);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    analysisResult.predictions.forEach((prediction, index) => {
      const yPos = predictionStartY + 10 + (index * 25);
      doc.text(`${index + 1}. ${prediction.condition}`, 25, yPos);
      doc.text(`Probability: ${prediction.probability}%`, 30, yPos + 7);
      doc.text(`Specialty: ${prediction.specialty}`, 30, yPos + 14);
      doc.text(`Description: ${prediction.description}`, 30, yPos + 21, { maxWidth: 150 });
    });
    
    // Add self-care advice
    let adviceStartY = predictionStartY + 10 + (analysisResult.predictions.length * 25) + 10;
    if (adviceStartY > 250) {
      doc.addPage();
      adviceStartY = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 102);
    doc.text('Self-Care Recommendations:', 20, adviceStartY);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    analysisResult.selfCareAdvice.forEach((advice, index) => {
      const yPos = adviceStartY + 10 + (index * 7);
      if (yPos > 270) {
        doc.addPage();
        doc.text(`${index + 1}. ${advice}`, 25, 20, { maxWidth: 160 });
      } else {
        doc.text(`${index + 1}. ${advice}`, 25, yPos, { maxWidth: 160 });
      }
    });
    
    // Add disclaimer
    let disclaimerY = adviceStartY + 10 + (analysisResult.selfCareAdvice.length * 7) + 15;
    if (disclaimerY > 250) {
      doc.addPage();
      disclaimerY = 20;
    }
    
    doc.setFontSize(10);
    doc.setTextColor(255, 0, 0);
    doc.text('⚠️ Medical Disclaimer: This report is for informational purposes only and is NOT a substitute', 20, disclaimerY, { maxWidth: 170 });
    doc.text('for professional medical advice, diagnosis, or treatment. Always seek the advice of your', 20, disclaimerY + 5, { maxWidth: 170 });
    doc.text('physician or other qualified health provider with any questions you may have.', 20, disclaimerY + 10, { maxWidth: 170 });
    
    // Save the PDF
    doc.save(`health-summary-${userProfile.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-100 flex items-center">
              <HeartIcon className="w-6 h-6 text-brand-teal-500 mr-2" />
              Patient Summary
            </h3>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-slate-300 mb-6">
            Generate a PDF summary of your health assessment to save or share with your healthcare provider.
          </p>
          
          <div className="space-y-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-200 mb-2">Included Information</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li className="flex items-start">
                  <span className="text-brand-teal-400 mr-2">•</span>
                  <span>Patient profile information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-brand-teal-400 mr-2">•</span>
                  <span>Reported symptoms with severity</span>
                </li>
                <li className="flex items-start">
                  <span className="text-brand-teal-400 mr-2">•</span>
                  <span>AI triage assessment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-brand-teal-400 mr-2">•</span>
                  <span>Predicted conditions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-brand-teal-400 mr-2">•</span>
                  <span>Self-care recommendations</span>
                </li>
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={generatePDF}
                disabled={!userProfile || !analysisResult}
                className="flex-1 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate PDF
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSummaryPDF;