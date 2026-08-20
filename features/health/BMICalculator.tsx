import React, { useState } from 'react';

interface BMICalculatorProps {
  onClose: () => void;
}

const BMICalculator: React.FC<BMICalculatorProps> = ({ onClose }) => {
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('');

  const calculateBMI = () => {
    const heightInMeters = height / 100;
    const calculatedBMI = weight / (heightInMeters * heightInMeters);
    setBmi(calculatedBMI);

    // Categorize BMI
    if (calculatedBMI < 18.5) {
      setCategory('Underweight');
    } else if (calculatedBMI >= 18.5 && calculatedBMI < 25) {
      setCategory('Normal weight');
    } else if (calculatedBMI >= 25 && calculatedBMI < 30) {
      setCategory('Overweight');
    } else {
      setCategory('Obese');
    }
  };

  const getCategoryColor = () => {
    if (category === 'Underweight') return 'text-blue-400 bg-blue-900/30';
    if (category === 'Normal weight') return 'text-green-400 bg-green-900/30';
    if (category === 'Overweight') return 'text-yellow-400 bg-yellow-900/30';
    if (category === 'Obese') return 'text-red-400 bg-red-900/30';
    return 'text-slate-400 bg-slate-700/30';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-100">BMI Calculator</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Weight Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Weight (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent"
              min="1"
              max="300"
            />
            <input
              type="range"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              min="30"
              max="200"
              className="w-full mt-2 accent-brand-teal-500"
            />
          </div>

          {/* Height Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Height (cm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent"
              min="1"
              max="300"
            />
            <input
              type="range"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              min="100"
              max="250"
              className="w-full mt-2 accent-brand-teal-500"
            />
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateBMI}
            className="w-full px-6 py-3 bg-gradient-to-r from-brand-teal-500 to-brand-green-500 hover:from-brand-teal-600 hover:to-brand-green-600 text-white font-semibold rounded-lg shadow-lg transition-all"
          >
            Calculate BMI
          </button>

          {/* BMI Result */}
          {bmi !== null && (
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 text-center">
              <p className="text-sm text-slate-400 mb-2">Your BMI</p>
              <p className="text-4xl font-bold text-brand-teal-400 mb-3">
                {bmi.toFixed(1)}
              </p>
              <div className={`inline-block px-4 py-2 rounded-full ${getCategoryColor()}`}>
                <p className="font-semibold">{category}</p>
              </div>

              <div className="mt-6 text-left space-y-2 text-sm text-slate-300">
                <p className="font-semibold text-slate-200 mb-3">BMI Categories:</p>
                <p>• <span className="text-blue-400">Underweight:</span> Below 18.5</p>
                <p>• <span className="text-green-400">Normal weight:</span> 18.5 - 24.9</p>
                <p>• <span className="text-yellow-400">Overweight:</span> 25 - 29.9</p>
                <p>• <span className="text-red-400">Obese:</span> 30 and above</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BMICalculator;
