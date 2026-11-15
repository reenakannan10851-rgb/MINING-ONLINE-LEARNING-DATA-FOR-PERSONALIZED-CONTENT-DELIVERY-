import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Card from '../components/ui/Card';
import {
  getAgeBandCounts,
  getClicksByEducation,
  getScatterData,
  getCorrelationMatrix,
  dataStore
} from '../services/api';
import { AgeBandCount, ClicksByEducation, ScatterPoint, CorrelationMatrix } from '../types';

const PIE_COLORS = ['#3b82f6', '#16a34a', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4'];

const CorrelationHeatmap: React.FC<{ data: CorrelationMatrix }> = ({ data }) => {
  const getColor = (value: number) => {
    const alpha = Math.min(1, Math.max(0.1, Math.abs(value)));
    if (value > 0) {
      return `rgba(37, 99, 235, ${alpha})`; // Blue for positive
    }
    return `rgba(220, 38, 38, ${alpha})`; // Red for negative
  };

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex">
        <div className="w-28"></div>
        {data.columns.map((col) => (
          <div key={col} className="flex-1 text-center font-bold text-xs truncate capitalize px-1">{col.replace('_', ' ')}</div>
        ))}
      </div>
      {data.data.map((row, i) => (
        <div key={i} className="flex items-center">
          <div className="w-28 font-bold text-xs text-right pr-2 truncate capitalize">{data.columns[i].replace('_', ' ')}</div>
          {row.map((value, j) => (
            <div
              key={j}
              className="flex-1 h-12 m-0.5 rounded flex items-center justify-center transition-all hover:scale-105"
              style={{ backgroundColor: getColor(value) }}
              title={`${data.columns[i]} vs ${data.columns[j]}: ${value}`}
            >
              <span className="text-white font-semibold text-xs">{value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const EDAPage: React.FC = () => {
  const [ageData, setAgeData] = useState<AgeBandCount[]>([]);
  const [eduData, setEduData] = useState<ClicksByEducation[]>([]);
  const [scatterData, setScatterData] = useState<ScatterPoint[]>([]);
  const [corrMatrix, setCorrMatrix] = useState<CorrelationMatrix | null>(null);
  
  // Additional OULAD Analytics Distributions
  const [genderData, setGenderData] = useState<{ name: string; value: number }[]>([]);
  const [outcomeData, setOutcomeData] = useState<{ name: string; count: number }[]>([]);
  const [engagementDist, setEngagementDist] = useState<{ name: string; value: number }[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [age, edu, scatter, corr] = await Promise.all([
          getAgeBandCounts(),
          getClicksByEducation(),
          getScatterData(),
          getCorrelationMatrix(),
        ]);
        setAgeData(age);
        setEduData(edu);
        setScatterData(scatter);
        setCorrMatrix(corr);

        // Derive authentic gender, final_result and engagement distributions from actual cleaned data
        const dataset = dataStore.cleanedDataset;
        const genders: Record<string, number> = {};
        const outcomes: Record<string, number> = {};
        const engagements: Record<string, number> = {};

        for (const r of dataset) {
          const g = r.gender === 'M' ? 'Male' : r.gender === 'F' ? 'Female' : 'Unknown';
          genders[g] = (genders[g] || 0) + 1;

          const out = r.final_result || 'Unknown';
          outcomes[out] = (outcomes[out] || 0) + 1;

          const eng = r.engagement_level || 'Medium';
          engagements[eng] = (engagements[eng] || 0) + 1;
        }

        setGenderData(Object.entries(genders).map(([name, value]) => ({ name, value })));
        setOutcomeData(Object.entries(outcomes).map(([name, count]) => ({ name, count })));
        setEngagementDist(Object.entries(engagements).map(([name, value]) => ({ name, value })));
      } catch (error) {
        console.error("Failed to fetch EDA data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 uppercase font-semibold">Total Students Analyzed</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{dataStore.cleanedDataset.length.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 uppercase font-semibold">Average VLE Clicks</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {Math.round(dataStore.cleanedDataset.reduce((a, b) => a + b.total_clicks, 0) / (dataStore.cleanedDataset.length || 1)).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 uppercase font-semibold">Average Score</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {(dataStore.cleanedDataset.reduce((a, b) => a + b.avg_score, 0) / (dataStore.cleanedDataset.length || 1)).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 uppercase font-semibold">Course Pass / Distinction Rate</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {Math.round((dataStore.cleanedDataset.filter(r => r.final_result === 'Pass' || r.final_result === 'Distinction').length / (dataStore.cleanedDataset.length || 1)) * 100)}%
          </p>
        </div>
      </div>

      {/* Main Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Distribution by Age Band (Preserved) */}
        <Card title="Student Distribution by Age Band">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age_band" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        {/* Average Clicks by Education Level (Preserved) */}
        <Card title="Average Clicks by Education Level">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eduData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="highest_education" type="category" width={150} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="average_total_clicks" name="Avg Clicks" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Total Clicks vs. Average Score (Preserved) */}
        <Card title="Total Clicks vs. Average Score (Engagement & Mastery Correlation)">
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis type="number" dataKey="total_clicks" name="Total Clicks" />
              <YAxis type="number" dataKey="avg_score" name="Average Score (%)" domain={[0, 100]} />
              <ZAxis range={[50, 51]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Students" data={scatterData} fill="#1d4ed8" shape="circle" />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>

        {/* Correlation Matrix (Preserved) */}
        <Card title="Correlation Matrix (Engineered Indicators)">
          {corrMatrix ? <CorrelationHeatmap data={corrMatrix} /> : <p className="text-gray-500">Calculating correlations...</p>}
        </Card>

        {/* Student Performance Outcome Distribution */}
        <Card title="Student Final Performance Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={outcomeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8b5cf6" name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Gender Demographic & Engagement Level Breakdown */}
        <Card title="Student Engagement & Demographic Distribution">
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="flex flex-col items-center">
              <h4 className="text-xs font-semibold text-gray-500 mb-2">Gender Breakdown</h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" outerRadius={70} fill="#8884d8" dataKey="value" label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {genderData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col items-center">
              <h4 className="text-xs font-semibold text-gray-500 mb-2">Engagement Level Distribution</h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={engagementDist} cx="50%" cy="50%" outerRadius={70} fill="#82ca9d" dataKey="value" label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {engagementDist.map((_, index) => (
                      <Cell key={`cell-eng-${index}`} fill={['#ef4444', '#f59e0b', '#10b981'][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EDAPage;
