const express = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔐 Firebase web config (NO service account)
const firebaseConfig = {
  apiKey: "AIzaSyAXOiYtc0W0zfedwKAJaoWNO2CydqGkOo0",
  authDomain: "gina1-838c7.firebaseapp.com",
  databaseURL: "https://gina1-838c7-default-rtdb.firebaseio.com",
  projectId: "gina1-838c7",
  storageBucket: "gina1-838c7.firebasestorage.app",
  messagingSenderId: "860331012943",
  appId: "1:860331012943:web:a6c8105c96dc5a9e4f0b3a",
  measurementId: "G-NR63G2KPVW"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);


app.get('/api/sessions/stats', async (req, res) => {
    try {
        const sessionsRef = collection(db, 'formularioEntrenamiento');
        const snapshot = await getDocs(sessionsRef);

        const stats = {
            Boxeo: 0,
            Crossfit: 0,
            Spinning: 0,
            Yoga: 0,
            Pesas: 0
        };

        snapshot.forEach(doc => {
            const data = doc.data();
            const tipo = data.entrenamiento;
            if (stats.hasOwnProperty(tipo)) {
                stats[tipo]++;
            }
        });

        res.json(stats);
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});



// ✅ Ruta para obtener el nombre de usuario por UID
app.get('/api/user-qr/:uid', async (req, res) => {
    const { uid } = req.params;

    try {
        const userRef = doc(db, 'usuarios', uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const data = userSnap.data();
        res.json({ data: data.nombre });

    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
});

// ✅ Verifica conexión al iniciar
async function testFirestoreConnection() {
    try {
        // Hacemos un "ping" con una lectura pequeña
        const snapshot = await getDocs(collection(db, 'test')); // test puede ser una colección vacía
        console.log('✅ Conexión a Firestore verificada');
    } catch (error) {
        console.error('❌ Error conectando a Firestore:', error.message);
    }
}

// Inicia servidor y prueba conexión
app.listen(PORT, async () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    await testFirestoreConnection();
});
