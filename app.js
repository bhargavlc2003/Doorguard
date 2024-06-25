const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static('public'));
app.use(express.static('views'));


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Create MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'doorguard'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
      throw err;
  }
  console.log('MySQL connected...');
});


// Route to display welcome page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Route to display form page
app.get('/form', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'form.html'));
});

// Route to get users and render EJS template
app.get('/visitors', (req, res) => {
  let sql = 'SELECT * FROM visitors';
  db.query(sql, (err, results) => {
      if (err) throw err;
      res.render('data', {
          visitors: results
      });
  });
});

app.post('/checkin', (req, res) => {
  const {
    visitorName,
    visitorAddress,
    visitorContact,
    residentName,
    visitTime,
    visitDate,
    purpose
  } = req.body;

  db.query(
    'INSERT INTO visitors (visitorName, visitorAddress, visitorContact, residentName, visitTime, visitDate, purpose) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [visitorName, visitorAddress, visitorContact, residentName, visitTime, visitDate, purpose],
    (err, result) => {
      if (err) {
        console.log('Error inserting into database:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.redirect('/'); // Redirect to the home page after insertion
    }
  );
});
app.post('/truncate', (req, res) => {
  let sql = 'TRUNCATE TABLE visitors';
  db.query(sql, (err, result) => {
      if (err) throw err;
      console.log('Table truncated:', result);
      res.redirect('/visitors');
  });
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
