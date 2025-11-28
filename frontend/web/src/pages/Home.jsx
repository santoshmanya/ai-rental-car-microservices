import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
    return (
        <div className="home">
            <section className="hero">
                <div className="container">
                    <div className="hero-content fade-in">
                        <h1 className="hero-title">
                            Your Journey Starts <span className="text-gradient">Here</span>
                        </h1>
                        <p className="hero-subtitle">
                            Premium car rentals at your fingertips. Choose from our extensive fleet of vehicles
                            and hit the road with confidence.
                        </p>
                        <div className="hero-actions">
                            <Link to="/search" className="btn btn-primary btn-lg">
                                Browse Vehicles
                            </Link>
                            <Link to="/register" className="btn btn-secondary btn-lg">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="features">
                <div className="container">
                    <h2 className="section-title text-center">Why Choose Us</h2>
                    <div className="grid grid-3">
                        <div className="feature-card card">
                            <div className="feature-icon">🚀</div>
                            <h3>Instant Booking</h3>
                            <p>Book your perfect vehicle in seconds with our streamlined reservation system.</p>
                        </div>
                        <div className="feature-card card">
                            <div className="feature-icon">💎</div>
                            <h3>Premium Fleet</h3>
                            <p>Access a wide range of well-maintained vehicles from economy to luxury.</p>
                        </div>
                        <div className="feature-card card">
                            <div className="feature-icon">🔒</div>
                            <h3>Secure Payments</h3>
                            <p>Your transactions are protected with industry-leading security standards.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta">
                <div className="container">
                    <div className="cta-content card">
                        <h2>Ready to Hit the Road?</h2>
                        <p>Join thousands of satisfied customers who trust us for their car rental needs.</p>
                        <Link to="/search" className="btn btn-primary btn-lg">
                            Start Your Journey
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
