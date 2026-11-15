import {
  SummaryStats,
  AgeBandCount,
  ClicksByEducation,
  ScatterPoint,
  CorrelationMatrix,
  ModelMetrics,
  ConfusionMatrix,
  FeatureImportance,
  PredictionResult,
  ClusterInfo,
  PCACoordinate,
  Recommendation,
  PreprocessingReport,
  MultiModelComparison,
  EarlyWarningAlert,
  LearningAnalyticsSummary,
  DatasetFileInfo
} from '../types';
import { parseCSV, ParsedCSV } from './csvParser';
import { OuladPreprocessor, CleanedStudentFeatureRow, RawOuladTables } from './ouladPreprocessor';
import { MLAnalyticsEngine, SplitDataset } from './mlEngine';
import { getBenchmarkOuladDataset } from './ouladBenchmark';

/**
 * State store for raw tables, preprocessed records, trained models, and analytics.
 */
class OuladDataStore {
  public rawTables: RawOuladTables = {};
  public fileMetadata: Record<string, DatasetFileInfo> = {
    'studentInfo.csv': { name: 'studentInfo.csv', required: true, uploaded: false },
    'studentVle.csv': { name: 'studentVle.csv', required: false, uploaded: false },
    'studentAssessment.csv': { name: 'studentAssessment.csv', required: false, uploaded: false },
    'courses.csv': { name: 'courses.csv', required: false, uploaded: false },
    'assessments.csv': { name: 'assessments.csv', required: false, uploaded: false },
    'studentRegistration.csv': { name: 'studentRegistration.csv', required: false, uploaded: false },
    'vle.csv': { name: 'vle.csv', required: false, uploaded: false },
  };

  public cleanedDataset: CleanedStudentFeatureRow[] = [];
  public preprocessingReport: PreprocessingReport | null = null;
  public summaryStats: SummaryStats | null = null;

  // ML Models cache
  public splitDataset: SplitDataset | null = null;
  public trainedRF: { predict: (f: number[]) => number; predictProb: (f: number[]) => number; featureImportances: FeatureImportance[] } | null = null;
  public trainedDT: ((f: number[]) => number) | null = null;
  public trainedLR: { predict: (f: number[]) => number } | null = null;
  
  public lastRFMetrics: ModelMetrics | null = null;
  public lastConfusionMatrix: ConfusionMatrix | null = null;
  public modelComparisons: MultiModelComparison[] = [];
  public clusterInfo: ClusterInfo | null = null;
  public pcaData: PCACoordinate[] | null = null;

  constructor() {
    // Initialize with verified authentic benchmark dataset so tabs have initial real data
    this.cleanedDataset = getBenchmarkOuladDataset();
    const { report, summaryStats } = OuladPreprocessor.preprocessAndEngineer({
      studentInfo: this.cleanedDataset.map(r => ({
        id_student: String(r.id_student),
        code_module: r.code_module,
        code_presentation: r.code_presentation,
        gender: r.gender,
        region: r.region,
        highest_education: r.highest_education,
        imd_band: r.imd_band,
        age_band: r.age_band,
        num_of_prev_attempts: String(r.num_of_prev_attempts),
        studied_credits: String(r.studied_credits),
        disability: r.disability,
        final_result: r.final_result
      }))
    });
    this.preprocessingReport = report;
    this.summaryStats = summaryStats;
  }
}

export const dataStore = new OuladDataStore();

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getDatasetFileInfo = (): Record<string, DatasetFileInfo> => {
  return { ...dataStore.fileMetadata };
};

/**
 * Handle user uploading any of the 7 OULAD files.
 * Uses a 0ms setTimeout yield so the browser can paint the loading spinner
 * before the synchronous CSV parse begins.
 */
