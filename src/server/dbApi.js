
/**
 * Server API per interagire con il database MySQL
 * Questo file andrebbe posizionato sul server (ad es. in una cartella server/ o api/)
 */

// Importa il modulo MySQL
const mysql = require('mysql2/promise');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Creazione dell'app Express
const app = express();

// Middleware
app.use(cors({
  origin: 'http://tuo-dominio.it', // Sostituisci con il tuo dominio
  credentials: true
}));
app.use(bodyParser.json());

// Configurazione della connessione al database
const dbConfig = {
  host: '31.11.39.219',
  user: 'Sql1864200',
  password: 'q%yF%xK!T5HgzZr', // Password inserita
  database: 'Sql1864200_1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Crea pool di connessioni
const pool = mysql.createPool(dbConfig);

// Test di connessione al database
pool.getConnection()
  .then(connection => {
    console.log('Connessione al database MySQL stabilita con successo!');
    connection.release();
  })
  .catch(error => {
    console.error('Errore di connessione al database MySQL:', error);
  });

// Middleware per gestire gli errori
const handleError = (res, error) => {
  console.error('Errore API:', error);
  res.status(500).json({
    success: false,
    error: error.message || 'Si è verificato un errore interno del server'
  });
};

// API per le prenotazioni
app.get('/api/reservations', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reservations');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/api/reservations/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reservations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Prenotazione non trovata'
      });
    }
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const { guestName, adults, children, cribs, hasPets, apartmentIds, startDate, endDate, finalPrice, paymentMethod, paymentStatus, depositAmount, notes } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO reservations 
       (id, guest_name, adults, children, cribs, has_pets, apartment_ids, start_date, end_date, final_price, payment_method, payment_status, deposit_amount, notes, last_updated, sync_id, device_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.body.id, guestName, adults, children, cribs, hasPets, JSON.stringify(apartmentIds), startDate, endDate, finalPrice, paymentMethod, paymentStatus, depositAmount, notes, Date.now(), req.body.syncId, req.body.deviceId]
    );
    
    res.status(201).json({
      success: true,
      data: { id: req.body.id, insertId: result.insertId }
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.put('/api/reservations/:id', async (req, res) => {
  try {
    const { guestName, adults, children, cribs, hasPets, apartmentIds, startDate, endDate, finalPrice, paymentMethod, paymentStatus, depositAmount, notes } = req.body;
    
    const [result] = await pool.query(
      `UPDATE reservations 
       SET guest_name = ?, adults = ?, children = ?, cribs = ?, has_pets = ?, 
           apartment_ids = ?, start_date = ?, end_date = ?, 
           final_price = ?, payment_method = ?, payment_status = ?, 
           deposit_amount = ?, notes = ?, last_updated = ?, sync_id = ?, device_id = ?
       WHERE id = ?`,
      [guestName, adults, children, cribs, hasPets, JSON.stringify(apartmentIds), startDate, endDate, finalPrice, paymentMethod, paymentStatus, depositAmount, notes, Date.now(), req.body.syncId, req.body.deviceId, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Prenotazione non trovata'
      });
    }
    
    res.json({
      success: true,
      data: { id: req.params.id, updated: true }
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM reservations WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Prenotazione non trovata'
      });
    }
    
    res.json({
      success: true,
      data: { id: req.params.id, deleted: true }
    });
  } catch (error) {
    handleError(res, error);
  }
});

// API per le attività di pulizia
app.get('/api/cleaning', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cleaning_tasks');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/api/cleaning/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cleaning_tasks WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Attività di pulizia non trovata'
      });
    }
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/api/cleaning', async (req, res) => {
  try {
    const { title, description, date, status, apartmentId, apartmentName, assignedTo, priority } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO cleaning_tasks 
       (id, title, description, date, status, apartment_id, apartment_name, assigned_to, priority, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.body.id, title, description, date, status, apartmentId, apartmentName, assignedTo, priority, Date.now(), Date.now()]
    );
    
    res.status(201).json({
      success: true,
      data: { id: req.body.id, insertId: result.insertId }
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.put('/api/cleaning/:id', async (req, res) => {
  try {
    const { title, description, date, status, apartmentId, apartmentName, assignedTo, priority } = req.body;
    
    const [result] = await pool.query(
      `UPDATE cleaning_tasks 
       SET title = ?, description = ?, date = ?, status = ?, 
           apartment_id = ?, apartment_name = ?, assigned_to = ?, 
           priority = ?, updated_at = ?
       WHERE id = ?`,
      [title, description, date, status, apartmentId, apartmentName, assignedTo, priority, Date.now(), req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Attività di pulizia non trovata'
      });
    }
    
    res.json({
      success: true,
      data: { id: req.params.id, updated: true }
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.delete('/api/cleaning/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM cleaning_tasks WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Attività di pulizia non trovata'
      });
    }
    
    res.json({
      success: true,
      data: { id: req.params.id, deleted: true }
    });
  } catch (error) {
    handleError(res, error);
  }
});

// API per gli appartamenti
app.get('/api/apartments', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM apartments');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    handleError(res, error);
  }
});

// API per i prezzi
app.get('/api/prices/:year', async (req, res) => {
  try {
    const year = req.params.year;
    const [rows] = await pool.query('SELECT * FROM prices WHERE year = ?', [year]);
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    handleError(res, error);
  }
});

// API per la sincronizzazione
app.post('/api/sync', async (req, res) => {
  try {
    // Qui implementeresti la logica per sincronizzare tutti i dati
    
    res.json({
      success: true,
      message: 'Sincronizzazione completata'
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/api/sync/:dataType', async (req, res) => {
  try {
    const dataType = req.params.dataType;
    // Qui implementeresti la logica per sincronizzare un tipo specifico di dati
    
    res.json({
      success: true,
      message: `Sincronizzazione di ${dataType} completata`
    });
  } catch (error) {
    handleError(res, error);
  }
});

// Avvio del server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server API attivo sulla porta ${PORT}`);
});

module.exports = app;
