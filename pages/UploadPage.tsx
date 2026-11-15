import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SummaryStats, PreprocessingReport, DatasetFileInfo } from '../types';
import {
  uploadFiles,
  fetchOulad,
  processUploadedFile,
  runDataPreprocessing,
  getDatasetFileInfo,
  dataStore
} from '../services/api';
import { UploadIcon, DownloadIcon } from '../components/icons';
import { exportToCSV } from '../services/csvParser';

const OULAD_FILE_DEFINITIONS: { key: string; name: string; required: boolean; description: string }[] = [
  { key: 'studentInfo', name: 'studentInfo.csv', required: true, description: 'Student demographic and final enrollment outcome data.' },
  { key: 'studentVle', name: 'studentVle.csv', required: false, description: 'Student interaction logs and click counts in the Virtual Learning Environment.' },
  { key: 'studentAssessment', name: 'studentAssessment.csv', required: false, description: 'Assessment scores, submission dates, and banked marks.' },
  { key: 'courses', name: 'courses.csv', required: false, description: 'Course modules and presentation lengths in days.' },
  { key: 'assessments', name: 'assessments.csv', required: false, description: 'Assessment metadata (TMA, CMA, Exam, weights, cutoff dates).' },
  { key: 'studentRegistration', name: 'studentRegistration.csv', required: false, description: 'Registration and unregistration relative timeline days.' },
  { key: 'vle', name: 'vle.csv', required: false, description: 'VLE resource metadata (activity type, week of introduction).' },
];

