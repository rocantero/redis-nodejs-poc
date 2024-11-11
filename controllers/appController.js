const redis = require('redis');
const cron = require('node-cron');


const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

exports.getIndexPage = (req, res) => {
  res.json({ status: 200, message: '/locations/:idLocation -> /locations/USA' });
};


const API_URL = "https://api.tomorrow.io/v4/weather/realtime";
const FETCH_INTERVAL = '*/5 * * * *';
const API_KEY = "wV3NipHcDxhxQlUdNeyo5ahinRWe3hot";
// Tomorrow.io es muy flexible con el input de Location pero uso coordenadas por tranquilidad
const LOCATIONS = [
  {"id": "CL", "name": "Santiago (CL)", "lat": -33.437774658203125, "lon": -70.65045166015625 },
  {"id": "CH", "name": "Zúrich (CH)", "lat": 47.41330337524414, "lon":  8.656394004821777 },
  {"id": "NZ", "name": "Auckland (NZ)", "lat": -36.541282653808594, "lon":  174.5506134033203 },
  {"id": "AU", "name": "Sídney (AU)", "lat": -33.869842529296875, "lon":  151.20828247070312 },
  {"id": "UK", "name": "Londres (UK)", "lat": 51.51561737060547, "lon": -0.09199830144643784 },
  {"id": "USA", "name": "Georgia (USA)", "lat": 32.32938003540039, "lon": -83.11373901367188 }
];

/*
Function to fetch single location weather data and save to redis
*/
const fetchData = async () => {
  const payloads = LOCATIONS.map(location => 
    ({ locationId: location.id, url:`${API_URL}?apikey=${API_KEY}&location=${location.lat},${location.lon}`}));

  // Async para agilizar
  Promise.all(payloads.map(payload => fetchDataSingle(payload))).then((results) => {
    console.log('Weather data fetched and saved successfully.');
  }).catch(err => {
    console.error('Error fetching weather data', err);
  }); 
}
/*
Function to fetch and save weather data to redis for a single location
*/
const fetchDataSingle = async ({ locationId, url }) => {
  try {
    const canFetch = Math.random() > 0.2;
    if (!canFetch) {
      console.error('The API Request Failed');
      throw new Error('The API Request Failed');
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();

    client.hmset(locationId, [
      'data', JSON.stringify(data.data),
      'location', JSON.stringify(data.location)
    ], (err, result) => { 
      if (err) {
        console.log(`Error saving weather data for ${locationId}`, err);
      } else {
        console.log(`Weather data saved for ${locationId}`);
        return result;
      }
    });
  } catch (err) {
    console.log(`Error fetching weather data for ${locationId}`);
  }
}

// Cron job para fetchear data cada 5 minutos
cron.schedule(FETCH_INTERVAL, fetchData);
cron.schedule("* * * * *", () => {
  console.log("cron engine is running");
});

/*
Route to test fetchData function
*/
exports.testCron = async (req, res) => {
  await fetchData();
  res.json({ status: 200, message: 'Cron job executed' });
}

/*
Function to get Cached Weather Data
*/
exports.getCachedWeatherData = (req, res) => {
  const id = req.params.locationId;
  client.hgetall(id, (err, data) => {
    if (err) {
      return res.json({ status: 400, message: 'Could not fetch weather data', err });
    }
    return res.json({ status: 200, data });
  });
};