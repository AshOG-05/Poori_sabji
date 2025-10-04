// CurrTour.jsx
import React, { useState, useEffect, useContext } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import axios from "axios";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import PlacesList from "./../../Components/Places/Places";
import { Context } from '../../Context/AuthContext';
import "./CurrTour.css";

const CurrTour = () => {
    const [currentPlace, setCurrentPlace] = useState("Fetching location...");
    const [errorMessage, setErrorMessage] = useState("");
    const [totalDistance, setTotalDistance] = useState(0);
    const [previousCoords, setPreviousCoords] = useState(null);
    const [coords, setCoords] = useState({ latitude: null, longitude: null });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const api_key = import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY;
    
    // 🔍 DEBUG: Check if API key is loading
    console.log("=== API KEY DEBUG ===");
    console.log("Full import.meta.env:", import.meta.env);
    console.log("API Key exists:", !!api_key);
    console.log("API Key length:", api_key?.length);
    console.log("API Key first 10 chars:", api_key?.substring(0, 10));
    console.log("===================");
    
    const { user } = useContext(Context);

    // Load Google Maps script
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: api_key,
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setCoords({ latitude, longitude });
                    try {
                        const response = await fetch(
                            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${api_key}`
                        );
                        const data = await response.json();
                        if (data.status === "OK" && data.results.length > 0) {
                            setCurrentPlace(data.results[0].formatted_address);
                        } else {
                            setCurrentPlace("Unable to fetch the place name.");
                        }
                    } catch (error) {
                        setCurrentPlace("Error fetching location details.");
                    }

                    // Calculate distance if previous coords exist
                    if (previousCoords) {
                        // Call your backend to calculate distance
                        try {
                            const distanceResponse = await axios.post('http://localhost:3001/calculate-distance', {
                                origin: previousCoords,
                                destination: { latitude, longitude }
                            });
                            const distance = distanceResponse.data.distance / 1000; // Convert to km
                            setTotalDistance((prevDistance) => prevDistance + distance);
                        } catch (error) {
                            console.error("Error calculating distance:", error);
                        }
                    }
                    setPreviousCoords({ latitude, longitude });
                },
                (error) => {
                    setErrorMessage("Permission denied or unable to access location.");
                }
            );
        } else {
            setErrorMessage("Geolocation is not supported by this browser.");
        }
    };

    const handleViewMapClick = async () => {
        try {
            await axios.post("http://localhost:3001/send-message", {
                messageBody: "happy journey",
            });
        } catch (error) {
            console.error("Error sending location:", error.message);
        }
    };

    useEffect(() => {
        getCurrentLocation();
        const interval = setInterval(getCurrentLocation, 60000);
        return () => clearInterval(interval);
    }, []);

    // Handle loading states
    if (loadError) {
        return <div className="tour-container">
            <div className="content-wrapper">
                <p style={{ color: 'red' }}>Error loading maps. Please check your API key.</p>
            </div>
        </div>;
    }

    if (!isLoaded) {
        return <div className="tour-container">
            <div className="content-wrapper">
                <p>Loading maps...</p>
            </div>
        </div>;
    }

    return (
        <div className="tour-container">
            <button
                className="theme-toggle"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label="Toggle theme"
            >
                {isDarkMode ? (
                    <Sun className="theme-icon" />
                ) : (
                    <Moon className="theme-icon" />
                )}
            </button>

            <div className="content-wrapper">
                <div className="greeting-section">
                    <h1 className="greeting-text">
                        Hello ನಮಸ್ಕಾರ <span className="user-name">{user?.displayName}</span>
                    </h1>
                </div>

                <div className="info-grid">
                    <div className="info-card location-card">
                        <div className="card-content">
                            <h2 className="card-title">Your Current Location</h2>
                            <p className={`location-text ${errorMessage ? 'error' : ''}`}>
                                {errorMessage || currentPlace}
                            </p>
                        </div>
                    </div>

                    <div className="info-card distance-card">
                        <div className="card-content">
                            <h2 className="card-title">Total Distance Traveled</h2>
                            <p className="distance-text">
                                <span className="distance-number">{totalDistance.toFixed(2)}</span>
                                <span className="distance-unit">km</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                {coords.latitude && coords.longitude && (
                    <div style={{ margin: '2rem 0', width: '100%', height: '400px' }}>
                        <GoogleMap
                            mapContainerStyle={{ height: "100%", width: "100%" }}
                            center={{ lat: coords.latitude, lng: coords.longitude }}
                            zoom={15}
                        >
                            <Marker position={{ lat: coords.latitude, lng: coords.longitude }} />
                        </GoogleMap>
                    </div>
                )}

                <div className="action-section">
                    <Link to="/curr-map">
                        <button
                            className="view-map-button"
                            onClick={handleViewMapClick}
                        >
                            View Map
                        </button>
                    </Link>
                </div>

                <div className="places-section">
                    <PlacesList />
                </div>
            </div>
        </div>
    );
};

export default CurrTour;