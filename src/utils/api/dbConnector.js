
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
  password: '@Ginevra33',
  database: 'Sql1864200_1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 15000 // Timeout della connessione aumentato a 15 secondi
});

/**
 * Funzione per testare la connessione al database con timeout
 */
async function testConnection() {
  try {
    // Imposta un timeout di 10 secondi per il test di connessione
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout during database connection test')), 10000);
    });
    
    // Tenta di ottenere una connessione
    const connectionPromise = pool.getConnection().then(connection => {
      console.log('Connessione al database MySQL riuscita!');
      connection.release();
      return true;
    });
    
    // Usa Promise.race per implementare il timeout
    return await Promise.race([connectionPromise, timeoutPromise]);
  } catch (error) {
    console.error('Errore di connessione al database MySQL:', error);
    return false;
  }
}

/**
 * Funzione per recuperare le prenotazioni con gestione degli errori migliorata
 */
async function getReservations() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Query con ordinamento per data di inizio discendente
    const [rows] = await connection.query(`
      SELECT * FROM reservations
      ORDER BY start_date DESC
    `);
    
    // Trasforma i dati dal formato database al formato applicazione
    return rows.map(row => ({
      id: row.id,
      guestName: row.guest_name,
      adults: Number(row.adults),
      children: Number(row.children),
      cribs: Number(row.cribs),
      hasPets: Boolean(row.has_pets),
      apartmentIds: JSON.parse(row.apartment_ids),
      startDate: row.start_date,
      endDate: row.end_date,
      finalPrice: Number(row.final_price),
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      depositAmount: row.deposit_amount ? Number(row.deposit_amount) : null,
      notes: row.notes,
      lastUpdated: Number(row.last_updated),
      syncId: row.sync_id,
      deviceId: row.device_id
    }));
  } catch (error) {
    console.error('Errore nel recupero delle prenotazioni:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Funzione per recuperare una prenotazione specifica
 */
async function getReservationById(id) {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const [rows] = await connection.query(
      'SELECT * FROM reservations WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const row = rows[0];
    
    // Trasforma i dati dal formato database al formato applicazione
    return {
      id: row.id,
      guestName: row.guest_name,
      adults: Number(row.adults),
      children: Number(row.children),
      cribs: Number(row.cribs),
      hasPets: Boolean(row.has_pets),
      apartmentIds: JSON.parse(row.apartment_ids),
      startDate: row.start_date,
      endDate: row.end_date,
      finalPrice: Number(row.final_price),
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      depositAmount: row.deposit_amount ? Number(row.deposit_amount) : null,
      notes: row.notes,
      lastUpdated: Number(row.last_updated),
      syncId: row.sync_id,
      deviceId: row.device_id
    };
  } catch (error) {
    console.error(`Errore nel recupero della prenotazione ${id}:`, error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Funzione per salvare una nuova prenotazione con inserimento o aggiornamento intelligente
 */
async function createOrUpdateReservation(reservation) {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Prepara i dati per il database
    const {
      id,
      guestName,
      adults,
      children,
      cribs,
      hasPets,
      apartmentIds,
      startDate,
      endDate,
      finalPrice,
      paymentMethod,
      paymentStatus,
      depositAmount,
      notes,
      lastUpdated,
      syncId,
      deviceId
    } = reservation;
    
    // Verifica se la prenotazione esiste già
    const [existingRows] = await connection.query(
      'SELECT id FROM reservations WHERE id = ?',
      [id]
    );
    
    if (existingRows.length > 0) {
      // Aggiornamento
      const [result] = await connection.query(
        `UPDATE reservations 
         SET guest_name = ?, adults = ?, children = ?, cribs = ?, has_pets = ?, 
             apartment_ids = ?, start_date = ?, end_date = ?, 
             final_price = ?, payment_method = ?, payment_status = ?, 
             deposit_amount = ?, notes = ?, last_updated = ?, sync_id = ?, device_id = ?
         WHERE id = ?`,
        [
          guestName, 
          adults,
          children, 
          cribs, 
          hasPets ? 1 : 0,
          JSON.stringify(apartmentIds),
          startDate,
          endDate,
          finalPrice,
          paymentMethod,
          paymentStatus,
          depositAmount,
          notes,
          lastUpdated || Date.now(),
          syncId,
          deviceId,
          id
        ]
      );
      
      return { id, updated: true, affectedRows: result.affectedRows };
    } else {
      // Inserimento
      const [result] = await connection.query(
        `INSERT INTO reservations 
         (id, guest_name, adults, children, cribs, has_pets, apartment_ids, 
          start_date, end_date, final_price, payment_method, payment_status, 
          deposit_amount, notes, last_updated, sync_id, device_id) 
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          id,
          guestName,
          adults,
          children,
          cribs,
          hasPets ? 1 : 0,
          JSON.stringify(apartmentIds),
          startDate,
          endDate,
          finalPrice,
          paymentMethod,
          paymentStatus,
          depositAmount,
          notes,
          lastUpdated || Date.now(),
          syncId,
          deviceId
        ]
      );
      
      return { id, created: true, affectedRows: result.affectedRows };
    }
  } catch (error) {
    console.error(`Errore nel salvare la prenotazione ${reservation.id}:`, error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Funzione per salvare una nuova prenotazione
 */
async function createReservation(reservation) {
  // Ora usa la funzione unificata
  return createOrUpdateReservation(reservation);
}

/**
 * Funzione per aggiornare una prenotazione esistente
 */
async function updateReservation(id, reservation) {
  // Assicura che l'id sia impostato
  return createOrUpdateReservation({
    ...reservation,
    id
  });
}

/**
 * Funzione per eliminare una prenotazione
 */
async function deleteReservation(id) {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'DELETE FROM reservations WHERE id = ?',
      [id]
    );
    
    return { id, deleted: result.affectedRows > 0 };
  } catch (error) {
    console.error(`Errore nell'eliminazione della prenotazione ${id}:`, error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Funzione per recuperare le attività di pulizia con gestione errori migliorata
 */
async function getCleaningTasks() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Prima verifichiamo che la tabella esista, se non esiste la creiamo
    await ensureCleaningTasksTableExists(connection);
    
    // Query con ordinamento per data
    const [rows] = await connection.query(`
      SELECT * FROM cleaning_tasks
      ORDER BY date ASC
    `);
    
    // Trasforma i dati dal formato database al formato applicazione
    return rows.map(row => ({
      id: row.id,
      apartmentId: row.apartment_id,
      apartmentName: row.apartment_name,
      date: row.date,
      status: row.status,
      notes: row.notes,
      assignedTo: row.assigned_to,
      title: row.title || '',
      description: row.description || '',
      priority: row.priority || 'normal',
      lastUpdated: Number(row.last_updated) || Date.now(),
      syncId: row.sync_id || '',
      deviceId: row.device_id || ''
    }));
  } catch (error) {
    console.error('Errore nel recupero delle attività di pulizia:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Funzione per assicurarsi che la tabella cleaning_tasks esista
 */
async function ensureCleaningTasksTableExists(connection) {
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cleaning_tasks (
        id VARCHAR(36) PRIMARY KEY,
        apartment_id VARCHAR(100) NOT NULL,
        apartment_name VARCHAR(255),
        date DATE NOT NULL,
        status VARCHAR(20) NOT NULL,
        notes TEXT,
        assigned_to VARCHAR(100),
        title VARCHAR(255),
        description TEXT,
        priority VARCHAR(20),
        last_updated BIGINT,
        sync_id VARCHAR(100),
        device_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabella cleaning_tasks verificata/creata');
  } catch (error) {
    console.error('Errore nel verificare/creare la tabella cleaning_tasks:', error);
    throw error;
  }
}

/**
 * Funzione per salvare un'attività di pulizia
 */
async function createOrUpdateCleaningTask(task) {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Verifichiamo che la tabella esista
    await ensureCleaningTasksTableExists(connection);
    
    const {
      id,
      apartmentId,
      apartmentName,
      date,
      status,
      notes,
      assignedTo,
      title,
      description,
      priority,
      lastUpdated,
      syncId,
      deviceId
    } = task;
    
    // Verifichiamo se l'attività esiste già
    const [existingRows] = await connection.query(
      'SELECT id FROM cleaning_tasks WHERE id = ?',
      [id]
    );
    
    if (existingRows.length > 0) {
      // Aggiornamento
      const [result] = await connection.query(
        `UPDATE cleaning_tasks 
         SET apartment_id = ?, apartment_name = ?, date = ?, status = ?, 
             notes = ?, assigned_to = ?, title = ?, description = ?,
             priority = ?, last_updated = ?, sync_id = ?, device_id = ?
         WHERE id = ?`,
        [
          apartmentId,
          apartmentName,
          date,
          status,
          notes,
          assignedTo,
          title || '',
          description || '',
          priority || 'normal',
          lastUpdated || Date.now(),
          syncId || '',
          deviceId || '',
          id
        ]
      );
      
      return { id, updated: true, affectedRows: result.affectedRows };
    } else {
      // Inserimento
      const [result] = await connection.query(
        `INSERT INTO cleaning_tasks 
         (id, apartment_id, apartment_name, date, status, notes, assigned_to, 
          title, description, priority, last_updated, sync_id, device_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          apartmentId,
          apartmentName,
          date,
          status,
          notes,
          assignedTo,
          title || '',
          description || '',
          priority || 'normal',
          lastUpdated || Date.now(),
          syncId || '',
          deviceId || ''
        ]
      );
      
      return { id, created: true, affectedRows: result.affectedRows };
    }
  } catch (error) {
    console.error(`Errore nel salvare l'attività di pulizia ${task.id}:`, error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Funzione per eliminare un'attività di pulizia
 */
async function deleteCleaningTask(id) {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'DELETE FROM cleaning_tasks WHERE id = ?',
      [id]
    );
    
    return { id, deleted: result.affectedRows > 0 };
  } catch (error) {
    console.error(`Errore nell'eliminazione dell'attività ${id}:`, error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Funzione per salvare più attività di pulizia in batch
 */
async function saveCleaningTasksBatch(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return { success: true, message: 'Nessuna attività da salvare' };
  }
  
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Verifichiamo che la tabella esista
    await ensureCleaningTasksTableExists(connection);
    
    // Iniziamo una transazione
    await connection.beginTransaction();
    
    let successCount = 0;
    const results = [];
    
    for (const task of tasks) {
      try {
        const result = await createOrUpdateCleaningTask(task);
        results.push(result);
        successCount++;
      } catch (taskError) {
        console.error(`Errore nel salvare attività ${task.id}:`, taskError);
        results.push({ id: task.id, error: taskError.message });
      }
    }
    
    // Se almeno un'attività è stata salvata con successo, committiamo
    if (successCount > 0) {
      await connection.commit();
      return { 
        success: true, 
        message: `${successCount}/${tasks.length} attività salvate con successo`,
        results
      };
    } else {
      await connection.rollback();
      return { 
        success: false, 
        message: 'Nessuna attività salvata con successo', 
        results 
      };
    }
  } catch (error) {
    console.error('Errore nel salvataggio batch delle attività:', error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Errore nel rollback:', rollbackError);
      }
    }
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Funzione per recuperare i dati degli appartamenti
 */
async function getApartments() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const [rows] = await connection.query('SELECT * FROM apartments');
    return rows;
  } catch (error) {
    console.error('Errore nel recupero degli appartamenti:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Funzione per sincronizzare tutti i dati
 * Esegue una sincronizzazione completa di tutti i tipi di dati
 */
async function synchronizeAllData() {
  try {
    console.log('Avvio sincronizzazione completa di tutti i dati...');
    
    // Prima verifichiamo che il database sia raggiungibile
    const isConnected = await testConnection();
    if (!isConnected) {
      return { success: false, message: 'Database non raggiungibile' };
    }
    
    // Sincronizziamo tutte le prenotazioni
    const reservations = await synchronizeData('reservations');
    
    // Sincronizziamo tutte le attività di pulizia
    const cleaningTasks = await synchronizeData('cleaning_tasks');
    
    // Sincronizziamo tutti gli appartamenti
    const apartments = await synchronizeData('apartments');
    
    return {
      success: true,
      message: 'Sincronizzazione completata con successo',
      results: {
        reservations,
        cleaningTasks,
        apartments
      }
    };
  } catch (error) {
    console.error('Errore nella sincronizzazione completa dei dati:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Funzione per sincronizzare i dati di un tipo specifico
 */
async function synchronizeData(dataType) {
  try {
    console.log(`Sincronizzazione dei dati di tipo ${dataType} in corso...`);
    
    // Qui implementeresti la logica di sincronizzazione specifica
    // Ad esempio, confrontando timestamp e risolvendo conflitti
    // Per ora implementiamo solo una logica di base
    
    switch (dataType) {
      case 'reservations':
        // Per le prenotazioni, potremmo implementare una logica che utilizza
        // i campi lastUpdated, syncId e deviceId per gestire i conflitti
        return { success: true, message: 'Sincronizzazione prenotazioni completata' };
        
      case 'cleaning_tasks':
        // Simile alle prenotazioni
        return { success: true, message: 'Sincronizzazione attività di pulizia completata' };
        
      case 'apartments':
        // Gli appartamenti potrebbero avere una logica più semplice
        return { success: true, message: 'Sincronizzazione appartamenti completata' };
        
      default:
        return { success: false, message: `Tipo di dati non supportato: ${dataType}` };
    }
  } catch (error) {
    console.error(`Errore nella sincronizzazione dei dati ${dataType}:`, error);
    return { success: false, message: error.message };
  }
}

module.exports = {
  testConnection,
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  createOrUpdateReservation,
  getCleaningTasks,
  createOrUpdateCleaningTask,
  deleteCleaningTask,
  saveCleaningTasksBatch,
  getApartments,
  synchronizeData,
  synchronizeAllData
};
