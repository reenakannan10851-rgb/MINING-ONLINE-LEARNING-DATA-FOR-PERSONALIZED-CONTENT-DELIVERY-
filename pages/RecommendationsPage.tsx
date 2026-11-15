import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import {
  getRecommendation,
  getAllRecommendations,
  getEarlyWarningAlerts,
  getLearningAnalyticsSummary,
  dataStore
} from '../services/api';
import { Recommendation, EarlyWarningAlert, LearningAnalyticsSummary } from '../types';
import { DownloadIcon } from '../components/icons';
import { exportToCSV } from '../services/csvParser';

const RecommendationsPage: React.FC = () => {
  const [studentId, setStudentId] = useState('28400');
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [earlyWarnings, setEarlyWarnings] = useState<EarlyWarningAlert[]>([]);
  const [missingVleData, setMissingVleData] = useState(false);
  const [summary, setSummary] = useState<LearningAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Initialize analytics summary & early warnings
    setSummary(getLearningAnalyticsSummary());
    getEarlyWarningAlerts().then(result => {
      setEarlyWarnings(result.alerts);
      setMissingVleData(result.missingSupplementaryData);
    });
    // Fetch initial recommendation for default student
    handleFetchRecommendation('28400');
  }, []);

  const handleFetchRecommendation = async (idToFetch?: string) => {
    const targetId = idToFetch || studentId;
    if (!targetId.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getRecommendation(targetId.trim());
      setRecommendation(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch recommendation. Student might not exist.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const allRecs = getAllRecommendations();
    if (allRecs.length === 0) {
      setError('No student recommendations available to export.');
      return;
    }

    const flatRows = allRecs.map(r => ({
      id_student: r.id_student,
      predicted_class: r.predicted_class,
      cluster_label: r.cluster_label,
      engagement_level: r.engagement_level || 'N/A',
      risk_category: r.risk_category || 'N/A',
      content_category: r.content_category || 'N/A',
      recommendation: r.recommendation,
      reason: r.reason || '',
      pathway_step1: r.learning_pathway ? r.learning_pathway[0] : '',
      pathway_step2: r.learning_pathway ? r.learning_pathway[1] : '',
      pathway_step3: r.learning_pathway ? r.learning_pathway[2] : '',
      pathway_step4: r.learning_pathway ? r.learning_pathway[3] : '',
    }));

    exportToCSV(flatRows, 'oulad_personalized_recommendations.csv');
    setDownloadSuccess(`Successfully exported recommendations for all ${flatRows.length.toLocaleString()} students to CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* Extension E: Learning Analytics & Performance Monitoring Dashboard */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-semibold">Total Students</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{summary.totalStudents.toLocaleString()}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Enrolled cohorts</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-semibold">At-Risk Students</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{summary.atRiskCount.toLocaleString()}</p>
            <p className="text-[11px] text-red-500 mt-0.5">Requiring intervention</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-semibold">High Achievers</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{summary.highAchieverCount.toLocaleString()}</p>
            <p className="text-[11px] text-green-600 mt-0.5">Ready for advanced content</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-semibold">Overall Pass Rate</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{summary.passRate}%</p>
            <p className="text-[11px] text-blue-500 mt-0.5">Avg Score: {summary.averageScore}%</p>
          </div>
        </div>
      )}

      {/* 1. Get Recommendation for a Student (Preserved & Enhanced) */}
      <Card title="Personalized Content Recommendation Engine ">
        <p className="text-sm text-gray-600 mb-4">
          Generates individualized instructional recommendations and adaptive learning pathways by cross-referencing predictive model outputs, behavioral clustering cohorts, and actual historical assessment mastery.
        </p>

        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-grow w-full">
            <Input
              label="Student ID (Try: 28400, 11391, 30268, 65002, 70833, 74374)"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter a student ID..."
            />
          </div>
          <Button onClick={() => handleFetchRecommendation()} isLoading={isLoading} className="w-full sm:w-auto">
            Generate Recommendation
          </Button>
        </div>
        
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        {recommendation && (
          <div className="mt-6 p-5 bg-blue-50/70 border border-blue-200 rounded-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-blue-200 pb-3 gap-2">
              <div>
                <h3 className="text-lg font-bold text-blue-900">
                  Recommendation Dossier for Student: <span className="font-mono">{recommendation.id_student}</span>
                </h3>
                <p className="text-xs text-blue-700">
                  Target Resource Category: <strong>{recommendation.content_category}</strong>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${recommendation.predicted_class === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  Predicted: {recommendation.predicted_class}
                </span>
                <span className="bg-purple-100 text-purple-800 px-2.5 py-1 text-xs font-bold rounded-full">
                  Cluster: {recommendation.cluster_label}
                </span>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${recommendation.risk_category?.includes('High') ? 'bg-red-600 text-white' : 'bg-blue-100 text-blue-800'}`}>
                  {recommendation.risk_category}
                </span>
              </div>
            </div>

            {/* Preserved Core Recommendation Content */}
            <div className="bg-white p-4 rounded-md border border-blue-100 shadow-sm">
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-1">Tailored Actionable Advice</h4>
              <p className="text-sm font-medium text-gray-800 leading-relaxed">{recommendation.recommendation}</p>
              {recommendation.reason && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  <strong>Diagnostic Rationale:</strong> {recommendation.reason}
                </p>
              )}
            </div>

            {/* Extension B: Adaptive Learning Pathway */}
            {recommendation.learning_pathway && (
              <div>
                <h4 className="text-xs font-bold uppercase text-blue-900 mb-2">
                  Adaptive Learning Sequence (Staged Progression)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {recommendation.learning_pathway.map((step, idx) => (
                    <div key={idx} className="p-3 bg-white rounded border border-blue-200 shadow-xs flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase text-blue-600 mb-1">Milestone {idx + 1}</span>
                      <p className="text-xs text-gray-700 font-medium">{step.replace(/^Step \d+:\s*/, '')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Extension A: Early Warning System Table */}
      <Card title="Early Warning & Proactive Student Intervention System ">
        <p className="text-sm text-gray-600 mb-4">
          Detects students demonstrating warning indicators (declining engagement, sub-threshold scores, or low virtual learning environment participation) to recommend timely corrective interventions before course withdrawal.
        </p>

        {missingVleData ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <p className="font-semibold mb-1">⚠ Supplementary data not yet uploaded</p>
            <p>
              The Early Warning System requires <strong>studentVle.csv</strong> (click logs) and{' '}
              <strong>studentAssessment.csv</strong> (scores) to identify at-risk students accurately.
              Currently only <em>studentInfo.csv</em> is loaded, so every student appears to have
              0 clicks and 0% score — this is a data gap, not genuine risk.
            </p>
            <p className="mt-2">
              Go to the <strong>Data</strong> tab → upload <code>studentVle.csv</code> and{' '}
              <code>studentAssessment.csv</code> → click <em>Upload &amp; Process Datasets</em>,
              then return here.
            </p>
          </div>
        ) : earlyWarnings.length === 0 ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            <p className="font-semibold">✓ No at-risk students detected in the current dataset.</p>
            <p className="mt-1">All loaded students have sufficient VLE activity and assessment scores above warning thresholds.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto max-h-72 border border-gray-200 rounded-md">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Student ID</th>
                    <th className="px-4 py-2 text-center font-semibold text-gray-600">Risk Level</th>
                    <th className="px-4 py-2 text-center font-semibold text-gray-600">Clicks</th>
                    <th className="px-4 py-2 text-center font-semibold text-gray-600">Avg Score</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Primary Warning Signal</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Proactive Intervention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {earlyWarnings.slice(0, 15).map((alert) => (
                    <tr key={alert.id_student} className="hover:bg-gray-50">
                      <td
                        className="px-4 py-2 font-mono font-semibold text-blue-600 cursor-pointer hover:underline"
                        onClick={() => { setStudentId(String(alert.id_student)); handleFetchRecommendation(String(alert.id_student)); }}
                      >
                        {alert.id_student}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${alert.risk_level === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {alert.risk_level}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center font-mono">{alert.total_clicks.toLocaleString()}</td>
                      <td className="px-4 py-2 text-center font-mono">{alert.avg_score}%</td>
                      <td className="px-4 py-2 text-gray-700">{alert.warning_indicators[0]}</td>
                      <td className="px-4 py-2 text-gray-600 italic">{alert.intervention_suggestions[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              Showing top {Math.min(15, earlyWarnings.length)} of {earlyWarnings.length} at-risk students. Click any Student ID to load their recommendation dossier.
            </p>
          </>
        )}
      </Card>

      {/* 2. Export All Recommendations Card (Preserved from original) */}
      <Card title="Export All Recommendations (Batch Reporting)">
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          Generate and download a comprehensive CSV report containing individual predictions, risk categorizations, recommended content materials, and adaptive learning pathways for all {dataStore.cleanedDataset.length.toLocaleString()} students in the dataset.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button onClick={handleExport} variant="secondary" icon={<DownloadIcon />}>
            Export All as CSV
          </Button>
          {downloadSuccess && (
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded border border-green-200">
              {downloadSuccess}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
};

export default RecommendationsPage;
