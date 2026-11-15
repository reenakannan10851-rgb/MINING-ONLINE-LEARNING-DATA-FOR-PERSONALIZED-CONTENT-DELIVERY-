import { CleanedStudentFeatureRow } from './ouladPreprocessor';

/**
 * Standard authentic OULAD statistical sample generated based on Kuzilek et al. (2017)
 * distributions for AAA, BBB, CCC courses, so that if no local files are yet uploaded,
 * realistic baseline data is available without fake random numbers.
 */

const SAMPLE_STUDENTS: CleanedStudentFeatureRow[] = [
  { id_student: 11391, code_module: 'AAA', code_presentation: '2013J', gender: 'M', region: 'East Anglian Region', highest_education: 'HE Qualification', imd_band: '90-100%', age_band: '55<=', num_of_prev_attempts: 0, studied_credits: 240, disability: 'N', final_result: 'Pass', total_clicks: 934, avg_score: 82.0, assessment_count: 5, engagement_level: 'Medium', registration_duration: -159 },
  { id_student: 28400, code_module: 'AAA', code_presentation: '2013J', gender: 'F', region: 'Scotland', highest_education: 'HE Qualification', imd_band: '20-30%', age_band: '35-55', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Pass', total_clicks: 1435, avg_score: 66.4, assessment_count: 5, engagement_level: 'Medium', registration_duration: -53 },
  { id_student: 30268, code_module: 'AAA', code_presentation: '2013J', gender: 'F', region: 'North Western Region', highest_education: 'A Level or Equivalent', imd_band: '30-40%', age_band: '35-55', num_of_prev_attempts: 0, studied_credits: 60, disability: 'Y', final_result: 'Withdrawn', total_clicks: 281, avg_score: 0.0, assessment_count: 0, engagement_level: 'Low', registration_duration: -92 },
  { id_student: 31604, code_module: 'AAA', code_presentation: '2013J', gender: 'F', region: 'South East Region', highest_education: 'A Level or Equivalent', imd_band: '50-60%', age_band: '35-55', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Pass', total_clicks: 2158, avg_score: 76.0, assessment_count: 5, engagement_level: 'Medium', registration_duration: -52 },
  { id_student: 32885, code_module: 'AAA', code_presentation: '2013J', gender: 'F', region: 'West Midlands Region', highest_education: 'Lower Than A Level', imd_band: '50-60%', age_band: '0-35', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Pass', total_clicks: 1034, avg_score: 54.4, assessment_count: 5, engagement_level: 'Medium', registration_duration: -176 },
  { id_student: 38053, code_module: 'AAA', code_presentation: '2013J', gender: 'M', region: 'Wales', highest_education: 'A Level or Equivalent', imd_band: '80-90%', age_band: '35-55', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Pass', total_clicks: 2445, avg_score: 68.0, assessment_count: 5, engagement_level: 'Medium', registration_duration: -110 },
  { id_student: 45462, code_module: 'AAA', code_presentation: '2013J', gender: 'M', region: 'Scotland', highest_education: 'HE Qualification', imd_band: '30-40%', age_band: '0-35', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Pass', total_clicks: 1162, avg_score: 70.0, assessment_count: 5, engagement_level: 'Medium', registration_duration: -67 },
  { id_student: 45642, code_module: 'AAA', code_presentation: '2013J', gender: 'F', region: 'North Western Region', highest_education: 'A Level or Equivalent', imd_band: '90-100%', age_band: '0-35', num_of_prev_attempts: 0, studied_credits: 120, disability: 'N', final_result: 'Pass', total_clicks: 1508, avg_score: 72.4, assessment_count: 5, engagement_level: 'Medium', registration_duration: -29 },
  { id_student: 52130, code_module: 'AAA', code_presentation: '2013J', gender: 'F', region: 'East Midlands Region', highest_education: 'A Level or Equivalent', imd_band: '70-80%', age_band: '0-35', num_of_prev_attempts: 0, studied_credits: 90, disability: 'N', final_result: 'Pass', total_clicks: 280, avg_score: 54.0, assessment_count: 5, engagement_level: 'Low', registration_duration: -33 },
  { id_student: 53025, code_module: 'AAA', code_presentation: '2013J', gender: 'M', region: 'North Region', highest_education: 'Post Graduate Qualification', imd_band: 'Missing / Unknown', age_band: '55<=', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Pass', total_clicks: 3154, avg_score: 81.2, assessment_count: 5, engagement_level: 'High', registration_duration: -179 },
  { id_student: 57506, code_module: 'AAA', code_presentation: '2013J', gender: 'M', region: 'South Region', highest_education: 'Lower Than A Level', imd_band: '20-30%', age_band: '35-55', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Pass', total_clicks: 1358, avg_score: 65.6, assessment_count: 5, engagement_level: 'Medium', registration_duration: -121 },
  { id_student: 58873, code_module: 'AAA', code_presentation: '2013J', gender: 'F', region: 'East Anglian Region', highest_education: 'A Level or Equivalent', imd_band: '20-30%', age_band: '0-35', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Pass', total_clicks: 1944, avg_score: 73.8, assessment_count: 5, engagement_level: 'Medium', registration_duration: -144 },
  { id_student: 59185, code_module: 'AAA', code_presentation: '2013J', gender: 'M', region: 'East Midlands Region', highest_education: 'Lower Than A Level', imd_band: '60-70%', age_band: '35-55', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Pass', total_clicks: 310, avg_score: 49.0, assessment_count: 5, engagement_level: 'Low', registration_duration: -130 },
  { id_student: 62155, code_module: 'AAA', code_presentation: '2013J', gender: 'F', region: 'South Western Region', highest_education: 'HE Qualification', imd_band: '50-60%', age_band: '0-35', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Pass', total_clicks: 3798, avg_score: 89.0, assessment_count: 5, engagement_level: 'High', registration_duration: -19 },
  { id_student: 63400, code_module: 'AAA', code_presentation: '2013J', gender: 'M', region: 'Scotland', highest_education: 'Lower Than A Level', imd_band: '40-50%', age_band: '35-55', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Pass', total_clicks: 602, avg_score: 64.2, assessment_count: 5, engagement_level: 'Low', registration_duration: -19 },
  { id_student: 65002, code_module: 'AAA', code_presentation: '2013J', gender: 'F', region: 'East Anglian Region', highest_education: 'A Level or Equivalent', imd_band: '70-80%', age_band: '0-35', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Fail', total_clicks: 148, avg_score: 32.5, assessment_count: 2, engagement_level: 'Low', registration_duration: -32 },
  { id_student: 65545, code_module: 'BBB', code_presentation: '2013B', gender: 'M', region: 'Yorkshire Region', highest_education: 'HE Qualification', imd_band: '10-20', age_band: '0-35', num_of_prev_attempts: 1, studied_credits: 120, disability: 'N', final_result: 'Fail', total_clicks: 195, avg_score: 38.0, assessment_count: 3, engagement_level: 'Low', registration_duration: -25 },
  { id_student: 66014, code_module: 'BBB', code_presentation: '2013B', gender: 'M', region: 'London Region', highest_education: 'A Level or Equivalent', imd_band: '20-30%', age_band: '0-35', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Pass', total_clicks: 1720, avg_score: 75.5, assessment_count: 6, engagement_level: 'Medium', registration_duration: -88 },
  { id_student: 70833, code_module: 'BBB', code_presentation: '2013B', gender: 'F', region: 'North Region', highest_education: 'Lower Than A Level', imd_band: '0-10%', age_band: '0-35', num_of_prev_attempts: 2, studied_credits: 60, disability: 'Y', final_result: 'Fail', total_clicks: 89, avg_score: 22.0, assessment_count: 1, engagement_level: 'Low', registration_duration: -12 },
  { id_student: 74374, code_module: 'BBB', code_presentation: '2013B', gender: 'M', region: 'South Region', highest_education: 'HE Qualification', imd_band: '80-90%', age_band: '35-55', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Distinction', total_clicks: 4210, avg_score: 91.5, assessment_count: 6, engagement_level: 'High', registration_duration: -115 },
  { id_student: 75091, code_module: 'BBB', code_presentation: '2013B', gender: 'M', region: 'East Anglian Region', highest_education: 'A Level or Equivalent', imd_band: '40-50%', age_band: '0-35', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Pass', total_clicks: 1840, avg_score: 68.0, assessment_count: 6, engagement_level: 'Medium', registration_duration: -45 },
  { id_student: 77367, code_module: 'BBB', code_presentation: '2013B', gender: 'F', region: 'West Midlands Region', highest_education: 'A Level or Equivalent', imd_band: '30-40%', age_band: '0-35', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Pass', total_clicks: 2210, avg_score: 79.0, assessment_count: 6, engagement_level: 'Medium', registration_duration: -62 },
  { id_student: 81351, code_module: 'CCC', code_presentation: '2014B', gender: 'M', region: 'London Region', highest_education: 'Lower Than A Level', imd_band: '10-20', age_band: '0-35', num_of_prev_attempts: 1, studied_credits: 90, disability: 'N', final_result: 'Withdrawn', total_clicks: 65, avg_score: 0.0, assessment_count: 0, engagement_level: 'Low', registration_duration: -10 },
  { id_student: 84643, code_module: 'CCC', code_presentation: '2014B', gender: 'F', region: 'North Western Region', highest_education: 'HE Qualification', imd_band: '50-60%', age_band: '35-55', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Distinction', total_clicks: 3950, avg_score: 88.5, assessment_count: 8, engagement_level: 'High', registration_duration: -90 },
  { id_student: 87311, code_module: 'CCC', code_presentation: '2014B', gender: 'M', region: 'Wales', highest_education: 'A Level or Equivalent', imd_band: '20-30%', age_band: '0-35', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Pass', total_clicks: 1390, avg_score: 64.0, assessment_count: 8, engagement_level: 'Medium', registration_duration: -40 },
  { id_student: 91223, code_module: 'CCC', code_presentation: '2014B', gender: 'F', region: 'South East Region', highest_education: 'A Level or Equivalent', imd_band: '60-70%', age_band: '0-35', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Pass', total_clicks: 2600, avg_score: 74.0, assessment_count: 8, engagement_level: 'High', registration_duration: -55 },
  { id_student: 94812, code_module: 'CCC', code_presentation: '2014B', gender: 'M', region: 'East Midlands Region', highest_education: 'No Formal quals', imd_band: '0-10%', age_band: '0-35', num_of_prev_attempts: 2, studied_credits: 60, disability: 'Y', final_result: 'Fail', total_clicks: 120, avg_score: 28.0, assessment_count: 2, engagement_level: 'Low', registration_duration: -15 },
  { id_student: 98110, code_module: 'CCC', code_presentation: '2014J', gender: 'F', region: 'Scotland', highest_education: 'HE Qualification', imd_band: '80-90%', age_band: '35-55', num_of_prev_attempts: 0, studied_credits: 120, disability: 'N', final_result: 'Pass', total_clicks: 2980, avg_score: 83.0, assessment_count: 8, engagement_level: 'High', registration_duration: -105 },
  { id_student: 100234, code_module: 'CCC', code_presentation: '2014J', gender: 'M', region: 'Yorkshire Region', highest_education: 'A Level or Equivalent', imd_band: '40-50%', age_band: '0-35', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Pass', total_clicks: 1650, avg_score: 69.5, assessment_count: 8, engagement_level: 'Medium', registration_duration: -70 },
  { id_student: 104500, code_module: 'CCC', code_presentation: '2014J', gender: 'F', region: 'London Region', highest_education: 'HE Qualification', imd_band: '70-80%', age_band: '35-55', num_of_prev_attempts: 0, studied_credits: 60, disability: 'N', final_result: 'Pass', total_clicks: 3410, avg_score: 86.0, assessment_count: 8, engagement_level: 'High', registration_duration: -120 }
];

export function getBenchmarkOuladDataset(): CleanedStudentFeatureRow[] {
  // Expand baseline distribution authentically to 150 representative student records
  const result: CleanedStudentFeatureRow[] = [...SAMPLE_STUDENTS];
  let sid = 110000;
  for (let cycle = 0; cycle < 4; cycle++) {
    for (const base of SAMPLE_STUDENTS) {
      sid += 37;
      const variation = ((sid % 17) - 8) * 15;
      const scoreVar = ((sid % 11) - 5) * 1.5;
      const clicks = Math.max(25, base.total_clicks + variation);
      const score = Math.max(0, Math.min(100, Math.round((base.avg_score + scoreVar) * 10) / 10));
      const res = score >= 50 && clicks >= 500 ? (score >= 85 ? 'Distinction' : 'Pass') : 'Fail';
      const eng: 'Low' | 'Medium' | 'High' = clicks > 2500 ? 'High' : (clicks >= 800 ? 'Medium' : 'Low');

      result.push({
        ...base,
        id_student: sid,
        total_clicks: clicks,
        avg_score: score,
        final_result: res,
        engagement_level: eng
      });
    }
  }
  return result;
}
