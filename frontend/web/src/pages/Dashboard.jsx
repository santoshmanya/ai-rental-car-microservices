import { useState, useEffect } from 'react';
import { reservationAPI } from '../services/api';
import { format } from 'date-fns';
import './Dashboard.css';

function Dashboard({ user }) {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReservations();
    }, []);

    const loadReservations = async () => {
        try {
            const response = await reservationAPI.getAll({ userId: user.id });
            setReservations(response.data.reservations || response.data);
        } catch (error) {
            console.error('Failed to load reservations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!confirm('Are you sure you want to cancel this reservation?')) return;

        try {
            await reservationAPI.cancel(id);
            loadReservations();
            alert('Reservation cancelled successfully');
        } catch (error) {
            alert(error.response?.data?.error?.message || 'Failed to cancel reservation');
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
        <div className="dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <h1>My Reservations</h1>
                    <p>Welcome back, {user.firstName}!</p>
                </div>

                {reservations.length === 0 ? (
                    <div className="empty-state card">
                        <h3>No reservations yet</h3>
                        <p>Start exploring our fleet and book your first vehicle!</p>
                        <a href="/search" className="btn btn-primary">Browse Vehicles</a>
                    </div>
                ) : (
                    <div className="reservations-list">
                        {reservations.map((reservation) => (
                            <div key={reservation.id} className="reservation-card card">
                                <div className="reservation-header">
                                    <div>
                                        <h3>{reservation.make} {reservation.model}</h3>
                                        <span className={`status-badge status-${reservation.status}`}>
                                            {reservation.status}
                                        </span>
                                    </div>
                                    <div className="reservation-amount">
                                        ${reservation.total_amount}
                                    </div>
                                </div>

                                <div className="reservation-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Pickup</span>
                                        <span className="detail-value">
                                            {format(new Date(reservation.pickup_date), 'MMM dd, yyyy HH:mm')}
                                        </span>
                                        <span className="detail-location">{reservation.pickup_location_name}</span>
                                    </div>

                                    <div className="detail-item">
                                        <span className="detail-label">Dropoff</span>
                                        <span className="detail-value">
                                            {format(new Date(reservation.dropoff_date), 'MMM dd, yyyy HH:mm')}
                                        </span>
                                        <span className="detail-location">{reservation.dropoff_location_name}</span>
                                    </div>
                                </div>

                                <div className="reservation-actions">
                                    {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                                        <button
                                            onClick={() => handleCancel(reservation.id)}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            Cancel Reservation
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
