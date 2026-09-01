import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import useStore, { api } from '../store/useStore';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement);

const METRIC_COLORS = {
  accuracy: '#3b82f6',
  precision: '#8b5cf6',
  recall: '#06b6d4',
  f1_score: '#22c55e',
};

export default function ModelComparison() {
  const { benchmarkResults, benchmarkLoading, loadBenchmark, trainModels } = useStore();
  const [training, setTraining] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('f1_score');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadBenchmark();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get('/api/ml/categories');
      setCategories(res.data.categories || []);
    } catch (e) {}
  };

  const handleTrain = async () => {
    setTraining(true);
    try {
      await trainModels();
      setTimeout(() => { loadBenchmark(); setTraining(false); }, 5000);
    } catch (e) {
      setTraining(false);
    }
  };

  const models = benchmarkResults?.models || [];

  const chartData = models.length > 0 ? {
    labels: models.map((m) => m.model),
    datasets: [
      {
        label: 'Accuracy (%)',
        data: models.map((m) => m.accuracy),
        backgroundColor: `${METRIC_COLORS.accuracy}99`,
        borderColor: METRIC_COLORS.accuracy,
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Precision (%)',
        data: models.map((m) => m.precision),
        backgroundColor: `${METRIC_COLORS.precision}99`,
        borderColor: METRIC_COLORS.precision,
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Recall (%)',
        data: models.map((m) => m.recall),
        backgroundColor: `${METRIC_COLORS.recall}99`,
        borderColor: METRIC_COLORS.recall,
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'F1-Score (%)',
        data: models.map((m) => m.f1_score),
        backgroundColor: `${METRIC_COLORS.f1_score}99`,
        borderColor: METRIC_COLORS.f1_score,
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 12 },
          padding: 16,
        },
      },
      title: { display: false },
      tooltip: {
        backgroundColor: '#0a1628',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(59,130,246,0.3)',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw.toFixed(1)}%`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
        grid: { color: 'rgba(59,130,246,0.06)' },
      },
      y: {
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, callback: (v) => `${v}%` },
        grid: { color: 'rgba(59,130,246,0.06)' },
        min: 0, max: 100,
      },
    },
  };

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <div className="section-title">🧠 ML Model Comparison</div>
          <div className="section-subtitle">
            Academic benchmark — Naive Bayes · Logistic Regression · SVM · Random Forest comparison
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleTrain}
          disabled={training || benchmarkLoading}
          id="train-models-btn"
        >
          {training || benchmarkLoading ? (
            <><div className="spinner" style={{ width: 16, height: 16 }} /> Training...</>
          ) : '🔄 Retrain Models'}
        </button>
      </div>

      {/* Status */}
      {benchmarkResults?.status && (
        <div className="alert alert-info" style={{ marginBottom: '24px' }}>
          <span>ℹ️</span>
          <span>
            Results: <strong>{benchmarkResults.status === 'cached' ? 'Loaded from cache' : 'Freshly trained'}</strong>
            {benchmarkResults.best_model && <> · Best model: <strong>{benchmarkResults.best_model}</strong></>}
          </span>
        </div>
      )}

      {benchmarkLoading && (
        <div style={{ textAlign: 'center', padding: '64px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', width: 32, height: 32 }} />
          <div style={{ color: 'var(--color-text-muted)' }}>Training classifiers on the dataset...</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>This may take 30–60 seconds on first run</div>
        </div>
      )}

      {!benchmarkLoading && models.length > 0 && (
        <>
          {/* Results Table */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>📊 Model Performance Comparison</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Model</th>
                    <th>Vectorizer</th>
                    <th>Accuracy</th>
                    <th>Precision</th>
                    <th>Recall</th>
                    <th>F1-Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((m, i) => (
                    <tr key={m.model}>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{m.model}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>TF-IDF</td>
                      <td><MetricCell value={m.accuracy} /></td>
                      <td><MetricCell value={m.precision} /></td>
                      <td><MetricCell value={m.recall} /></td>
                      <td><MetricCell value={m.f1_score} highlight={i === 0} /></td>
                      <td>
                        <span style={{
                          fontSize: '0.72rem',
                          background: i === 0 ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)',
                          color: i === 0 ? 'var(--color-success)' : 'var(--color-blue-light)',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          border: `1px solid ${i === 0 ? 'rgba(34,197,94,0.2)' : 'rgba(59,130,246,0.2)'}`,
                        }}>
                          {i === 0 ? '✓ Best' : 'Trained'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1rem' }}>📈 Performance Bar Chart</h3>
            {chartData && (
              <Bar data={chartData} options={chartOptions} style={{ maxHeight: '320px' }} />
            )}
          </div>
        </>
      )}

      {!benchmarkLoading && models.length === 0 && !benchmarkResults?.error && (
        <div className="glass-card" style={{ padding: '64px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🤖</div>
          <h3 style={{ marginBottom: '8px' }}>Models Not Trained Yet</h3>
          <p style={{ marginBottom: '24px' }}>
            Click "Retrain Models" to train all classifiers on the cybercrime dataset.<br />
            This will compare Naive Bayes, Logistic Regression, SVM, and Random Forest.
          </p>
          <button className="btn btn-primary" onClick={handleTrain} id="train-now-btn">
            🚀 Train Now
          </button>
        </div>
      )}

      {benchmarkResults?.error && (
        <div className="alert alert-critical">
          <span>⚠️</span><span>{benchmarkResults.error}</span>
        </div>
      )}

      {/* Crime Categories */}
      <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1rem' }}>📂 Crime Categories ({categories.length})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {categories.map((cat, i) => (
            <div key={i} style={{
              padding: '12px 16px',
              background: 'rgba(59,130,246,0.04)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                {cat.name}
              </div>
              {cat.indicators?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {cat.indicators.slice(0, 4).map((ind, j) => (
                    <span key={j} style={{
                      fontSize: '0.68rem',
                      background: 'rgba(59,130,246,0.1)',
                      color: 'var(--color-text-muted)',
                      padding: '1px 6px',
                      borderRadius: '999px',
                    }}>
                      {ind}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Methodology Note */}
      <div className="glass-card" style={{ padding: '20px 24px', marginTop: '20px', border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.04)' }}>
        <div style={{ fontWeight: 700, marginBottom: '10px', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
          📖 Methodology Note
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
          All models use <strong>TF-IDF vectorization</strong> (n-gram range 1–2, max 15,000 features, sublinear TF scaling) with specialized preprocessing for Indian cybercrime text (amount normalization, phone number masking, URL removal).
          Evaluation uses <strong>macro-averaged metrics</strong> on a 20% held-out test set with stratified splitting.
          A DistilBERT fine-tuned model is available as a Colab notebook for GPU-based training.
        </div>
      </div>
    </div>
  );
}

function MetricCell({ value, highlight }) {
  const color = value >= 80 ? '#22c55e' : value >= 60 ? '#eab308' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        fontWeight: highlight ? 800 : 600,
        color: highlight ? color : 'var(--color-text-primary)',
        fontSize: highlight ? '1rem' : '0.9rem',
      }}>
        {value?.toFixed(1)}%
      </div>
      <div style={{ flex: 1, maxWidth: 60 }}>
        <div className="confidence-bar" style={{ height: 4 }}>
          <div
            className="confidence-fill"
            style={{ width: `${value || 0}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}
          />
        </div>
      </div>
    </div>
  );
}