export const processUploadedFile = async (
  fileKey: string,
  file: File
): Promise<{ success: boolean; info: DatasetFileInfo; error?: string }> => {
  // Generous limits for large files so student matches aren't missed
  const ROW_LIMITS: Record<string, number> = {
    studentInfo: 100_000,
    studentVle: 250_000,
    studentAssessment: 200_000,
    courses: 20_000,
    assessments: 20_000,
    studentRegistration: 100_000,
    vle: 50_000,
  };
  const maxRows = ROW_LIMITS[fileKey] ?? 100_000;

  try {
    // Yield to let the React loading state render before heavy work
    await new Promise<void>(resolve => setTimeout(resolve, 50));

    const text = await file.text();

    // Yield again after reading
    await new Promise<void>(resolve => setTimeout(resolve, 50));

    const parsed: ParsedCSV = parseCSV(text, maxRows);

    const info: DatasetFileInfo = {
      name: file.name,
      required: fileKey === 'studentInfo',
      uploaded: true,
      fileName: file.name,
      fileSize: file.size,
      recordCount: parsed.totalRows,
      columnCount: parsed.headers.length,
      headers: parsed.headers,
      previewRows: parsed.rows.slice(0, 5),
    };

    // Map fileKey → table slot
    const keyMap: Record<string, keyof RawOuladTables> = {
      studentInfo: 'studentInfo',
      studentVle: 'studentVle',
      studentAssessment: 'studentAssessment',
      courses: 'courses',
      assessments: 'assessments',
      studentRegistration: 'studentRegistration',
      vle: 'vle',
    };
    const tableKey = keyMap[fileKey] ?? keyMap[Object.keys(keyMap).find(k => file.name.toLowerCase().startsWith(k.toLowerCase())) ?? ''];
    if (tableKey) {
      (dataStore.rawTables as any)[tableKey] = parsed.rows;
    }

    // Also match by filename in case fileKey is unexpected
    const csvName = file.name.toLowerCase();
    if (csvName.includes('studentinfo')) dataStore.rawTables.studentInfo = parsed.rows;
    else if (csvName.includes('studentvle')) dataStore.rawTables.studentVle = parsed.rows;
    else if (csvName.includes('studentassessment')) dataStore.rawTables.studentAssessment = parsed.rows;
    else if (csvName.includes('courses')) dataStore.rawTables.courses = parsed.rows;
    else if (csvName.includes('assessments')) dataStore.rawTables.assessments = parsed.rows;
    else if (csvName.includes('studentregistration')) dataStore.rawTables.studentRegistration = parsed.rows;
    else if (csvName.includes('vle')) dataStore.rawTables.vle = parsed.rows;

    // Update file metadata
    const metaKey = Object.keys(dataStore.fileMetadata).find(
      k => k.toLowerCase() === file.name.toLowerCase() || k.toLowerCase().startsWith(fileKey.toLowerCase())
    ) ?? file.name;
    dataStore.fileMetadata[metaKey] = info;

    return { success: true, info };
  } catch (err: any) {
    return {
      success: false,
      info: { name: file.name, required: fileKey === 'studentInfo', uploaded: false },
      error: err?.message ?? 'Error reading or parsing the CSV file.',
    };
  }
};

/**
 * Execute Module 2 Preprocessing on uploaded tables
 */
export const runDataPreprocessing = async (): Promise<{
  report: PreprocessingReport;
  summary: SummaryStats;
  sample: any[];
}> => {
  await wait(600);
  
  if (!dataStore.rawTables.studentInfo || dataStore.rawTables.studentInfo.length === 0) {
    // If user hasn't uploaded raw studentInfo yet, use benchmark authentic OULAD
    const bench = getBenchmarkOuladDataset();
    dataStore.cleanedDataset = bench;
    const { report, summaryStats } = OuladPreprocessor.preprocessAndEngineer({
      studentInfo: bench.map(r => ({
        id_student: String(r.id_student),
        code_module: r.code_module,
        code_presentation: r.code_presentation,
        gender: r.gender,
        region: r.region,
        highest_education: r.highest_education,
        imd_band: r.imd_band,
        age_band: r.age_band,
        num_of_prev_attempts: String(r.num_of_prev_attempts),
        studied_credits: String(r.studied_credits),
        disability: r.disability,
        final_result: r.final_result
      }))
    });
    dataStore.preprocessingReport = report;
    dataStore.summaryStats = summaryStats;
    // reset model cache
    dataStore.trainedRF = null;
    return { report, summary: summaryStats, sample: report.cleanedDatasetPreview };
  }

  const { cleanedData, report, summaryStats } = OuladPreprocessor.preprocessAndEngineer(dataStore.rawTables);
  dataStore.cleanedDataset = cleanedData;
  dataStore.preprocessingReport = report;
  dataStore.summaryStats = summaryStats;
  // reset models so they train on new data
  dataStore.trainedRF = null;
  dataStore.splitDataset = null;

  return {
    report,
    summary: summaryStats,
    sample: report.cleanedDatasetPreview
  };
};

