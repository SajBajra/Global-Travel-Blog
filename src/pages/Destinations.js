"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./Destinations.css"

const Destinations = () => {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await axios.get("http://localhost:3001/destinations")
        setDestinations(response.data)
      } catch (error) {
        console.error("Error fetching destinations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDestinations()
  }, [])

  const filteredDestinations = destinations.filter(
    (destination) =>
      destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.country.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="destinations-page">
      <div className="destinations-header">
        <h1>Explore Destinations</h1>
        <p>Discover amazing places around the world</p>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="destinations-grid">
        {filteredDestinations.length > 0 ? (
          filteredDestinations.map((destination) => (
            <div key={destination.id} className="destination-card">
              <div className="destination-image">
                <img src={destination.imageUrl || "/placeholder.svg"} alt={destination.name} />
              </div>
              <div className="destination-content">
                <h2>{destination.name}</h2>
                <p className="destination-location">{destination.country}</p>
                <p className="destination-description">{destination.description}</p>
                <div className="destination-details">
                  <span className="destination-climate">Climate: {destination.climate}</span>
                  <span className="destination-best-time">Best Time: {destination.bestTimeToVisit}</span>
                </div>
                <div className="destination-attractions">
                  <h3>Top Attractions:</h3>
                  <ul>
                    {destination.attractions.map((attraction, index) => (
                      <li key={index}>{attraction}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No destinations found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Destinations

