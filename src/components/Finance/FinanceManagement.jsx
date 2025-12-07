// src/components/Finance/FinanceManagement.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { financeService } from '../../services/financeService';
import PrimeForm from './PrimeForm';
import AcompteForm from './AcompteForm';

const FinanceManagement = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('primes');
  const [primes, setPrimes] = useState([]);
  const [acomptes, setAcomptes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrimeForm, setShowPrimeForm] = useState(false);
  const [showAcompteForm, setShowAcompteForm] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, [filter, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('=== CHARGEMENT DONNÉES ===');
      console.log('Utilisateur:', user?.email, 'Rôle:', user?.role);
      
      let primesData = [];
      let acomptesData = [];
      let statsData = null;

      if (user?.role === 'admin') {
        // ADMIN: voir TOUTES les données
        const filters = filter !== 'all' ? { statut: filter } : {};
        
        [primesData, acomptesData, statsData] = await Promise.all([
          financeService.getPrimes(filters),
          financeService.getAcomptes(filters),
          financeService.getStatsFinancieres()
        ]);
        
        console.log('ADMIN - Primes:', primesData.length, 'Acomptes:', acomptesData.length);
        
      } else if (user?.role === 'teacher') {
        // ENSEIGNANT: voir seulement SES données
        const teacherId = user?.id || user?.uid;
        console.log('ENSEIGNANT ID:', teacherId);
        
        // Créer les filtres pour les méthodes existantes
        const filters = { 
          enseignantId: teacherId  // IMPORTANT: ce filtre est supporté par getPrimes() et getAcomptes()
        };
        
        if (filter !== 'all') {
          filters.statut = filter;
        }
        
        console.log('Filtres appliqués:', filters);
        
        [primesData, acomptesData, statsData] = await Promise.all([
          financeService.getPrimes(filters),
          financeService.getAcomptes(filters),
          financeService.getStatsFinancieres(teacherId)
        ]);
        
        console.log('✅ Primes trouvées:', primesData.length);
        console.log('✅ Acomptes trouvés:', acomptesData.length);
        
        // Debug: vérifier la première prime
        if (primesData.length > 0) {
          console.log('Exemple prime:', {
            libelle: primesData[0].libelle,
            montant: primesData[0].montant,
            enseignantId: primesData[0].enseignantId,
            statut: primesData[0].statut
          });
        }
      }

      setPrimes(primesData || []);
      setAcomptes(acomptesData || []);
      setStats(statsData);
      
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      
      // Méthode de secours si erreur avec les filtres
      await loadDataFallback();
    }
    setLoading(false);
  };

  // Méthode de secours en cas d'erreur
  const loadDataFallback = async () => {
    try {
      console.log('🔄 Utilisation méthode de secours...');
      
      // Charger TOUTES les données
      const allPrimes = await financeService.getPrimes({});
      const allAcomptes = await financeService.getAcomptes({});
      
      console.log('Toutes primes:', allPrimes.length);
      console.log('Tous acomptes:', allAcomptes.length);
      
      let primesData = [];
      let acomptesData = [];
      let statsData = null;
      
      if (user?.role === 'teacher') {
        const teacherId = user?.id || user?.uid;
        
        // Filtrer manuellement
        const myPrimes = allPrimes.filter(p => {
          const match = p.enseignantId === teacherId;
          if (!match && p.enseignantId) {
            console.log(`Mismatch: prime.enseignantId="${p.enseignantId}" !== user.id="${teacherId}"`);
          }
          return match;
        });
        
        const myAcomptes = allAcomptes.filter(a => a.enseignantId === teacherId);
        
        console.log(`Mes primes (manuel): ${myPrimes.length}/${allPrimes.length}`);
        console.log(`Mes acomptes (manuel): ${myAcomptes.length}/${allAcomptes.length}`);
        
        // Appliquer filtre statut
        if (filter !== 'all') {
          primesData = myPrimes.filter(p => p.statut === filter);
          acomptesData = myAcomptes.filter(a => a.statut === filter);
        } else {
          primesData = myPrimes;
          acomptesData = myAcomptes;
        }
        
        statsData = await financeService.getStatsFinancieres(teacherId);
        
      } else if (user?.role === 'admin') {
        if (filter !== 'all') {
          primesData = allPrimes.filter(p => p.statut === filter);
          acomptesData = allAcomptes.filter(a => a.statut === filter);
        } else {
          primesData = allPrimes;
          acomptesData = allAcomptes;
        }
        
        statsData = await financeService.getStatsFinancieres();
      }
      
      setPrimes(primesData);
      setAcomptes(acomptesData);
      setStats(statsData);
      
    } catch (error) {
      console.error('❌ Erreur méthode secours:', error);
    }
  };

  const handleApprove = async (type, id) => {
    try {
      if (type === 'prime') {
        await financeService.traiterPrime(id, 'approuve', user?.email);
      } else {
        await financeService.traiterAcompte(id, 'approuve', user?.email);
      }
      await loadData();
      alert('✅ Demandé approuvée avec succès!');
    } catch (error) {
      console.error('Erreur approbation:', error);
      alert('❌ Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (type, id) => {
    const motif = prompt('Motif du refus:');
    if (!motif) return;
    
    try {
      if (type === 'prime') {
        await financeService.traiterPrime(id, 'refuse', user?.email);
      } else {
        await financeService.traiterAcompte(id, 'refuse', user?.email);
      }
      await loadData();
      alert('✅ Demandé refusée');
    } catch (error) {
      console.error('Erreur refus:', error);
      alert('❌ Erreur lors du refus');
    }
  };

  const handleMarkPaid = async (type, id) => {
    try {
      if (type === 'prime') {
        await financeService.marquerPrimePayee(id);
      } else {
        await financeService.marquerAcomptePaye(id);
      }
      await loadData();
      alert('✅ Marqué comme payé!');
    } catch (error) {
      console.error('Erreur marquage payé:', error);
      alert('❌ Erreur');
    }
  };

  const getStatusColor = (statut) => {
    switch(statut) {
      case 'approuve': return '#28a745';
      case 'paye': return '#17a2b8';
      case 'refuse': return '#dc3545';
      case 'en_attente': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusLabel = (statut) => {
    switch(statut) {
      case 'approuve': return '✅ Approuvé';
      case 'paye': return '💰 Payé';
      case 'refuse': return '❌ Refusé';
      case 'en_attente': return '⏳ En attente';
      default: return 'Non défini';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('fr-FR');
      }
      return new Date(timestamp).toLocaleDateString('fr-FR');
    } catch (error) {
      return 'Date invalide';
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Chargement des données financières...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>💰 Gestion Financière</h2>
          <p style={styles.subtitle}>
            {user?.role === 'admin' ? 'Administration complète' : 'Vos primes et acomptes'}
          </p>
        </div>
        
        <div style={styles.headerActions}>
          {/* Bouton debug (temporaire) */}
          <button 
            style={styles.debugButton}
            onClick={async () => {
              console.log('=== DEBUG ===');
              const allPrimes = await financeService.getPrimes({});
              console.log('Toutes primes:', allPrimes);
              if (user?.role === 'teacher') {
                const teacherId = user?.id || user?.uid;
                console.log('Mon ID:', teacherId);
                const myPrimes = allPrimes.filter(p => p.enseignantId === teacherId);
                console.log('Mes primes:', myPrimes);
              }
            }}
          >
            🔍 Debug
          </button>
          
          <button 
            style={styles.refreshButton}
            onClick={loadData}
            title="Rafraîchir"
          >
            🔄
          </button>
          
          {user?.role === 'admin' ? (
            <>
              <button 
                style={styles.addButton}
                onClick={() => setShowPrimeForm(true)}
              >
                ➕ Nouvelle Prime
              </button>
              <button 
                style={{...styles.addButton, background: '#17a2b8'}}
                onClick={() => setShowAcompteForm(true)}
              >
                ➕ Nouvel Acompte
              </button>
            </>
          ) : user?.role === 'teacher' ? (
            <>
              <button 
                style={styles.addButton}
                onClick={() => setShowPrimeForm(true)}
              >
                ➕ Demander Prime
              </button>
              <button 
                style={{...styles.addButton, background: '#17a2b8'}}
                onClick={() => setShowAcompteForm(true)}
              >
                ➕ Demander Acompte
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💵</div>
            <div style={styles.statNumber}>{parseFloat(stats.montantTotalPrimes || 0).toFixed(2)} TND</div>
            <div style={styles.statLabel}>Primes approuvées</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💸</div>
            <div style={styles.statNumber}>{parseFloat(stats.montantTotalAcomptes || 0).toFixed(2)} TND</div>
            <div style={styles.statLabel}>Acomptes approuvés</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <div style={styles.statNumber}>{parseFloat(stats.solde || 0).toFixed(2)} TND</div>
            <div style={styles.statLabel}>Solde</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'primes' && styles.tabActive)
          }}
          onClick={() => setActiveTab('primes')}
        >
          💵 Primes ({primes.length})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'acomptes' && styles.tabActive)
          }}
          onClick={() => setActiveTab('acomptes')}
        >
          💸 Acomptes ({acomptes.length})
        </button>
      </div>

      {/* Filtres */}
      <div style={styles.filters}>
        <button
          style={{
            ...styles.filterButton,
            ...(filter === 'all' && styles.filterButtonActive)
          }}
          onClick={() => setFilter('all')}
        >
          Tous
        </button>
        <button
          style={{
            ...styles.filterButton,
            ...(filter === 'en_attente' && styles.filterButtonActive)
          }}
          onClick={() => setFilter('en_attente')}
        >
          En attente
        </button>
        <button
          style={{
            ...styles.filterButton,
            ...(filter === 'approuve' && styles.filterButtonActive)
          }}
          onClick={() => setFilter('approuve')}
        >
          Approuvés
        </button>
        <button
          style={{
            ...styles.filterButton,
            ...(filter === 'paye' && styles.filterButtonActive)
          }}
          onClick={() => setFilter('paye')}
        >
          Payés
        </button>
        <button
          style={{
            ...styles.filterButton,
            ...(filter === 'refuse' && styles.filterButtonActive)
          }}
          onClick={() => setFilter('refuse')}
        >
          Refusés
        </button>
      </div>

      {/* Liste Primes */}
      {activeTab === 'primes' ? (
        <div style={styles.list}>
          {primes.length > 0 ? (
            primes.map((prime) => (
              <div key={prime.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h4 style={styles.cardTitle}>{prime.libelle || 'Prime'}</h4>
                    <p style={styles.cardAmount}>{parseFloat(prime.montant || 0).toFixed(2)} TND</p>
                  </div>
                  <div style={{
                    ...styles.statusBadge,
                    background: getStatusColor(prime.statut)
                  }}>
                    {getStatusLabel(prime.statut)}
                  </div>
                </div>
                <div style={styles.cardBody}>
                  <p style={styles.cardDescription}>{prime.description || 'Aucune description'}</p>
                  <div style={styles.cardMeta}>
                    {user?.role === 'admin' && (
                      <span>
                        <strong>Enseignant:</strong> {prime.enseignantNom || ''} {prime.enseignantPrenom || ''}
                      </span>
                    )}
                    <span><strong>Date:</strong> {formatDate(prime.dateCreation)}</span>
                    {prime.motifRefus && prime.statut === 'refuse' && (
                      <span style={{color: '#dc3545'}}>
                        <strong>Motif refus:</strong> {prime.motifRefus}
                      </span>
                    )}
                  </div>
                </div>
                {user?.role === 'admin' && prime.statut === 'en_attente' && (
                  <div style={styles.cardActions}>
                    <button 
                      style={styles.approveButton}
                      onClick={() => handleApprove('prime', prime.id)}
                    >
                      ✅ Approuver
                    </button>
                    <button 
                      style={styles.rejectButton}
                      onClick={() => handleReject('prime', prime.id)}
                    >
                      ❌ Refuser
                    </button>
                  </div>
                )}
                {user?.role === 'admin' && prime.statut === 'approuve' && (
                  <div style={styles.cardActions}>
                    <button 
                      style={styles.paidButton}
                      onClick={() => handleMarkPaid('prime', prime.id)}
                    >
                      💰 Marquer comme payé
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={styles.empty}>
              <p>Aucune prime trouvée</p>
              {user?.role === 'teacher' && (
                <p style={styles.emptySubtext}>
                  Vous n'avez pas encore de primes. Cliquez sur "Demander Prime" pour en créer une.
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Liste Acomptes */
        <div style={styles.list}>
          {acomptes.length > 0 ? (
            acomptes.map((acompte) => (
              <div key={acompte.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h4 style={styles.cardTitle}>Acompte</h4>
                    <p style={styles.cardAmount}>{parseFloat(acompte.montant || 0).toFixed(2)} TND</p>
                  </div>
                  <div style={{
                    ...styles.statusBadge,
                    background: getStatusColor(acompte.statut)
                  }}>
                    {getStatusLabel(acompte.statut)}
                  </div>
                </div>
                <div style={styles.cardBody}>
                  <p style={styles.cardDescription}>{acompte.motif || 'Aucun motif spécifié'}</p>
                  <div style={styles.cardMeta}>
                    {user?.role === 'admin' && (
                      <span>
                        <strong>Enseignant:</strong> {acompte.enseignantNom || ''} {acompte.enseignantPrenom || ''}
                      </span>
                    )}
                    <span><strong>Date:</strong> {formatDate(acompte.dateCreation)}</span>
                    {acompte.motifRefus && acompte.statut === 'refuse' && (
                      <span style={{color: '#dc3545'}}>
                        <strong>Motif refus:</strong> {acompte.motifRefus}
                      </span>
                    )}
                  </div>
                </div>
                {user?.role === 'admin' && acompte.statut === 'en_attente' && (
                  <div style={styles.cardActions}>
                    <button 
                      style={styles.approveButton}
                      onClick={() => handleApprove('acompte', acompte.id)}
                    >
                      ✅ Approuver
                    </button>
                    <button 
                      style={styles.rejectButton}
                      onClick={() => handleReject('acompte', acompte.id)}
                    >
                      ❌ Refuser
                    </button>
                  </div>
                )}
                {user?.role === 'admin' && acompte.statut === 'approuve' && (
                  <div style={styles.cardActions}>
                    <button 
                      style={styles.paidButton}
                      onClick={() => handleMarkPaid('acompte', acompte.id)}
                    >
                      💰 Marquer comme payé
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={styles.empty}>
              <p>Aucun acompte trouvé</p>
              {user?.role === 'teacher' && (
                <p style={styles.emptySubtext}>
                  Vous n'avez pas encore d'acomptes. Cliquez sur "Demander Acompte" pour en créer un.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Formulaires */}
      {showPrimeForm && (
        <PrimeForm 
          onClose={() => setShowPrimeForm(false)}
          onSave={() => {
            setShowPrimeForm(false);
            loadData();
          }}
        />
      )}

      {showAcompteForm && (
        <AcompteForm 
          onClose={() => setShowAcompteForm(false)}
          onSave={() => {
            setShowAcompteForm(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    background: 'white',
    borderRadius: '10px',
    padding: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  title: {
    margin: '0 0 5px 0',
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  subtitle: {
    margin: 0,
    color: '#666',
    fontSize: '14px'
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  addButton: {
    background: '#1a7c4d',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  debugButton: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  refreshButton: {
    background: '#ffc107',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    border: '1px solid #e9ecef'
  },
  statIcon: {
    fontSize: '30px',
    marginBottom: '10px'
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a7c4d',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#666'
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '2px solid #e9ecef'
  },
  tab: {
    padding: '12px 24px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    borderBottom: '3px solid transparent',
    transition: 'all 0.3s ease'
  },
  tabActive: {
    color: '#1a7c4d',
    borderBottomColor: '#1a7c4d',
    fontWeight: 'bold'
  },
  filters: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  filterButton: {
    padding: '8px 16px',
    border: '1px solid #ddd',
    background: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  filterButtonActive: {
    background: '#1a7c4d',
    color: 'white',
    borderColor: '#1a7c4d'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  card: {
    background: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '10px',
    padding: '20px',
    transition: 'box-shadow 0.3s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  cardTitle: {
    margin: '0 0 5px 0',
    color: '#333',
    fontSize: '18px',
    fontWeight: '600'
  },
  cardAmount: {
    margin: 0,
    color: '#1a7c4d',
    fontSize: '20px',
    fontWeight: 'bold'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '500',
    whiteSpace: 'nowrap'
  },
  cardBody: {
    marginBottom: '15px'
  },
  cardDescription: {
    margin: '0 0 10px 0',
    color: '#666',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  cardMeta: {
    display: 'flex',
    gap: '20px',
    fontSize: '12px',
    color: '#888',
    flexWrap: 'wrap'
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
    paddingTop: '15px',
    borderTop: '1px solid #e9ecef',
    flexWrap: 'wrap'
  },
  approveButton: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  },
  rejectButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  },
  paidButton: {
    background: '#17a2b8',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  },
  empty: {
    textAlign: 'center',
    padding: '60px',
    color: '#666',
    background: '#f8f9fa',
    borderRadius: '10px',
    border: '1px dashed #ddd'
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#999',
    marginTop: '10px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px',
    textAlign: 'center'
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #1a7c4d',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  }
};

// Ajouter l'animation CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default FinanceManagement;