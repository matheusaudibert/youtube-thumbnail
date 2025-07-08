const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const OAuth2 = google.auth.OAuth2;

const CAMINHO_THUMBNAIL = path.join(__dirname, "..", "thumbnail.png");
const VIDEO_ID = process.env.YOUTUBE_VIDEO_ID;

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/oauth2callback";

const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Configurar as credenciais
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

async function verificarEAtualizarToken() {
  try {
    const tokenInfo = oauth2Client.credentials;

    if (!tokenInfo.access_token || tokenInfo.expiry_date <= Date.now()) {
      console.log("🔄 Token expirado ou ausente. Renovando...");
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
      console.log("✅ Token renovado com sucesso!");
    }
  } catch (error) {
    console.error("❌ Erro ao renovar o token:", error.message);
    throw error;
  }
}

async function setThumbnail(comentarioModerado) {
  try {
    await verificarEAtualizarToken();

    if (!fs.existsSync(CAMINHO_THUMBNAIL)) {
      throw new Error(`Thumbnail não encontrada.`);
    }

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    const response = await youtube.thumbnails.set({
      videoId: VIDEO_ID,
      media: {
        body: fs.createReadStream(CAMINHO_THUMBNAIL),
      },
    });
    console.log("🧩 Thumbnail definida com sucesso.");
  } catch (error) {
    console.error("❌ Erro ao definir a thumbnail:", error.message);
    if (error.response?.data) {
      console.error(
        "Resposta da API:",
        JSON.stringify(error.response.data, null, 2)
      );
    }
    throw error;
  }
}

if (require.main === module) {
  setThumbnail().catch((err) => {
    console.error("Erro no módulo setarThumb:", err);
    process.exit(1);
  });
}

module.exports = { setThumbnail };
