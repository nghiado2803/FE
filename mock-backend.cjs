/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express')
const app = express()
const port = 8080
app.use(express.json())

app.get('/api/v1/staff/map-live/:lotId', (req, res) => {
  const lotId = req.params.lotId;
  const spots = [];
  for (let i = 1; i <= 24; i++) {
    const status = i % 7 === 0 ? 'pending' : (i % 3 === 0 ? 'occupied' : 'available');
    spots.push({ id: `${lotId}-${i}`, status, plate: status === 'available' ? '' : `ABC-${1000 + i}`, timeIn: status === 'available' ? '' : new Date().toISOString() });
  }
  res.json({ spots });
});

app.get('/api/v1/staff/search-by-plate/:lotId', (req, res) => {
  const q = req.query.plate || '';
  const results = [];
  for (let i = 1; i <= 6; i++) {
    results.push({ id: `r-${i}`, plate: `ABC-${1000+i}`, status: 'PARKED', customerName: 'Khách hàng', phone: '0123456789', timeIn: new Date().toISOString(), ticketCode: `TKT-${i}` });
  }
  res.json({ results: results.filter(r => r.plate.includes(q)) });
});

app.get('/api/v1/staff/map-live', (req, res) => {
  res.json({ spots: [] });
});

app.listen(port, () => {
  console.log(`Mock backend listening at http://localhost:${port}`);
});