export const uploadFiles = async (files: { [key: string]: File }): Promise<{ sample: any[]; summary: SummaryStats; report?: PreprocessingReport }> => {
  for (const [key, file] of Object.entries(files)) {
    if (file) {
      await processUploadedFile(key, file);
    }
  }
  const result = await runDataPreprocessing();
  return {
    sample: result.sample,
    summary: result.summary,
    report: result.report
  };
};

export const fetchOulad = async (): Promise<{ sample: any[]; summary: SummaryStats; report?: PreprocessingReport }> => {
  await wait(1000);
  const bench = getBenchmarkOuladDataset();
  dataStore.cleanedDataset = bench;
  const { report, summaryStats } = OuladPreprocessor.preprocessAndEngineer({
    studentInfo: bench.map(r => ({
      id_student: String(r.id_student),
      code_module: r.code_module,
      code_presentation: r.code_presentation,
      gender: r.gender,
      region: r.region,
      highest_education: r.highest_education,
      imd_band: r.imd_band,
      age_band: r.age_band,
      num_of_prev_attempts: String(r.num_of_prev_attempts),
      studied_credits: String(r.studied_credits),
      disability: r.disability,
      final_result: r.final_result
    }))
  });
  dataStore.preprocessingReport = report;
  dataStore.summaryStats = summaryStats;
  dataStore.fileMetadata['studentInfo.csv'].uploaded = true;
  dataStore.fileMetadata['studentInfo.csv'].recordCount = bench.length;
  dataStore.fileMetadata['studentVle.csv'].uploaded = true;
  dataStore.fileMetadata['studentAssessment.csv'].uploaded = true;

  return { sample: report.cleanedDatasetPreview, summary: summaryStats, report };
};

/* =========================================================================
 * MODULE 3 – EXPLORATORY DATA ANALYSIS (EDA) & CLUSTERING
 * ========================================================================= */

export const getAgeBandCounts = async (): Promise<AgeBandCount[]> => {
  await wait(200);
  const counts: Record<string, number> = {};
  for (const row of dataStore.cleanedDataset) {
    const ab = row.age_band || '0-35';
    counts[ab] = (counts[ab] || 0) + 1;
  }
  return Object.entries(counts).map(([age_band, count]) => ({ age_band, count }));
};

export const getClicksByEducation = async (): Promise<ClicksByEducation[]> => {
  await wait(200);
  const grouped: Record<string, { totalClicks: number; count: number }> = {};
  for (const row of dataStore.cleanedDataset) {
    const edu = row.highest_education || 'Unknown';
    if (!grouped[edu]) grouped[edu] = { totalClicks: 0, count: 0 };
    grouped[edu].totalClicks += row.total_clicks;
    grouped[edu].count++;
  }
  return Object.entries(grouped).map(([highest_education, val]) => ({
    highest_education,
    average_total_clicks: Math.round(val.count > 0 ? val.totalClicks / val.count : 0)
  }));
};

export const getScatterData = async (): Promise<ScatterPoint[]> => {
  await wait(200);
  return dataStore.cleanedDataset.slice(0, 200).map(r => ({
    total_clicks: r.total_clicks,
    avg_score: r.avg_score
  }));
};

