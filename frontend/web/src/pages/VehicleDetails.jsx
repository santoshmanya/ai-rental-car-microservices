import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleAPI, reservationAPI } from '../services/api';
import './VehicleDetails.css';

function VehicleDetails({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [bookingData, setBookingData] = useState({
        pickupDate: '',
        dropoffDate: '',
        pickupLocationId: '',
        dropoffLocationId: ''
    });

    useEffect(() => {
        loadVehicle();
    }, [id]);

    const loadVehicle = async () => {
        try {
            const response = await vehicleAPI.getById(id);
            setVehicle(response.data);
            // Set default locations
            setBookingData(prev => ({
                ...prev,
                pickupLocationId: response.data.location_id,
                dropoffLocationId: response.data.location_id
            }));
        } catch (error) {
            console.error('Failed to load vehicle:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();

        if (!user) {
            navigate('/login');
            return;
        }

        setBooking(true);
        try {
            await reservationAPI.create({
                userId: user.id,
                vehicleId: id,
                ...bookingData
            });
            alert('Reservation created successfully!');
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.error?.message || 'Booking failed');
        } finally {
            setBooking(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!vehicle) {
        return <div className="container mt-xl">Vehicle not found</div>;
    }

    return (
        <div className="vehicle-details">
            <div className="container">
                <div className="details-grid">
                    <div className="vehicle-main">
                        <div className="vehicle-image-large">
                            {vehicle.image_url ? (
                                <img src={vehicle.image_url} alt={`${vehicle.make} ${vehicle.model}`} />
                            ) : (
                                <div className="vehicle-placeholder-large">🚗</div>
                            )}
                        </div>

                        <div className="vehicle-info-section card">
                            <h1>{vehicle.make} {vehicle.model}</h1>
                            <p className="vehicle-category">{vehicle.category_name}</p>

                            <div className="specs-grid">
                                <div className="spec">
                                    <span className="spec-label">Year</span>
                                    <span className="spec-value">{vehicle.year}</span>
                                </div>
                                <div className="spec">
                                    <span className="spec-label">Transmission</span>
                                    <span className="spec-value">{vehicle.transmission}</span>
                                </div>
                                <div className="spec">
                                    <span className="spec-label">Fuel Type</span>
                                    <span className="spec-value">{vehicle.fuel_type}</span>
                                </div>
                                <div className="spec">
                                    <span className="spec-label">Color</span>
                                    <span className="spec-value">{vehicle.color}</span>
                                </div>
                                <div className="spec">
                                    <span className="spec-label">Passengers</span>
                                    <span className="spec-value">{vehicle.passenger_capacity}</span>
                                </div>
                                <div className="spec">
                                    <span className="spec-label">Luggage</span>
                                    <span className="spec-value">{vehicle.luggage_capacity}</span>
                                </div>
                            </div>

                            <div className="pricing-info">
                                <div className="price-item">
                                    <span>Daily Rate</span>
                                    <span className="price">${vehicle.daily_rate}</span>
                                </div>
                                {vehicle.weekly_rate && (
                                    <div className="price-item">
                                        <span>Weekly Rate</span>
                                        <span className="price">${vehicle.weekly_rate}</span>
                                    </div>
                                )}
                                <div className="price-item">
                                    <span>Deposit</span>
                                    <span className="price">${vehicle.deposit_amount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="booking-sidebar">
                        <div className="booking-card card">
                            <h3>Book This Vehicle</h3>

                            {vehicle.status !== 'available' ? (
                                <div className="unavailable-message">
                                    This vehicle is currently {vehicle.status}
                                </div>
                            ) : (
                                <form onSubmit={handleBooking} className="booking-form">
                                    <div className="form-group">
                                        <label>Pickup Date</label>
                                        <input
                                            type="datetime-local"
                                            className="input"
                                            value={bookingData.pickupDate}
                                            onChange={(e) => setBookingData({ ...bookingData, pickupDate: e.target.value })}
                                            required
                                            min={new Date().toISOString().slice(0, 16)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Dropoff Date</label>
                                        <input
                                            type="datetime-local"
                                            className="input"
                                            value={bookingData.dropoffDate}
                                            onChange={(e) => setBookingData({ ...bookingData, dropoffDate: e.target.value })}
                                            required
                                            min={bookingData.pickupDate}
                                        />
                                    </div>

                                    <div className="booking-summary">
                                        <p className="summary-label">Location</p>
                                        <p className="summary-value">{vehicle.location_name}</p>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        style={{ width: '100%' }}
                                        disabled={booking}
                                    >
                                        {booking ? 'Processing...' : 'Reserve Now'}
                                    </button>

                                    {!user && (
                                        <p className="login-prompt">
                                            Please <a href="/login">login</a> to make a reservation
                                        </p>
                                    )}
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VehicleDetails;
