/**
 * Data Preprocessing and Feature Engineering Engine for OULAD datasets.
 * Implements:
 * - Missing value detection & imputation
 * - Duplicate detection & safe removal
 * - Data cleaning (types, bounds, valid domains)
 * - Feature engineering (aggregating clicks, assessment scores, weighted sums, registration delays)
 * - Safe preserving of original raw datasets while generating separate cleaned datasets
 */

import { PreprocessingReport, SummaryStats } from '../types';

export interface RawOuladTables {
  studentInfo?: Record<string, string>[];
  studentVle?: Record<string, string>[];
  studentAssessment?: Record<string, string>[];
  courses?: Record<string, string>[];
  assessments?: Record<string, string>[];
  studentRegistration?: Record<string, string>[];
  vle?: Record<string, string>[];
}

export interface CleanedStudentFeatureRow {
  id_student: number;
  code_module: string;
  code_presentation: string;
  gender: string;
  region: string;
  highest_education: string;
  imd_band: string;
  age_band: string;
  num_of_prev_attempts: number;
  studied_credits: number;
  disability: string;
  final_result: string;
  // Engineered features
  total_clicks: number;
  avg_score: number;
  assessment_count: number;
  engagement_level: 'Low' | 'Medium' | 'High';
  registration_duration: number; // days before/after course start
}

export class OuladPreprocessor {
  public static preprocessAndEngineer(
    tables: RawOuladTables
  ): {
    cleanedData: CleanedStudentFeatureRow[];
    report: PreprocessingReport;
    summaryStats: SummaryStats;
  } {
    const studentInfo = tables.studentInfo || [];
    const studentVle = tables.studentVle || [];
    const studentAssessment = tables.studentAssessment || [];
    const studentRegistration = tables.studentRegistration || [];

    const originalRecordCount = studentInfo.length;

    // 1. Missing Value Detection Before
    const missingValuesBefore: Record<string, number> = {};
    const relevantCols = ['gender', 'region', 'highest_education', 'imd_band', 'age_band', 'studied_credits', 'final_result'];
    for (const col of relevantCols) {
      missingValuesBefore[col] = 0;
    }
    missingValuesBefore['total_clicks'] = 0;
    missingValuesBefore['avg_score'] = 0;

    for (const row of studentInfo) {
      for (const col of relevantCols) {
        const val = row[col];
        if (val === undefined || val === null || val === '' || val === '?' || val === 'NA' || val === 'NaN') {
          missingValuesBefore[col] = (missingValuesBefore[col] || 0) + 1;
        }
      }
    }

    // 2. Duplicate Detection in studentInfo
    const seenStudentModule = new Set<string>();
    let duplicatesRemoved = 0;
    const deduplicatedStudentInfo: Record<string, string>[] = [];

    for (const row of studentInfo) {
      const key = `${row.id_student}_${row.code_module}_${row.code_presentation}`;
      if (seenStudentModule.has(key)) {
        duplicatesRemoved++;
      } else {
        seenStudentModule.add(key);
        deduplicatedStudentInfo.push(row);
      }
    }

    // 3. Feature Aggregations from studentVle (clicks)
    const clicksPerStudent: Record<string, number> = {};
    for (const row of studentVle) {
      const sid = String(row.id_student).trim();
      const clicks = parseInt(row.sum_click, 10);
      const validClicks = isNaN(clicks) ? 0 : Math.max(0, clicks);
      clicksPerStudent[sid] = (clicksPerStudent[sid] || 0) + validClicks;
    }

    // 4. Feature Aggregations from studentAssessment (score & count)
    const assessmentScores: Record<string, { totalScore: number; count: number }> = {};
    for (const row of studentAssessment) {
      const sid = String(row.id_student).trim();
      const score = parseFloat(row.score);
      if (!isNaN(score) && score >= 0 && score <= 100) {
        if (!assessmentScores[sid]) {
          assessmentScores[sid] = { totalScore: 0, count: 0 };
        }
        assessmentScores[sid].totalScore += score;
        assessmentScores[sid].count += 1;
      }
    }

    // 5. Registration duration from studentRegistration
    const regDurations: Record<string, number> = {};
    for (const row of studentRegistration) {
      const key = `${row.id_student}_${row.code_module}_${row.code_presentation}`;
      const regDays = parseInt(row.date_registration, 10);
      if (!isNaN(regDays)) {
        regDurations[key] = regDays;
      }
    }

    // 6. Data Cleaning & Imputation Strategy
    const cleanedRows: CleanedStudentFeatureRow[] = [];
    const missingValuesAfter: Record<string, number> = {};
    for (const col of relevantCols) {
      missingValuesAfter[col] = 0;
    }
    missingValuesAfter['total_clicks'] = 0;
    missingValuesAfter['avg_score'] = 0;

    for (const row of deduplicatedStudentInfo) {
      const id = parseInt(row.id_student, 10);
      if (isNaN(id)) continue; // ignore corrupt primary key

      const sidStr = String(id);
      const key = `${id}_${row.code_module}_${row.code_presentation}`;

      // Clean categorical columns with proper imputation
      const gender = (row.gender === 'M' || row.gender === 'F') ? row.gender : 'Unknown';
      const region = row.region && row.region.trim() !== '' ? row.region.trim() : 'Unknown Region';
      const highest_education = row.highest_education && row.highest_education.trim() !== '' 
        ? row.highest_education.trim() 
        : 'A Level or Equivalent'; // Mode imputation
      const imd_band = row.imd_band && row.imd_band.trim() !== '' && row.imd_band !== '?' 
        ? row.imd_band.trim() 
        : 'Missing / Unknown'; // Domain-preserving label for social deprivation index
      const age_band = row.age_band && row.age_band.trim() !== '' ? row.age_band.trim() : '0-35';
      const num_of_prev_attempts = Math.max(0, parseInt(row.num_of_prev_attempts, 10) || 0);
      const studied_credits = Math.max(0, parseInt(row.studied_credits, 10) || 60);
      const disability = (row.disability === 'Y' || row.disability === 'N') ? row.disability : 'N';
      
      // Standardize final result
      let final_result = row.final_result ? row.final_result.trim() : 'Fail';
      if (!['Pass', 'Distinction', 'Fail', 'Withdrawn'].includes(final_result)) {
        final_result = 'Fail';
      }

      // Aggregate / Impute numeric engineered features
      const total_clicks = clicksPerStudent[sidStr] !== undefined ? clicksPerStudent[sidStr] : 0;
      
      const assessData = assessmentScores[sidStr];
      const assessment_count = assessData ? assessData.count : 0;
      const avg_score = assessData && assessData.count > 0 
        ? Math.round((assessData.totalScore / assessData.count) * 10) / 10 
        : 0;

      // Engagement Level classification based on actual click distribution
      let engagement_level: 'Low' | 'Medium' | 'High' = 'Low';
      if (total_clicks > 2500) {
        engagement_level = 'High';
      } else if (total_clicks >= 800) {
        engagement_level = 'Medium';
      }

      const registration_duration = regDurations[key] !== undefined ? regDurations[key] : -30;

      cleanedRows.push({
        id_student: id,
        code_module: row.code_module || 'Unknown',
        code_presentation: row.code_presentation || 'Unknown',
        gender,
        region,
        highest_education,
        imd_band,
        age_band,
        num_of_prev_attempts,
        studied_credits,
        disability,
        final_result,
        total_clicks,
        avg_score,
        assessment_count,
        engagement_level,
        registration_duration,
      });
    }

    // 7. Calculate summary stats on cleaned dataset
    const numericDescriptive = this.calculateDescriptive(cleanedRows);
    const categoricalCounts = this.calculateCategoricals(cleanedRows);

    const handlingStrategies: Record<string, string> = {
      imd_band: 'Preserved domain meaning by encoding unrecorded bands as "Missing / Unknown"',
      highest_education: 'Mode imputed for empty qualification entries',
      final_result: 'Standardized into Pass / Distinction / Fail / Withdrawn',
      total_clicks: 'Aggregated sum from studentVle records; non-participating students imputed as 0 clicks',
      avg_score: 'Mean calculated over submitted assessments in studentAssessment; non-submissions set to 0',
      duplicates: 'Exact composite key duplicates (id_student, module, presentation) pruned',
    };

    const report: PreprocessingReport = {
      originalRecordCount,
      cleanedRecordCount: cleanedRows.length,
      duplicatesRemoved,
      missingValuesBefore,
      missingValuesAfter,
      selectedFeaturesCount: 16,
      status: 'completed',
      handlingStrategies,
      cleanedDatasetPreview: cleanedRows.slice(0, 100),
    };

    const summaryStats: SummaryStats = {
      total_rows: cleanedRows.length,
      missing_values: missingValuesAfter,
      numeric_descriptive: numericDescriptive,
      categorical_counts: categoricalCounts,
    };

    return { cleanedData: cleanedRows, report, summaryStats };
  }