export const getCorrelationMatrix = async (): Promise<CorrelationMatrix> => {
  await wait(200);
  const cols = ['total_clicks', 'avg_score', 'studied_credits'];
  const n = dataStore.cleanedDataset.length || 1;

  const dataSeries: Record<string, number[]> = {
    total_clicks: dataStore.cleanedDataset.map(r => r.total_clicks),
    avg_score: dataStore.cleanedDataset.map(r => r.avg_score),
    studied_credits: dataStore.cleanedDataset.map(r => r.studied_credits),
  };

  const matrix: number[][] = [];
  for (let i = 0; i < cols.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < cols.length; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
      } else {
        const x = dataSeries[cols[i]];
        const y = dataSeries[cols[j]];
        const mx = x.reduce((a, b) => a + b, 0) / n;
        const my = y.reduce((a, b) => a + b, 0) / n;
        let num = 0;
        let denX = 0;
        let denY = 0;
        for (let k = 0; k < n; k++) {
          const dx = x[k] - mx;
          const dy = y[k] - my;
          num += dx * dy;
          denX += dx * dx;
          denY += dy * dy;
        }
        const den = Math.sqrt(denX * denY);
        const r = den > 0 ? num / den : 0;
        matrix[i][j] = Math.round(r * 100) / 100;
      }
    }
  }

  return { columns: cols, data: matrix };
};

export const runClustering = async (k: number): Promise<ClusterInfo> => {
  await wait(500);
  const result = MLAnalyticsEngine.runKMeans(dataStore.cleanedDataset, k);
  dataStore.clusterInfo = result.clusterInfo;
  dataStore.pcaData = result.pcaData;
  return result.clusterInfo;
};

export const getPCAData = async (): Promise<PCACoordinate[]> => {
  await wait(200);
  if (!dataStore.pcaData) {
    const result = MLAnalyticsEngine.runKMeans(dataStore.cleanedDataset, 3);
    dataStore.clusterInfo = result.clusterInfo;
    dataStore.pcaData = result.pcaData;
  }
  return dataStore.pcaData || [];
};

/* =========================================================================
 * MODULE 4 & 5 – PREDICTIVE MODEL BUILDING & EVALUATION
 * ========================================================================= */

export const trainModel = async (): Promise<{
  metrics: ModelMetrics;
  confusion_matrix: ConfusionMatrix;
  feature_importances: FeatureImportance[];
  comparisons: MultiModelComparison[];
}> => {
  const startTime = Date.now();
  await wait(600);

  // Encode & split data
  dataStore.splitDataset = MLAnalyticsEngine.encodeDataset(dataStore.cleanedDataset);
  const { train, test } = dataStore.splitDataset;

  // 1. Train Decision Tree
  const t0_dt = Date.now();
  const dtPredict = MLAnalyticsEngine.trainDecisionTree(train);
  const dtEval = MLAnalyticsEngine.evaluateModel('Decision Tree', dtPredict, test, Date.now() - t0_dt);
  dataStore.trainedDT = dtPredict;

  // 2. Train Logistic Regression
  const t0_lr = Date.now();
  const lrModel = MLAnalyticsEngine.trainLogisticRegression(train);
  const lrEval = MLAnalyticsEngine.evaluateModel('Logistic Regression', lrModel.predict, test, Date.now() - t0_lr);
  dataStore.trainedLR = lrModel;

  // 3. Train Random Forest (Ensemble)
  const t0_rf = Date.now();
  const rfModel = MLAnalyticsEngine.trainRandomForest(train, 7);
  const rfTrainingTime = Date.now() - t0_rf;
  const rfEval = MLAnalyticsEngine.evaluateModel('Random Forest (Ensemble)', rfModel.predict, test, rfTrainingTime);
  dataStore.trainedRF = rfModel;

  const comparisons: MultiModelComparison[] = [
    rfEval.comparison,
    dtEval.comparison,
    lrEval.comparison
  ];

  // Mark best model
  const maxF1 = Math.max(...comparisons.map(c => c.f1_score));
  comparisons.forEach(c => {
    c.isBest = c.f1_score === maxF1;
  });

  dataStore.lastRFMetrics = rfEval.metrics;
  dataStore.lastConfusionMatrix = rfEval.confusionMatrix;
  dataStore.modelComparisons = comparisons;

  return {
    metrics: rfEval.metrics,
    confusion_matrix: rfEval.confusionMatrix,
    feature_importances: rfModel.featureImportances,
    comparisons
  };
};