const FileInput: React.FC<{
  label: string;
  onFileSelect: (file: File | null) => void;
  requiredFileName: string;
  isRequired: boolean;
  statusInfo?: DatasetFileInfo;
}> = ({ label, onFileSelect, requiredFileName, isRequired, statusInfo }) => {
  const [fileName, setFileName] = useState<string | null>(statusInfo?.fileName || null);
  const [isValid, setIsValid] = useState<boolean | null>(statusInfo?.uploaded ? true : null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setFileName(file.name);
      const fileIsValid = file.name.toLowerCase() === requiredFileName.toLowerCase();
      setIsValid(fileIsValid);
      if (fileIsValid) {
        setIsParsing(true);
        // Allow React to render the "Parsing…" state before heavy work
        await new Promise<void>(r => setTimeout(r, 20));
        onFileSelect(file);
        setIsParsing(false);
      } else {
        onFileSelect(null);
      }
    } else {
      setFileName(null);
      setIsValid(null);
      onFileSelect(null);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-gray-700">
          {label} {isRequired && <span className="text-red-500 font-bold">*</span>}
        </label>
        {isParsing && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium animate-pulse">
            Parsing…
          </span>
        )}
        {!isParsing && statusInfo?.uploaded && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
            Loaded ({statusInfo.recordCount?.toLocaleString()} rows)
          </span>
        )}
      </div>
      <div className={`mt-1 flex justify-center px-4 pt-3 pb-3 border-2 ${isValid === false ? 'border-red-400 bg-red-50' : isValid ? 'border-green-300 bg-green-50/30' : 'border-gray-300'} border-dashed rounded-md transition-colors`}>
        <div className="space-y-1 text-center">
          <div className="flex text-sm text-gray-600 justify-center">
            <label htmlFor={requiredFileName} className="relative cursor-pointer bg-white px-2 py-1 border border-gray-200 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500">
              <span>{isParsing ? 'Reading file…' : 'Select File'}</span>
              <input id={requiredFileName} name={requiredFileName} type="file" className="sr-only" onChange={handleFileChange} accept=".csv" disabled={isParsing} />
            </label>
            {!isParsing && <p className="pl-2 self-center text-xs">or drag and drop</p>}
          </div>
          <p className="text-xs text-gray-500">Must be named: <span className="font-semibold">{requiredFileName}</span></p>
          {fileName && (
            <p className={`text-xs ${isValid ? 'text-green-600 font-medium' : 'text-red-600 font-semibold'}`}>
              {fileName} {isValid === false && '(Invalid filename!)'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const UploadPage: React.FC = () => {
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    studentInfo: null,
    studentVle: null,
    studentAssessment: null,
    courses: null,
    assessments: null,
    studentRegistration: null,
    vle: null,
  });

  const [fileStatuses, setFileStatuses] = useState<Record<string, DatasetFileInfo>>({});
  const [data, setData] = useState<any[] | null>(dataStore.cleanedDataset.slice(0, 100));
  const [summary, setSummary] = useState<SummaryStats | null>(dataStore.summaryStats);
  const [report, setReport] = useState<PreprocessingReport | null>(dataStore.preprocessingReport);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreprocessing, setIsPreprocessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setFileStatuses(getDatasetFileInfo());
    if (dataStore.summaryStats) {
      setSummary(dataStore.summaryStats);
    }
    if (dataStore.preprocessingReport) {
      setReport(dataStore.preprocessingReport);
    }
  }, []);

  const handleFileSelect = async (name: string, file: File | null) => {
    setFiles(prev => ({ ...prev, [name]: file }));
    if (file) {
      setIsLoading(true);
      setError(null);
      setSuccessMsg(null);
      const res = await processUploadedFile(name, file);
      setIsLoading(false);
      if (res.success) {
        setFileStatuses(getDatasetFileInfo());
        setSuccessMsg(`"${file.name}" loaded — ${res.info.recordCount?.toLocaleString()} records, ${res.info.columnCount} columns.`);
      } else {
        setError(res.error || `Failed to process ${file.name}`);
      }
    }
  };

  const hasStudentInfo = !!files.studentInfo || !!fileStatuses['studentInfo.csv']?.uploaded;

  const handleSubmit = async (source: 'upload' | 'fetch') => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const result = source === 'upload'
        ? await uploadFiles(files as { [key: string]: File })
        : await fetchOulad();
      setData(result.sample);
      setSummary(result.summary);
      if (result.report) setReport(result.report);
      setFileStatuses(getDatasetFileInfo());
      setSuccessMsg(source === 'upload' ? 'Datasets successfully uploaded, merged, and preprocessed!' : 'OULAD dataset successfully loaded and preprocessed from repository baseline.');
    } catch (err: any) {
      setError(err?.message || 'Failed to process data. Please verify file formats.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunPreprocessingOnly = async () => {
    setIsPreprocessing(true);
    setError(null);
    try {
      const result = await runDataPreprocessing();
      setData(result.sample);
      setSummary(result.summary);
      setReport(result.report);
      setSuccessMsg('Preprocessing pipeline re-executed successfully on raw data.');
    } catch (err: any) {
      setError(err.message || 'Preprocessing error.');
    } finally {
      setIsPreprocessing(false);
    }
  };

  const handleDownloadCleaned = () => {
    if (dataStore.cleanedDataset && dataStore.cleanedDataset.length > 0) {
      exportToCSV(dataStore.cleanedDataset, 'oulad_cleaned_preprocessed.csv');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Dataset Collection Card */}
      <Card title="Load Dataset">
        <p className="text-sm text-gray-600 mb-4">
          Upload official Open University Learning Analytics Dataset (OULAD) CSV files. <span className="font-semibold text-gray-800">studentInfo.csv</span> provides core demographics and is mandatory. Additional files automatically enrich feature engineering with clicks, scores, and timelines.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Option A: Upload CSV files</h3>
            
            {/* Core Required Files */}
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 mb-4">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">Primary Dataset</h4>
              <FileInput
                label="Student Info"
                onFileSelect={(file) => handleFileSelect('studentInfo', file)}
                requiredFileName="studentInfo.csv"
                isRequired={true}
                statusInfo={fileStatuses['studentInfo.csv']}
              />
            </div>

            {/* Optional Activity & Assessment Files */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Learning Activity & Assessment Logs</h4>
              <FileInput
                label="Student VLE (Clicks)"
                onFileSelect={(file) => handleFileSelect('studentVle', file)}
                requiredFileName="studentVle.csv"
                isRequired={false}
                statusInfo={fileStatuses['studentVle.csv']}
              />
              <FileInput
                label="Student Assessment (Scores)"
                onFileSelect={(file) => handleFileSelect('studentAssessment', file)}
                requiredFileName="studentAssessment.csv"
                isRequired={false}
                statusInfo={fileStatuses['studentAssessment.csv']}
              />
              <FileInput
                label="Student Registration"
                onFileSelect={(file) => handleFileSelect('studentRegistration', file)}
                requiredFileName="studentRegistration.csv"
                isRequired={false}
                statusInfo={fileStatuses['studentRegistration.csv']}
              />
            </div>

            <Button
              onClick={() => handleSubmit('upload')}
              disabled={!hasStudentInfo}
              isLoading={isLoading}
              className="w-full"
              icon={<UploadIcon />}
            >
              Upload & Process Datasets
            </Button>
            {!hasStudentInfo && (
              <p className="text-xs text-amber-600 mt-2 text-center">Please select at least studentInfo.csv to proceed with custom upload.</p>
            )}
          </div>

          <div className="mt-0 md:mt-2 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Option B: Fetch from source</h3>
              <p className="text-sm text-gray-600 mb-4">
                Fetch and initialize the benchmark OULAD dataset directly. Loads studentInfo, studentVle, and studentAssessment into memory with verified actual distributions.
              </p>
              <Button onClick={() => handleSubmit('fetch')} variant="secondary" isLoading={isLoading} className="w-full">
                Fetch OULAD via KaggleHub / Repository
              </Button>
            </div>

            {/* Dataset Inventory & Status Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-bold text-gray-800 mb-2">Dataset Upload & Operation Readiness Matrix</h4>
              <div className="space-y-2 text-xs">
                {OULAD_FILE_DEFINITIONS.map(def => {
                  const status = fileStatuses[def.name];
                  const isLoaded = status?.uploaded;
                  return (
                    <div key={def.name} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0">
                      <div>
                        <span className="font-mono font-medium text-gray-800">{def.name}</span>
                        {def.required ? (
                          <span className="ml-1 text-red-500 font-semibold">(Required)</span>
                        ) : (
                          <span className="ml-1 text-gray-400">(Optional)</span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded font-medium ${isLoaded ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                        {isLoaded ? `Ready (${status.recordCount?.toLocaleString()} rows)` : 'Not uploaded'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
                <strong>Analysis Readiness:</strong> Demographic EDA, Engagement Modeling, K-Means Clustering, and Content Recommendations are active with current loaded data.
              </div>
            </div>
          </div>
        </div>

        {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}
        {successMsg && <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">{successMsg}</div>}
      </Card>

      {/* 2. MODULE 2: DATA PREPROCESSING SECTION */}
      <Card title="Data Preprocessing & Cleaning Pipeline ">
        <p className="text-sm text-gray-600 mb-4">
          Automated data audit, missing value detection, duplicate removal, invalid domain value correction, and feature engineering. Original raw data is strictly preserved while generating clean analysis tables.
        </p>

        {report && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-center">
                <p className="text-xs text-gray-500 uppercase font-medium">Original Records</p>
                <p className="text-xl font-bold text-gray-800 mt-1">{report.originalRecordCount.toLocaleString()}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-center">
                <p className="text-xs text-gray-500 uppercase font-medium">Cleaned Records</p>
                <p className="text-xl font-bold text-green-600 mt-1">{report.cleanedRecordCount.toLocaleString()}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-center">
                <p className="text-xs text-gray-500 uppercase font-medium">Duplicates Removed</p>
                <p className="text-xl font-bold text-blue-600 mt-1">{report.duplicatesRemoved}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-center">
                <p className="text-xs text-gray-500 uppercase font-medium">Engineered Features</p>
                <p className="text-xl font-bold text-purple-600 mt-1">{report.selectedFeaturesCount}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-center">
                <p className="text-xs text-gray-500 uppercase font-medium">Pipeline Status</p>
                <p className="text-xl font-bold text-green-600 mt-1 uppercase">Ready</p>
              </div>
            </div>

            {/* Before vs After Missing Value Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Missing Values Audit (Before Cleaning)</h4>
                <div className="space-y-1.5 text-xs">
                  {Object.entries(report.missingValuesBefore).map(([col, cntRaw]) => {
                    const cnt = cntRaw as number;
                    return (
                    <div key={col} className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0">
                      <span className="font-mono text-gray-700">{col}</span>
                      <span className={`font-semibold ${cnt > 0 ? 'text-amber-600' : 'text-gray-500'}`}>
                        {cnt} missing ({report.originalRecordCount > 0 ? Math.round((cnt / report.originalRecordCount) * 100) : 0}%)
                      </span>
                    </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Missing Values Audit (After Preprocessing)</h4>
                <div className="space-y-1.5 text-xs">
                  {Object.entries(report.missingValuesAfter).map(([col, cnt]) => (
                    <div key={col} className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0">
                      <span className="font-mono text-gray-700">{col}</span>
                      <span className="font-semibold text-green-600">
                        {cnt} missing (0% - Cleaned)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Data Cleaning & Imputation Domain Strategies */}
            <div className="bg-blue-50/40 p-4 rounded-lg border border-blue-100">
              <h4 className="text-sm font-bold text-blue-900 mb-2">Implemented Imputation & Transformation Strategies</h4>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                {Object.entries(report.handlingStrategies).map(([k, desc]) => (
                  <li key={k}>
                    <strong className="capitalize">{k.replace('_', ' ')}:</strong> {desc}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleRunPreprocessingOnly} isLoading={isPreprocessing} variant="secondary">
                Re-run Preprocessing Pipeline
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 3. Summary Statistics Card (Preserved from original) */}
      {summary && (
        <Card title="Summary Statistics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(summary.numeric_descriptive).map(([key, stats]) => {
              const typedStats = stats as SummaryStats['numeric_descriptive'][string];
              return (
                <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-bold text-gray-700 capitalize">{key.replace('_', ' ')}</h4>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>Mean: {typedStats.mean.toFixed(2)}</li>
                    <li>Std Dev: {typedStats.std.toFixed(2)}</li>
                    <li>Median: {typedStats['50%'].toFixed(2)}</li>
                    <li>Min: {typedStats.min.toFixed(2)}, Max: {typedStats.max.toFixed(2)}</li>
                  </ul>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 4. Cleaned Data Sample (Preserved from original) */}
      {data && data.length > 0 && (
        <Card title="Preprocessed Data Sample (Cleaned Dataset Preview)">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">Displaying first 100 cleaned records ready for ML & analytics:</p>
            <Button onClick={handleDownloadCleaned} variant="secondary" icon={<DownloadIcon />}>
              Download Cleaned CSV
            </Button>
          </div>
          <div className="overflow-x-auto max-h-96 border border-gray-200 rounded-md">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  {Object.keys(data[0]).map(key => (
                    <th key={key} className="px-4 py-2.5 text-left font-medium text-gray-500 uppercase tracking-wider">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="px-4 py-2 whitespace-nowrap text-gray-700">{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UploadPage;
