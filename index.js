//---------------------------------------------------
// 1) IMPORT DEPENDENCIES
//---------------------------------------------------
const express = require('express');
const fetch = require('node-fetch');

//---------------------------------------------------
// 2) CONFIGURATION CONSTANTS
//---------------------------------------------------
// Replace these with your actual start and end addresses
const ORIGIN = '221 Corley Mill Rd, Lexington, SC';
const DESTINATION = '1515 Main St, Columbia, SC';

// Replace with your real API key from Google Cloud
const API_KEY = 'AIzaSyDSjcIsQxjIkd9ReFTxiCcS7_JHhSMQmXY';

//---------------------------------------------------
// 3) CREATE THE EXPRESS APP
//---------------------------------------------------
const app = express();

//---------------------------------------------------
// 4) DEFINE THE MAIN ROUTE HANDLER
//---------------------------------------------------
app.get('/', async (req, res) => {
  try {
    // Construct the Distance Matrix API URL
    const baseUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    const url = `${baseUrl}?units=imperial&origins=${encodeURIComponent(ORIGIN)}&destinations=${encodeURIComponent(DESTINATION)}&departure_time=now&key=${API_KEY}`;
    
    // Fetch data from Google
    const response = await fetch(url);
    const data = await response.json();

    // Check top-level status
    if (data.status !== 'OK') {
      return res.send(`<h1>Error from Google API: ${data.status}</h1>`);
    }

    // Extract the first row/element
    const element = data.rows[0].elements[0];
    if (element.status !== 'OK') {
      return res.send(`<h1>Route error: ${element.status}</h1>`);
    }

    // Use duration_in_traffic if available, else normal duration
    const durationText = element.duration_in_traffic
      ? element.duration_in_traffic.text
      : element.duration.text;

    const distanceText = element.distance.text;

    // Build basic HTML
    const html = `
      <html>
      <head>
        <meta http-equiv="refresh" content="300">
        <style>
          body { font-family: sans-serif; text-align: center; margin-top: 50px; }
          h1 { font-size: 2em; margin-bottom: 0.5em; }
          p { font-size: 1.2em; margin-top: 0.3em; }
        </style>
      </head>
      <body>
        <h1>ETA: ${durationText}</h1>
        <p>Distance: ${distanceText}</p>
        <p>From: ${ORIGIN}<br>To: ${DESTINATION}</p>
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.send(`<h1>Server Error: ${err.message}</h1>`);
  }
});

//---------------------------------------------------
// 5) START THE SERVER
//---------------------------------------------------
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Traffic ETA app listening on port ${port}`);
});
