// Importar SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Configuración real de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyACoWhZ07nGMcfdTE7sDJAxQA12TQ1QoVk",
  authDomain: "tiendaglobal-289aa.firebaseapp.com",
  projectId: "tiendaglobal-289aa",
  storageBucket: "tiendaglobal-289aa.appspot.com",
  messagingSenderId: "374979205385",
  appId: "1:374979205385:web:294a507fcbd688b5c45bd8"
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);