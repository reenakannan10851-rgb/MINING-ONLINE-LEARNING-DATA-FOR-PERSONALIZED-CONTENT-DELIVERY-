export interface SummaryStats {
  total_rows: number;
  missing_values: Record<string, number>;
  numeric_descriptive: Record<string, {
    mean: number;
    std: number;
    min: number;
    '25%': number;
    '50%': number;
    '75%': number;
    max: number;
  }>;
  categorical_counts: Record<string, Record<string, number>>;
}

export interface AgeBandCount {
  age_band: string;
  count: number;
}

export interface ClicksByEducation {
  highest_education: string;
  average_total_clicks: number;
}

export interface ScatterPoint {
  total_clicks: number;
  avg_score: number;
}

export interface CorrelationMatrix {
  columns: string[];
  data: number[][];
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  trainingTimeMs?: number;
}

export interface ConfusionMatrix {
  labels: string[];
  values: number[][];
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface PredictionResult {
  id_student: number;
  predicted_class: string;
  confidence?: number;
  engagement_level?: 'Low' | 'Medium' | 'High';
  risk_level?: 'High' | 'Medium' | 'Low';
  explanation?: string;
  contributing_features?: { feature: string; value: string | number; impact: 'positive' | 'negative' | 'neutral' }[];
}

export interface ClusterInfo {
  cluster_sizes: Record<string, number>;
  centroids: Record<string, Record<string, number>>;
  labels: Record<string, number>;
  profiles?: Record<string, { label: string; description: string; learning_pattern: string }>;
}

export interface PCACoordinate {
  pc1: number;
  pc2: number;
  cluster: number;
  id_student: string;
}

export interface Recommendation {
  id_student: number;
  recommendation: string;
  predicted_class: string;
  cluster_label: number;
  engagement_level?: 'Low' | 'Medium' | 'High';
  risk_category?: 'High Risk' | 'Moderate Risk' | 'Low Risk / High Achiever';
  content_category?: string;
  reason?: string;
  learning_pathway?: string[];
}

// Module 1 & 2 types
export interface DatasetFileInfo {
  name: string;
  required: boolean;
  uploaded: boolean;
  fileName?: string;
  fileSize?: number;
  recordCount?: number;
  columnCount?: number;
  headers?: string[];
  missingColumns?: string[];
  previewRows?: Record<string, string>[];
}

export interface PreprocessingReport {
  originalRecordCount: number;
  cleanedRecordCount: number;
  duplicatesRemoved: number;
  missingValuesBefore: Record<string, number>;
  missingValuesAfter: Record<string, number>;
  selectedFeaturesCount: number;
  status: 'idle' | 'ready' | 'processing' | 'completed';
  handlingStrategies: Record<string, string>;
  cleanedDatasetPreview: any[];
}

export interface MultiModelComparison {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  trainingTimeMs: number;
  isBest?: boolean;
}

export interface EarlyWarningAlert {
  id_student: number;
  risk_level: 'High' | 'Medium' | 'Low';
  warning_indicators: string[];
  intervention_suggestions: string[];
  total_clicks: number;
  avg_score: number;
}

export interface LearningAnalyticsSummary {
  totalStudents: number;
  averageScore: number;
  averageClicks: number;
  passRate: number;
  atRiskCount: number;
  highAchieverCount: number;
  moderateCount: number;
}
