// src/components/Dashboard/PresenceChart.jsx
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PresenceChart = () => {
  const data = {
    labels: ['Présents', 'Absents', 'Congés'],
    datasets: [
      {
        data: [75, 15, 10],
        backgroundColor: [
          '#28a745', // Vert pour présents
          '#dc3545', // Rouge pour absents
          '#ffc107'  // Jaune pour congés
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📊 Statistiques de Présence</h3>
      <div style={styles.chartContainer}>
        <Doughnut data={data} options={options} />
      </div>
      <div style={styles.stats}>
        <div style={styles.statItem}>
          <span style={{...styles.dot, background: '#28a745'}}></span>
          <span>75% Présents</span>
        </div>
        <div style={styles.statItem}>
          <span style={{...styles.dot, background: '#dc3545'}}></span>
          <span>15% Absents</span>
        </div>
        <div style={styles.statItem}>
          <span style={{...styles.dot, background: '#ffc107'}}></span>
          <span>10% Congés</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  title: {
    margin: '0 0 20px 0',
    color: '#333',
    fontSize: '18px',
    fontWeight: '600'
  },
  chartContainer: {
    height: '200px',
    marginBottom: '20px'
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: '10px'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#555'
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    display: 'inline-block'
  }
};

export default PresenceChart;