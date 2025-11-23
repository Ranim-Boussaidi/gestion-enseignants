// src/components/Dashboard/StatsWidget.jsx
import React from 'react';

const StatsWidget = ({ title, value, icon, color, subtitle }) => {
  return (
    <div style={{...styles.widget, borderLeft: `4px solid ${color}`}}>
      <div style={styles.icon} className="widget-icon">
        {icon}
      </div>
      <div style={styles.content}>
        <h3 style={styles.value}>{value}</h3>
        <p style={styles.title}>{title}</p>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
};

const styles = {
  widget: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer'
  },
  icon: {
    fontSize: '30px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
  },
  content: {
    flex: 1
  },
  value: {
    margin: '0 0 5px 0',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333'
  },
  title: {
    margin: 0,
    color: '#666',
    fontSize: '14px',
    fontWeight: '500'
  },
  subtitle: {
    margin: '5px 0 0 0',
    color: '#888',
    fontSize: '12px'
  }
};

export default StatsWidget;