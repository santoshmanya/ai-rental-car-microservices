import { useState, useEffect } from 'react';
import { reportsAPI, vehicleAPI, reservationAPI } from '../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const response = await reportsAPI.getDashboard();
            setDashboard(response.data);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <h1>Admin Dashboard</h1>
                    <p>Manage your rental car business</p>
                </div>

                <div className="stats-grid grid grid-4">
                    <div className="stat-card card">
                        <div className="stat-icon">🚗</div>
                        <div className="stat-value">{dashboard.totalVehicles}</div>
                        <div className="stat-label">Total Vehicles</div>
                    </div>

                    <div className="stat-card card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-value">{dashboard.availableVehicles}</div>
                        <div className="stat-label">Available</div>
                    </div>

                    <div className="stat-card card">
                        <div className="stat-icon">📋</div>
                        <div className="stat-value">{dashboard.activeReservations}</div>
                        <div className="stat-label">Active Reservations</div>
                    </div>

                    <div className="stat-card card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-value">${dashboard.totalRevenue.toLocaleString()}</div>
                        <div className="stat-label">Total Revenue</div>
                    </div>
                </div>

                <div className="admin-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'reservations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reservations')}
                    >
                        Recent Reservations
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div className="overview-section">
                        <div className="card">
                            <h3>Quick Actions</h3>
                            <div className="quick-actions">
                                <a href="/search" className="btn btn-primary">Add New Vehicle</a>
                                <a href="/search" className="btn btn-secondary">View All Vehicles</a>
                                <a href="/search" className="btn btn-secondary">Generate Report</a>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reservations' && dashboard.recentReservations && (
                    <div className="reservations-section">
                        <div className="card">
                            <h3>Recent Reservations</h3>
                            <div className="reservations-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Customer</th>
                                            <th>Vehicle</th>
                                            <th>Pickup Date</th>
                                            <th>Status</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboard.recentReservations.map((reservation) => (
                                            <tr key={reservation.id}>
                                                <td>{reservation.first_name} {reservation.last_name}</td>
                                                <td>{reservation.make} {reservation.model}</td>
                                                <td>{new Date(reservation.pickup_date).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`status-badge status-${reservation.status}`}>
                                                        {reservation.status}
                                                    </span>
                                                </td>
                                                <td>${reservation.total_amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