  private static calculateDescriptive(rows: CleanedStudentFeatureRow[]): SummaryStats['numeric_descriptive'] {
    if (rows.length === 0) return {};
    const cols: (keyof CleanedStudentFeatureRow)[] = ['total_clicks', 'avg_score', 'studied_credits', 'registration_duration'];
    const result: SummaryStats['numeric_descriptive'] = {};

    for (const col of cols) {
      const vals = rows.map(r => Number(r[col]) || 0).sort((a, b) => a - b);
      const n = vals.length;
      const sum = vals.reduce((acc, v) => acc + v, 0);
      const mean = n > 0 ? sum / n : 0;
      const variance = n > 0 ? vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n : 0;
      const std = Math.sqrt(variance);

      const q25 = vals[Math.floor(n * 0.25)] || 0;
      const q50 = vals[Math.floor(n * 0.50)] || 0;
      const q75 = vals[Math.floor(n * 0.75)] || 0;

      result[String(col)] = {
        mean: Math.round(mean * 100) / 100,
        std: Math.round(std * 100) / 100,
        min: vals[0] || 0,
        '25%': q25,
        '50%': q50,
        '75%': q75,
        max: vals[n - 1] || 0,
      };
    }
    return result;
  }

  private static calculateCategoricals(rows: CleanedStudentFeatureRow[]): Record<string, Record<string, number>> {
    const cols: (keyof CleanedStudentFeatureRow)[] = ['gender', 'highest_education', 'age_band', 'final_result', 'engagement_level'];
    const result: Record<string, Record<string, number>> = {};

    for (const col of cols) {
      result[String(col)] = {};
      for (const row of rows) {
        const val = String(row[col]);
        result[String(col)][val] = (result[String(col)][val] || 0) + 1;
      }
    }
    return result;
  }
}
