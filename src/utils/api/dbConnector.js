
/**
 * Connettore MySQL per un'implementazione backend
 * 
 * IMPORTANTE: Questo file è pensato per essere utilizzato sul server, non nel client.
 * Implementa funzioni per interagire direttamente con il database MySQL.
 */

const mysql = require('mysql2/promise');

// Configurazione del pool di connessioni
const pool = mysql.createPool({
  host: '31.11.39.219',
  user: 'Sql1864200',
  password: 'TUA_PASSWORD_QUI', // Da inserire in modo sicuro in produzione
  database: 'Sql1864200_1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Funzione per testare la connessione al database
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Connessione al database MySQL riuscita!');
    connection.release();
    return true;
  } catch (error) {
    console.error('Errore di connessione al database MySQL:', error);
    return false;
  }
}

/**
 * Funzione per recuperare le prenotazioni
 */
async function getReservations() {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM reservations
      ORDER BY start_date DESC
    `);
    return rows;
  } catch (error) {
    console.error('Errore nel recupero delle prenotazioni:', error);
    throw error;
  }
}

/**
 * Funzione per recuperare una prenotazione specifica
 */
async function getReservationById(id) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM reservations WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error(`Errore nel recupero della prenotazione ${id}:`, error);
    throw error;
  }
}

/**
 * Funzione per salvare una nuova prenotazione
 */
async function createReservation(reservation) {
  try {
    const { id, guestName, adults, children, cribs, hasPets, apartmentIds, startDate, endDate, finalPrice, paymentMethod, paymentStatus, depositAmount, notes, lastUpdated, syncId, deviceId } = reservation;
    
    const [result] = await pool.query(
      `INSERT INTO reservations 
       (id, guest_name, adults, children, cribs, has_pets, apartment_ids, start_date, end_date, final_price, payment_method, payment_status, deposit_amount, notes, last_updated, sync_id, device_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, guestName, adults, children, cribs, hasPets, JSON.stringify(apartmentIds), startDate, endDate, finalPrice, paymentMethod, paymentStatus, depositAmount, notes, lastUpdated, syncId, deviceId]
    );
    
    return { id, insertId: result.insertId };
  } catch (error) {
    console.error('Errore nel salvataggio della prenotazione:', error);
    throw error;
  }
}

/**
 * Funzione per aggiornare una prenotazione esistente
 */
async function updateReservation(id, reservation) {
  try {
    const { guestName, adults, children, cribs, hasPets, apartmentIds, startDate, endDate, finalPrice, paymentMethod, paymentStatus, depositAmount, notes, lastUpdated, syncId, deviceId } = reservation;
    
    const [result] = await pool.query(
      `UPDATE reservations 
       SET guest_name = ?, adults = ?, children = ?, cribs = ?, has_pets = ?, 
           apartment_ids = ?, start_date = ?, end_date = ?, 
           final_price = ?, payment_method = ?, payment_status = ?, 
           deposit_amount = ?, notes = ?, last_updated = ?, sync_id = ?, device_id = ?
       WHERE id = ?`,
      [guestName, adults, children, cribs, hasPets, JSON.stringify(apartmentIds), startDate, endDate, finalPrice, paymentMethod, paymentStatus, depositAmount, notes, lastUpdated, syncId, deviceId, id]
    );
    
    return { id, updated: result.affectedRows > 0 };
  } catch (error) {
    console.error(`Errore nell'aggiornamento della prenotazione ${id}:`, error);
    throw error;
  }
}

/**
 * Funzione per eliminare una prenotazione
 */
async function deleteReservation(id) {
  try {
    const [result] = await pool.query(
      'DELETE FROM reservations WHERE id = ?',
      [id]
    );
    
    return { id, deleted: result.affectedRows > 0 };
  } catch (error) {
    console.error(`Errore nell'eliminazione della prenotazione ${id}:`, error);
    throw error;
  }
}

/**
 * Funzione per recuperare le attività di pulizia
 */
async function getCleaningTasks() {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM cleaning_tasks
      ORDER BY date ASC
    `);
    return rows;
  } catch (error) {
    console.error('Errore nel recupero delle attività di pulizia:', error);
    throw error;
  }
}

/**
 * Funzione per recuperare i dati degli appartamenti
 */
async function getApartments() {
  try {
    const [rows] = await pool.query('SELECT * FROM apartments');
    return rows;
  } catch (error) {
    console.error('Errore nel recupero degli appartamenti:', error);
    throw error;
  }
}

/**
 * Funzione per recuperare i prezzi per anno
 */
async function getPricesByYear(year) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM prices WHERE year = ?',
      [year]
    );
    return rows;
  } catch (error) {
    console.error(`Errore nel recupero dei prezzi per l'anno ${year}:`, error);
    throw error;
  }
}

/**
 * Funzione per sincronizzare i dati
 * Questa è una funzione di esempio che potrebbe implementare
 * una logica più complessa di sincronizzazione dati
 */
async function synchronizeData(dataType) {
  try {
    console.log(`Sincronizzazione dei dati di tipo ${dataType} in corso...`);
    
    // Qui implementeresti la logica di sincronizzazione specifica
    // Ad esempio, confrontando timestamp e risolvendo conflitti
    
    return { success: true, message: `Sincronizzazione dei dati ${dataType} completata` };
  } catch (error) {
    console.error(`Errore nella sincronizzazione dei dati ${dataType}:`, error);
    throw error;
  }
}

module.exports = {
  testConnection,
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  getCleaningTasks,
  getApartments,
  getPricesByYear,
  synchronizeData
};
