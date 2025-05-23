
/**
 * Esempio di connettore MySQL per un'implementazione backend
 * QUESTO È SOLO UN ESEMPIO E NON DEVE ESSERE USATO DIRETTAMENTE NEL FRONTEND
 */

// Esempio di codice per una API Node.js che si connette al database MySQL
/*
const mysql = require('mysql2/promise');

// Configurazione del pool di connessioni
const pool = mysql.createPool({
  host: '31.11.39.219',
  user: 'Sql1864200',
  password: 'YOUR_PASSWORD_HERE', // Da inserire in modo sicuro in produzione
  database: 'Sql1864200_1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Funzione per recuperare le prenotazioni
async function getReservations() {
  try {
    const [rows] = await pool.query('SELECT * FROM reservations');
    return rows;
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }
}

// Funzione per salvare una prenotazione
async function saveReservation(reservation) {
  try {
    const { guestName, adults, children, apartmentIds, startDate, endDate, finalPrice } = reservation;
    
    const [result] = await pool.query(
      `INSERT INTO reservations 
       (guest_name, adults, children, apartment_ids, start_date, end_date, final_price) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [guestName, adults, children, JSON.stringify(apartmentIds), startDate, endDate, finalPrice]
    );
    
    return result.insertId;
  } catch (error) {
    console.error('Error saving reservation:', error);
    throw error;
  }
}

module.exports = {
  getReservations,
  saveReservation
};
*/
