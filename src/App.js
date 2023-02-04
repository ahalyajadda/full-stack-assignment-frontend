import { useEffect, useRef, useState } from 'react';
import osm from './providers.js';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import './index.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import icon from './marker.svg';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import LocationOnIcon from '@mui/icons-material/LocationOn';
const markerIcon = new L.Icon({
  iconUrl: icon,
  iconSize: [25, 25],
  iconAnchor: [10, 30],
  popupAnchor: [0, -46],
});
function App() {
  const [center, setCenter] = useState({ lat: 15.5, lng: 80.049 });
  const ZOOM_LEVEL = 9;
  const mapRef = useRef();
  let [data, setdata] = useState([]);
  let page = 1;
  const limit = 10;

  // fetching data from backend
  const fetchData = async (page, data) => {
    try {
      const response = await axios.get(
        `http://localhost:3030/?page=${page}&limit=${limit}`
      );
      //adding paginatedWeatherResults to the data array.
      const cityinfo = await response.data;
      cityinfo.paginatedresults.map((item) =>
        setdata((data) => [...data, item])
      );
      // fetching next page weather data if available.
      if (cityinfo.next.page < 3) {
        page += 1;
        fetchData(page, data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  //calling fetchData function to get the weatherData of 30 cities.
  useEffect(() => {
    setdata([]);
    fetchData(page, data);
  }, []);

  //calling fetchData function with interval difference to get updated weatherData.

  useEffect(() => {
    let interval;
    interval = setInterval(() => {
      setdata([]);
      fetchData(page, data);
    }, 600000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div>
        <h1>SETTYL ASSIGNMENT</h1>
      </div>
      <div className="map">
        {/* displaying a basic map  */}
        <MapContainer center={center} zoom={ZOOM_LEVEL} ref={mapRef}>
          <TileLayer
            url={osm.maptiler.url}
            attribution={osm.maptiler.attribution}
          />
          {/*Adding markers to the cities that are fetched from the openweatherapi through backend. */}
          {data.map((city, index) => (
            <Marker
              position={[city.lat, city.lng]}
              icon={markerIcon}
              key={index}
            >
              {/* Showing weather details of the cities using popup when user clicked on it  */}
              <Popup>
                <h3 style={{ display: 'flex' }}>
                  City : {city.name}
                  <LocationOnIcon style={{ color: 'blue' }} />
                </h3>
                <h3>Temperature : {city.temperature}°C</h3>
                <h3 style={{ display: 'flex' }}>
                  Weather : {city.weatherDesc}
                  {'  '}
                  <WbSunnyIcon style={{ color: '#fdb813' }} />
                </h3>
                <h3>Humidity : {city.humidity}</h3>
                <h3>Latitude : {city.lat}</h3>
                <h3>Longitude : {city.lng}</h3>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </>
  );
}

export default App;
