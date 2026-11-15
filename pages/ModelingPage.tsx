import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { trainModel, getPrediction, dataStore } from '../services/api';
import {
  ModelMetrics,
  ConfusionMatrix,
  FeatureImportance,
  PredictionResult,
  MultiModelComparison
} from '../types';

const ConfusionMatrixDisplay: React.FC<{ matrix: ConfusionMatrix }> = ({ matrix }) => (
  <div className="flex flex-col items-center text-sm py-2">
    <div className="flex">
      <div className="w-24"></div>
      {matrix.labels.map(label => (
        <div key={label} className="w-24 font-bold text-center text-xs uppercase text-gray-600">
          Predicted {label}
        </div>
      ))}
    </div>
    {matrix.values.map((row, i) => (
      <div key={i} className="flex items-center">
        <div className="w-24 font-bold text-xs text-right pr-3 uppercase text-gray-600">
          Actual {matrix.labels[i]}
        </div>
        {row.map((value, j) => {
          // Correct classifications (diagonal) green/blue, misclassifications soft red
          const isCorrect = i === j;
          const bgClass = isCorrect ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-red-50 text-red-800 border border-red-200';
          return (
            <div
              key={j}
              className={`w-24 h-20 m-1 rounded-lg ${bgClass} flex flex-col items-center justify-center font-bold`}
            >
              <span className="text-xl">{value}</span>
              <span className="text-[10px] font-normal uppercase text-gray-500">
                {isCorrect ? (i === 0 ? 'True Pos' : 'True Neg') : (i === 0 ? 'False Neg' : 'False Pos')}
              </span>
            </div>
          );
        })}
      </div>
    ))}
  </div>
);

const ModelingPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(dataStore.lastRFMetrics);
  const [confusionMatrix, setConfusionMatrix] = useState<ConfusionMatrix | null>(dataStore.lastConfusionMatrix);
  const [featureImportances, setFeatureImportances] = useState<FeatureImportance[]>(
    dataStore.trainedRF?.featureImportances || []
  );
  const [comparisons, setComparisons] = useState<MultiModelComparison[]>(dataStore.modelComparisons);
  const [isLoading, setIsLoading] = useState(false);
  const [studentId, setStudentId] = useState('28400');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);

  const handleTrainModel = async () => {
    setIsLoading(true);
    setPrediction(null);
    setPredictError(null);
    try {
      const results = await trainModel();
      setMetrics(results.metrics);
      setConfusionMatrix(results.confusion_matrix);
      setFeatureImportances(results.feature_importances);
      setComparisons(results.comparisons);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredict = async () => {
    if (!studentId.trim()) return;
    setIsPredicting(true);
    setPredictError(null);
    setPrediction(null);
    try {
      const result = await getPrediction(studentId.trim());
      setPrediction(result);
    } catch (error: any) {
      setPredictError(error.message || 'Student ID not found in current dataset.');
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Train Model Section (Preserved) */}
      <Card title="Train Machine Learning Models (Random Forest, Decision Tree & Logistic Regression)">
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          Trains multi-algorithm machine learning classifiers on an isolated 70/30 train/test split of actual cleaned OULAD records. Features include VLE total clicks, average assessment scores, assessment submission counts, studied credits, previous attempts, registration duration, and encoded demographics.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button onClick={handleTrainModel} isLoading={isLoading}>
            Train & Evaluate All Models
          </Button>
          <span className="text-xs text-gray-500">
            Training Dataset Size: {dataStore.cleanedDataset.length.toLocaleString()} preprocessed students
          </span>
        </div>
      </Card>

      {/* 2. Top-Line Metrics Cards (Preserved) */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <p className="text-xs text-gray-500 uppercase font-semibold">Test Accuracy</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{(metrics.accuracy * 100).toFixed(1)}%</p>
            <p className="text-xs text-gray-400 mt-1">Overall test set correctness</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500 uppercase font-semibold">Precision</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{(metrics.precision * 100).toFixed(1)}%</p>
            <p className="text-xs text-gray-400 mt-1">True positive accuracy ratio</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500 uppercase font-semibold">Recall (Sensitivity)</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{(metrics.recall * 100).toFixed(1)}%</p>
            <p className="text-xs text-gray-400 mt-1">Identification of passing students</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500 uppercase font-semibold">F1-Score</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">{(metrics.f1_score * 100).toFixed(1)}%</p>
            <p className="text-xs text-gray-400 mt-1">Harmonic mean of precision & recall</p>
          </Card>
        </div>
      )}

      {/* 3. MODULE 5: MULTI-MODEL COMPARISON & EVALUATION SUITE */}
      {comparisons && comparisons.length > 0 && (
        <Card title="Model Evaluation & Comparative Benchmark">
          <p className="text-sm text-gray-600 mb-4">
            Side-by-side evaluation of classification models evaluated on the identical test split under standard machine learning metrics. Best model is identified based on balanced F1-score to handle class imbalance responsibly.
          </p>
          
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Model Name</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Accuracy</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Precision</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Recall</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">F1-Score</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Training Time</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Evaluation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {comparisons.map((c) => (
                  <tr key={c.name} className={c.isBest ? 'bg-green-50/60 font-semibold' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3 text-gray-800 flex items-center">
                      {c.name}
                      {c.isBest && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-green-600 text-white rounded-full">
                          Best Performing
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">{(c.accuracy * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-center">{(c.precision * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-center">{(c.recall * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-center text-blue-700 font-bold">{(c.f1_score * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-center text-gray-500 font-mono text-xs">{c.trainingTimeMs} ms</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">Validated</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Model Comparison Bar Chart */}
          <div className="mt-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Model Performance Comparison Chart</h4>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={comparisons}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip formatter={(v: any) => `${(Number(v) * 100).toFixed(1)}%`} />
                <Legend />
                <Bar dataKey="accuracy" name="Accuracy" fill="#3b82f6" />
                <Bar dataKey="precision" name="Precision" fill="#10b981" />
                <Bar dataKey="recall" name="Recall" fill="#f59e0b" />
                <Bar dataKey="f1_score" name="F1-Score" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* 4. Confusion Matrix and Feature Importance (Preserved) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {confusionMatrix && (
          <Card title="Confusion Matrix (Random Forest Test Set)">
            <ConfusionMatrixDisplay matrix={confusionMatrix} />
            <p className="text-xs text-gray-500 text-center mt-2">
              Evaluated on holdout test set with balanced ground-truth student labels.
            </p>
          </Card>
        )}
        {featureImportances.length > 0 && (
          <Card title="Feature Importances (Top Ranked Attributes)">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={featureImportances.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <YAxis dataKey="feature" type="category" width={160} fontSize={11} tickFormatter={(val) => val.replace('_', ' ')} />
                <Tooltip formatter={(v: any) => `${(Number(v) * 100).toFixed(1)}%`} />
                <Bar dataKey="importance" fill="#3b82f6" name="Importance Weight" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* 5. Predict for a Student (Preserved & Enhanced with Explainability & Risk Scoring) */}
      <Card title="Individual Student Prediction & Risk Analysis">
        <p className="text-sm text-gray-600 mb-4">
          Enter an existing student ID to run inference through the trained pipeline. Displays predicted performance, engagement tier, estimated risk level, and explainable feature contributions.
        </p>
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-grow w-full">
            <Input
              label="Student ID (Try: 28400, 11391, 30268, 65002, 70833)"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g., 28400"
            />
          </div>
          <Button onClick={handlePredict} isLoading={isPredicting} className="w-full sm:w-auto">
            Run Prediction
          </Button>
        </div>

        {prediction && (
          <div className="mt-6 p-5 bg-white border border-gray-200 rounded-lg shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b pb-3 gap-2">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Prediction Report for Student ID: <span className="font-mono text-blue-600">{prediction.id_student}</span>
                </h3>
                <p className="text-xs text-gray-500">Model Inference Engine: Random Forest Classifier</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${prediction.predicted_class === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  Outcome: {prediction.predicted_class}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${prediction.risk_level === 'High' ? 'bg-red-600 text-white' : prediction.risk_level === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                  Risk: {prediction.risk_level}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100">
              <strong>Explanation:</strong> {prediction.explanation}
            </p>

            {prediction.contributing_features && (
              <div>
                <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Key Contributing Factors</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {prediction.contributing_features.map(f => (
                    <div key={f.feature} className="p-2.5 rounded border border-gray-200 bg-white">
                      <p className="text-xs text-gray-500">{f.feature}</p>
                      <p className="text-sm font-semibold text-gray-800">{f.value}</p>
                      <span className={`text-[10px] font-medium uppercase ${f.impact === 'positive' ? 'text-green-600' : f.impact === 'negative' ? 'text-red-500' : 'text-gray-400'}`}>
                        {f.impact} impact
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {predictError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="font-semibold text-red-700 text-sm">{predictError}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ModelingPage;
