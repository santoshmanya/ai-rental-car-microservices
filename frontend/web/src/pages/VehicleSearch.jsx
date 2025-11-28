import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vehicleAPI, categoryAPI } from '../services/api';
import './VehicleSearch.css';

function VehicleSearch() {
    const [vehicles, setVehicles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        categoryId: '',
        available: 'true'
    });

    useEffect(() => {
        loadCategories();
        loadVehicles();
    }, [filters]);

    const loadCategories = async () => {
        try {
            const response = await categoryAPI.getAll();
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadVehicles = async () => {
        setLoading(true);
        try {
            const response = await vehicleAPI.getAll(filters);
            setVehicles(response.data.vehicles || response.data);
        } catch (error) {
            console.error('Failed to load vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="vehicle-search">
            <div className="container">
                <div className="search-header">
                    <h1>Find Your Perfect Ride</h1>
                    <p>Choose from our extensive fleet of premium vehicles</p>
                </div>

                <div className="search-filters card">
                    <select
                        className="input"
                        value={filters.categoryId}
                        onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name} - ${cat.daily_rate}/day
                            </option>
                        ))}
                    </select>

                    <select
                        className="input"
                        value={filters.available}
                        onChange={(e) => setFilters({ ...filters, available: e.target.value })}
                    >
                        <option value="true">Available Only</option>
                        <option value="">All Vehicles</option>
                    </select>
                </div>

                {loading ? (
                    <div className="flex justify-center mt-xl">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div className="vehicle-grid grid grid-3">
                        {vehicles.map((vehicle) => (
                            <Link to={`/vehicles/${vehicle.id}`} key={vehicle.id} className="vehicle-card card">
                                <div className="vehicle-image">
                                    {vehicle.image_url ? (
                                        <img src={vehicle.image_url} alt={`${vehicle.make} ${vehicle.model}`} />
                                    ) : (
                                        <div className="vehicle-placeholder">🚗</div>
                                    )}
                                    <div className={`vehicle-status status-${vehicle.status}`}>
                                        {vehicle.status}
                                    </div>
                                </div>
                                <div className="vehicle-info">
                                    <h3>{vehicle.make} {vehicle.model}</h3>
                                    <p className="vehicle-year">{vehicle.year}</p>
                                    <div className="vehicle-details">
                                        <span>⚙️ {vehicle.transmission}</span>
                                        <span>⛽ {vehicle.fuel_type}</span>
                                    </div>
                                    <div className="vehicle-price">
                                        <span className="price">${vehicle.daily_rate}</span>
                                        <span className="period">/day</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && vehicles.length === 0 && (
                    <div className="no-results">
                        <p>No vehicles found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VehicleSearch;