export const getPrediction = async (studentId: string): Promise<PredictionResult> => {
  await wait(300);
  const sid = parseInt(studentId, 10);
  if (isNaN(sid)) {
    throw new Error('Please enter a valid numeric Student ID.');
  }

  // Ensure model is ready
  if (!dataStore.trainedRF) {
    await trainModel();
  }

  return MLAnalyticsEngine.predictStudent(sid, dataStore.cleanedDataset, dataStore.trainedRF!.predictProb);
};

/* =========================================================================
 * MODULE 6 – PERSONALIZED RECOMMENDATIONS & EXTENSIONS
 * ========================================================================= */

export const getRecommendation = async (studentId: string): Promise<Recommendation> => {
  await wait(300);
  const sid = parseInt(studentId, 10);
  if (isNaN(sid)) {
    throw new Error('Please enter a valid numeric Student ID.');
  }

  if (!dataStore.trainedRF) {
    await trainModel();
  }

  const cluster = (dataStore.clusterInfo?.labels && dataStore.clusterInfo.labels[String(sid)]) || 0;
  return MLAnalyticsEngine.generateRecommendation(
    sid,
    dataStore.cleanedDataset,
    cluster,
    dataStore.trainedRF?.predictProb
  );
};

export const getAllRecommendations = (): Recommendation[] => {
  const predictProb = dataStore.trainedRF?.predictProb;
  return dataStore.cleanedDataset.map(student => {
    const cluster = (dataStore.clusterInfo?.labels && dataStore.clusterInfo.labels[String(student.id_student)]) || 0;
    return MLAnalyticsEngine.generateRecommendation(student.id_student, dataStore.cleanedDataset, cluster, predictProb);
  });
};

export const getEarlyWarningAlerts = async (): Promise<{ alerts: EarlyWarningAlert[]; missingSupplementaryData: boolean }> => {
  await wait(200);
  const dataset = dataStore.cleanedDataset;
  
  // Directly check whether studentVle or studentAssessment files were uploaded into rawTables
  // Or check if all records have zero activity
  const hasUploadedVle = !!(dataStore.rawTables.studentVle && dataStore.rawTables.studentVle.length > 0);
  const hasUploadedAssessment = !!(dataStore.rawTables.studentAssessment && dataStore.rawTables.studentAssessment.length > 0);
  const hasAnyClicksOrScore = dataset.some(s => s.total_clicks > 0 || s.avg_score > 0);

  // If neither VLE nor Assessment tables exist AND no student has clicks or scores, it's missing data
  const missingSupplementaryData = (!hasUploadedVle && !hasUploadedAssessment && !hasAnyClicksOrScore);
  
  const alerts = MLAnalyticsEngine.getEarlyWarningAlerts(dataset);
  return { alerts, missingSupplementaryData };
};

export const getLearningAnalyticsSummary = (): LearningAnalyticsSummary => {
  const dataset = dataStore.cleanedDataset;
  const n = dataset.length || 1;
  const avgScore = Math.round((dataset.reduce((a, b) => a + b.avg_score, 0) / n) * 10) / 10;
  const avgClicks = Math.round(dataset.reduce((a, b) => a + b.total_clicks, 0) / n);
  const passCount = dataset.filter(s => s.final_result === 'Pass' || s.final_result === 'Distinction').length;
  const atRiskCount = dataset.filter(s => (s.total_clicks > 0 || s.avg_score > 0) && (s.avg_score < 40 || s.total_clicks < 500)).length;
  const highAchieverCount = dataset.filter(s => s.avg_score >= 80 && s.total_clicks >= 2500).length;

  return {
    totalStudents: dataset.length,
    averageScore: avgScore,
    averageClicks: avgClicks,
    passRate: Math.round((passCount / n) * 100),
    atRiskCount,
    highAchieverCount,
    moderateCount: dataset.length - atRiskCount - highAchieverCount
  };
};
