import React, { useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { runClustering, getPCAData, dataStore } from '../services/api';
import { ClusterInfo, PCACoordinate } from '../types';

const CLUSTER_COLORS = ['#3b82f6', '#16a34a', '#ef4444', '#f97316', '#8b5cf6', '#06b6d4'];

const ClusteringPage: React.FC = () => {
  const [k, setK] = useState(3);
  const [clusterInfo, setClusterInfo] = useState<ClusterInfo | null>(dataStore.clusterInfo);
  const [pcaData, setPcaData] = useState<PCACoordinate[] | null>(dataStore.pcaData);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunClustering = async () => {
    setIsLoading(true);
    setClusterInfo(null);
    setPcaData(null);
    try {
      const info = await runClustering(k);
      const pca = await getPCAData();
      setClusterInfo(info);
      setPcaData(pca);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Run K-Means Clustering Card (Preserved) */}
      <Card title="Run K-Means Clustering on Student Learning Behavior">
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          Standardizes numeric behavioral features (total VLE clicks, average assessment score, and studied credits) via z-score normalization and executes K-Means clustering. Identifies distinct student engagement and learning cohorts with interpretable cluster profiles.
        </p>
        <div className="flex items-end space-x-4">
          <div className="w-28">
            <Input
              label="Clusters (k)"
              type="number"
              value={k}
              onChange={(e) => setK(Math.max(2, Math.min(6, parseInt(e.target.value) || 2)))}
              min="2"
              max="6"
            />
          </div>
          <Button onClick={handleRunClustering} isLoading={isLoading}>
            Run Clustering
          </Button>
        </div>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      )}

      {/* 2. Cluster Sizes & Centroids (Preserved) */}
      {clusterInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Cluster Membership & Distribution">
            <ul className="space-y-3">
              {Object.entries(clusterInfo.cluster_sizes).map(([cluster, size]) => {
                const total = dataStore.cleanedDataset.length || 1;
                const pct = Math.round(((size as number) / total) * 100);
                return (
                  <li key={cluster} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CLUSTER_COLORS[parseInt(cluster) % CLUSTER_COLORS.length] }}
                        ></span>
                        <span className="font-bold text-gray-800">Cluster {cluster}</span>
                      </div>
                      <span className="font-semibold text-gray-700">
                        {size.toLocaleString()} students ({pct}%)
                      </span>
                    </div>
                    {clusterInfo.profiles && clusterInfo.profiles[cluster] && (
                      <p className="text-xs text-blue-700 font-medium">
                        Cohort: {clusterInfo.profiles[cluster].label}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card title="Cluster Centroids (Original Domain Units)">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2.5 text-left font-semibold text-gray-700">Feature</th>
                    {Object.keys(clusterInfo.centroids).map((c) => (
                      <th key={c} className="p-2.5 text-center font-semibold text-gray-700">
                        Cluster {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clusterInfo.centroids['0'] &&
                    Object.keys(clusterInfo.centroids['0']).map((feature) => (
                      <tr key={feature} className="hover:bg-gray-50">
                        <td className="p-2.5 font-medium text-gray-700 capitalize">
                          {feature.replace('_', ' ')}
                        </td>
                        {Object.keys(clusterInfo.centroids).map((clusterId) => (
                          <td key={clusterId} className="p-2.5 text-center font-mono font-semibold text-gray-800">
                            {clusterInfo.centroids[clusterId][feature] !== undefined
                              ? clusterInfo.centroids[clusterId][feature].toFixed(1)
                              : '0.0'}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* 3. Detailed Cluster Profiles & Learning Pattern Explanations */}
      {clusterInfo?.profiles && (
        <Card title="Cohort Learning Behavior Patterns & Educational Explanations">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(clusterInfo.profiles).map(([cid, profileRaw]) => {
              const profile = profileRaw as { label: string; description: string; learning_pattern: string };
              return (
              <div
                key={cid}
                className="p-4 rounded-lg border bg-white shadow-sm flex flex-col justify-between"
                style={{ borderTop: `4px solid ${CLUSTER_COLORS[parseInt(cid) % CLUSTER_COLORS.length]}` }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-gray-500">Cluster {cid}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      Profile
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-800 mb-2">{profile.label}</h4>
                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">{profile.description}</p>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-700">Observable Learning Pattern:</p>
                  <p className="text-[11px] text-gray-500 italic mt-0.5">{profile.learning_pattern}</p>
                </div>
              </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 4. PCA Visualization of Clusters (Preserved) */}
      {pcaData && (
        <Card title="2D Principal Component Analysis (PCA) Projection of Student Clusters">
          <p className="text-xs text-gray-500 mb-4">
            Dimensionality reduction projecting high-dimensional engagement metrics onto the two principal axes of maximum variance:
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="pc1" name="Principal Component 1 (Score & Activity Axis)" />
              <YAxis type="number" dataKey="pc2" name="Principal Component 2 (Credits / Study Load Axis)" />
              <ZAxis range={[60, 61]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              {Array.from({ length: k }).map((_, i) => (
                <Scatter
                  key={i}
                  name={`Cluster ${i}`}
                  data={pcaData.filter((p) => p.cluster === i)}
                  fill={CLUSTER_COLORS[i % CLUSTER_COLORS.length]}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};

export default ClusteringPage;
