/**
 * Server API per interagire con il database MySQL
 * Questo file andrebbe posizionato sul server (ad es. in una cartella server/ o api/)
 */

// Importa il modulo MySQL
const mysql = require('mysql2/promise');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dbConnector = require('../utils/api/dbConnector');

// Creazione dell'app Express
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Consenti richieste da qualsiasi origine in ambiente di sviluppo
  credentials: true
}));
app.use(bodyParser.json());

// Middleware per gestire gli errori
const handleError = (res, error) => {
  console.error('Errore API:', error);
  res.status(500).json({
    success: false,
    error: error.message || 'Si è verificato un errore interno del server'
  });
};

// API per testare la connessione al database
app.get('/api/ping', async (req, res) => {
  try {
    res.json({
      success: true,
      data: { status: "ok", message: "API server is running" }
    });
  } catch (error) {
    handleError(res, error);
  }
});

// API specifica per testare la connessione al database
app.get('/api/ping/database', async (req, res) => {
  try {
    // Utilizziamo direttamente dbConnector per testare la connessione
    const isConnected = await dbConnector.testConnection();
    
    if (isConnected) {
      res.json({
        success: true,
        data: { 
          status: "ok", 
          message: "Database connection successful",
          dbInfo: {
            host: "31.11.39.219",
            database: "Sql1864200_1",
            user: "Sql1864200",
            tables: ["reservations", "cleaning_tasks", "apartments", "prices"]
          }
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Database connection failed"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Database connection failed: ${error.message}`
    });
  }
});

// API per le prenotazioni
app.get('/api/reservations', async (req, res) => {
  try {
    const reservations = await dbConnector.getReservations();
    res.json({
      success: true,
      data: reservations
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
    const cleaningTasks = await dbConnector.getCleaningTasks();
    res.json({
      success: true,
      data: cleaningTasks
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/api/cleaning/:id', async (req, res) => {
  try {
    // Implementazione di getById per le attività di pulizia
    // (per ora restituiamo una risposta fittizia)
    res.json({
      success: true,
      data: { id: req.params.id, message: "API getById not fully implemented" }
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/api/cleaning', async (req, res) => {
  try {
    const task = req.body;
    
    if (!task || !task.id) {
      return res.status(400).json({
        success: false,
        error: 'Dati dell\'attività di pulizia mancanti o incompleti'
      });
    }
    
    const result = await dbConnector.createOrUpdateCleaningTask(task);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.put('/api/cleaning/:id', async (req, res) => {
  try {
    const task = req.body;
    
    if (!task) {
      return res.status(400).json({
        success: false,
        error: 'Dati dell\'attività di pulizia mancanti'
      });
    }
    
    // Assicuriamoci che l'ID nell'URL corrisponda a quello nel corpo
    task.id = req.params.id;
    
    const result = await dbConnector.createOrUpdateCleaningTask(task);
    
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
    const result = await dbConnector.deleteCleaningTask(req.params.id);
    
    if (!result.deleted) {
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

// Endpoint per il salvataggio batch delle attività di pulizia
app.post('/api/cleaning/batch', async (req, res) => {
  try {
    const tasks = req.body;
    
    if (!Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        error: 'Il corpo della richiesta deve essere un array di attività'
      });
    }
    
    const result = await dbConnector.saveCleaningTasksBatch(tasks);
    
    res.status(201).json({
      success: true,
      data: result
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
    const result = await dbConnector.synchronizeAllData();
    
    res.json({
      success: result.success,
      message: result.message,
      data: result.results
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/api/sync/:dataType', async (req, res) => {
  try {
    const dataType = req.params.dataType;
    const result = await dbConnector.synchronizeData(dataType);
    
    res.json({
      success: true,
      message: `Sincronizzazione di ${dataType} completata`,
      data: result
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
