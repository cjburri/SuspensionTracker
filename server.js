const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 80;

const db = new sqlite3.Database('test.db');

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'build')));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Offender 
        (id integer not null
            constraint Offenders_pk
                primary key autoincrement,
        first_name varchar(32) not null,
        last_name  varchar(32) not null,
        nickname   varchar(32) not null,
        is_active  boolean default 1 not null
    )`);

  db.run(`create table IF NOT EXISTS Incident
(
    id          integer       not null
        constraint incident_pk
            primary key autoincrement,
    offender_id integer       not null
        references Offender,
    offense     varchar(1024) not null,
    timestamp   datetime
);

`);

  db.run("INSERT OR IGNORE INTO Offender(id, first_name, last_name, nickname, is_active) VALUES(1,'Timothy','Welch','Tim',1)")
  db.run("INSERT OR IGNORE INTO Offender(id, first_name, last_name, nickname, is_active) VALUES(2,'Connor','Burri','Butters',1)")
  db.run("INSERT OR IGNORE INTO Offender(id, first_name, last_name, nickname, is_active) VALUES(3,'Nickolas','Eusman','Eusman',1)")
  db.run("INSERT OR IGNORE INTO Offender(id, first_name, last_name, nickname, is_active) VALUES(4,'Robert','Ciotti','Rob',1)")
});

app.get('/log', (req, res) => {
    db.all("SELECT offender.nickname, incident.offense, incident.timestamp FROM incident LEFT JOIN Offender ON incident.offender_id = Offender.id ORDER BY incident.id DESC", [], (err, rows) => {
      if (err) {
        return res.status(500).send(err.message);
      }
  
      let logHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Suspension Log</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .log-entry { margin-bottom: 10px; }
            .timestamp { font-weight: bold; }
            .nickname { color: #007bff; }
          </style>
        </head>
        <body>
          <h1>Incident Log</h1>
          <div id="log-entries">
      `;
  
      rows.forEach(row => {
        logHtml += `
          <div class="log-entry">
            <span class="timestamp">${row.timestamp}</span> |
            <span class="nickname">[${row.nickname}]</span> - ${row.offense}
          </div>
        `;
      });
  
      logHtml += `
          </div>
        </body>
        </html>
      `;
  
      res.send(logHtml);
    });
  });
  
app.get('/offenderList', (req, res) => {
  db.all("SELECT id, nickname FROM Offender WHERE is_active=1", [], (err, rows) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.json(rows);
  });
});

app.post('/submitSuspension', (req, res) => {
    const { offenderId, rationale } = req.body;
  
    // Insert the incident into the database
    const query = `
      INSERT INTO incident (offender_id, offense, timestamp) 
      VALUES (?, ?, datetime('now', '-5 hours'))`;
  
    db.run(query, [offenderId, rationale], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ message: 'Submission received successfully', id: this.lastID });
    });
  });
  

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

process.on('SIGINT', () => {
  db.close();
  process.exit();
});
