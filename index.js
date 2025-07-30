// Importa Baileys
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";

// Función principal
async function startBot() {
  // Autenticación
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  // Crear conexión
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true // Muestra el QR en consola
  });

  // Evento de mensaje entrante
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    console.log("Tipo:", type);
    if (type === "notify") {
      const msg = messages[0];
      console.log("Mensaje:", msg);

      if (!msg.key.fromMe && msg.message) {
        const from = msg.key.remoteJid;

        // Si alguien dice "hola"
        if (msg.message.conversation?.toLowerCase() === "hola") {
          await sock.sendMessage(from, { text: "¡Hola! Soy tu bot 🤖" });
        }
      }
    }
  });

  // Guardar credenciales al cambiar
  sock.ev.on("creds.update", saveCreds);

  // Manejar cierre de sesión
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Conexión cerrada. Reintentando:", shouldReconnect);
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === "open") {
      console.log("✅ Bot conectado correctamente");
    }
  });
}

// Iniciar bot
startBot();