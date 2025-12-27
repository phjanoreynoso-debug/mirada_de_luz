import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Setup (SQLite)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

// --- Models ---

// 1. Consultant (Perfil del Consultante)
const Consultant = sequelize.define('Consultant', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING
  },
  birthDate: {
    type: DataTypes.DATEONLY
  },
  notes: {
    type: DataTypes.TEXT // Notas generales permanentes
  },
  clientReport: {
    type: DataTypes.TEXT // Resultado/Informe generado sobre el cliente
  }
});

// 2. Daily Energy (Personal del practicante)
const DailyEnergy = sequelize.define('DailyEnergy', {
  energyLevel: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mood: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  }
});

// 3. Consultant Energy (Sesiones de energía específicas)
const ConsultantEnergy = sequelize.define('ConsultantEnergy', {
  energyBefore: {
    type: DataTypes.STRING
  },
  energyAfter: {
    type: DataTypes.STRING
  },
  notes: {
    type: DataTypes.TEXT // Notas de la sesión
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// 4. Spread (Tiradas)
const Spread = sequelize.define('Spread', {
  question: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cards: {
    type: DataTypes.STRING
  },
  interpretation: {
    type: DataTypes.TEXT
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// 5. Ritual (Rituales)
const Ritual = sequelize.define('Ritual', {
  intention: {
    type: DataTypes.STRING,
    allowNull: false
  },
  result: {
    type: DataTypes.TEXT
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  }
});

// 6. Appointment (Agenda/Citas)
const Appointment = sequelize.define('Appointment', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING, // 'scheduled', 'completed', 'cancelled'
    defaultValue: 'scheduled'
  },
  notes: {
    type: DataTypes.TEXT
  }
});

// 7. Transaction (Finanzas)
const Transaction = sequelize.define('Transaction', {
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING, // 'income', 'expense'
    allowNull: false
  },
  category: {
    type: DataTypes.STRING // 'consultation', 'ritual', 'product', 'other'
  },
  description: {
    type: DataTypes.STRING
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  }
});

// --- Relationships ---
// Un consultante tiene muchas sesiones de energía
Consultant.hasMany(ConsultantEnergy);
ConsultantEnergy.belongsTo(Consultant);

// Un consultante puede tener muchas tiradas asociadas
Consultant.hasMany(Spread);
Spread.belongsTo(Consultant);

// Un consultante puede tener muchos rituales asociados (opcional)
Consultant.hasMany(Ritual);
Ritual.belongsTo(Consultant);

// Un consultante puede tener muchas citas
Consultant.hasMany(Appointment);
Appointment.belongsTo(Consultant);

// Un consultante puede tener muchas transacciones asociadas (ingresos)
Consultant.hasMany(Transaction);
Transaction.belongsTo(Consultant);


// Sync Database
// Force: true para recrear tablas (¡CUIDADO EN PROD! Aquí está bien para dev inicial)
// O usamos alter: true para intentar modificar sin borrar
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced successfully with relationships');
});

// --- Routes ---

// === Consultants ===
app.get('/api/consultants', async (req, res) => {
  try {
    const consultants = await Consultant.findAll({ order: [['name', 'ASC']] });
    res.json(consultants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/consultants', async (req, res) => {
  try {
    const consultant = await Consultant.create(req.body);
    res.json(consultant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/consultants/:id', async (req, res) => {
  try {
    const consultant = await Consultant.findByPk(req.params.id);
    if (!consultant) return res.status(404).json({ error: 'Consultant not found' });
    await consultant.update(req.body);
    res.json(consultant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/consultants/:id', async (req, res) => {
  try {
    const consultant = await Consultant.findByPk(req.params.id);
    if (!consultant) return res.status(404).json({ error: 'Consultant not found' });
    await consultant.destroy();
    res.json({ message: 'Consultant deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/consultants/:id', async (req, res) => {
  try {
    const consultant = await Consultant.findByPk(req.params.id, {
      include: [
        { model: ConsultantEnergy, order: [['createdAt', 'DESC']] },
        { model: Spread, order: [['createdAt', 'DESC']] },
        { model: Ritual, order: [['createdAt', 'DESC']] }
      ]
    });
    if (!consultant) return res.status(404).json({ error: 'Consultant not found' });
    res.json(consultant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === Daily Energy ===
app.post('/api/energy', async (req, res) => {
  try {
    const entry = await DailyEnergy.create(req.body);
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/energy/:id', async (req, res) => {
  try {
    const entry = await DailyEnergy.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    await entry.update(req.body);
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/energy/:id', async (req, res) => {
  try {
    const entry = await DailyEnergy.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    await entry.destroy();
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/energy', async (req, res) => {
  try {
    const entries = await DailyEnergy.findAll({ order: [['createdAt', 'DESC']] });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === Consultant Energy (Linked) ===
app.post('/api/consultant-energy', async (req, res) => {
  try {
    // req.body should include ConsultantId
    const entry = await ConsultantEnergy.create(req.body);
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/consultant-energy/:id', async (req, res) => {
  try {
    const entry = await ConsultantEnergy.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    await entry.update(req.body);
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/consultant-energy/:id', async (req, res) => {
  try {
    const entry = await ConsultantEnergy.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    await entry.destroy();
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ALL sessions (flat list) or filter by consultant via query
app.get('/api/consultant-energy', async (req, res) => {
  try {
    const entries = await ConsultantEnergy.findAll({ 
      include: Consultant,
      order: [['createdAt', 'DESC']] 
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === Spreads ===
app.post('/api/spreads', async (req, res) => {
  try {
    const entry = await Spread.create(req.body);
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/spreads/:id', async (req, res) => {
  try {
    const entry = await Spread.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    await entry.update(req.body);
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/spreads/:id', async (req, res) => {
  try {
    const entry = await Spread.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    await entry.destroy();
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/spreads', async (req, res) => {
  try {
    const entries = await Spread.findAll({ 
      include: Consultant, // Include client info if linked
      order: [['createdAt', 'DESC']] 
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === Rituals ===
app.post('/api/rituals', async (req, res) => {
  try {
    const entry = await Ritual.create(req.body);
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/rituals/:id', async (req, res) => {
  try {
    const entry = await Ritual.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    await entry.update(req.body);
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/rituals/:id', async (req, res) => {
  try {
    const entry = await Ritual.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    await entry.destroy();
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/rituals', async (req, res) => {
  try {
    const entries = await Ritual.findAll({ 
      include: Consultant,
      order: [['createdAt', 'DESC']] 
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === Appointments (Agenda) ===
app.get('/api/appointments', async (req, res) => {
  try {
    const entries = await Appointment.findAll({ 
      include: Consultant,
      order: [['date', 'ASC']] 
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const entry = await Appointment.create(req.body);
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/appointments/:id', async (req, res) => {
  try {
    const entry = await Appointment.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    await entry.update(req.body);
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const entry = await Appointment.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    await entry.destroy();
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === Transactions (Finanzas) ===
app.get('/api/transactions', async (req, res) => {
  try {
    const entries = await Transaction.findAll({ 
      include: Consultant,
      order: [['date', 'DESC']] 
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const entry = await Transaction.create(req.body);
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const entry = await Transaction.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    await entry.update(req.body);
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const entry = await Transaction.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    await entry.destroy();
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Servir archivos estáticos del frontend (Producción/Integrado)
app.use(express.static(path.join(__dirname, '../bitacora/dist')));

// Cualquier otra ruta que no sea API, devolver el index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../bitacora/dist/index.html'));
});

// Server running
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
