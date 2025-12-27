const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const CAMINHO_THUMBNAIL = path.join(__dirname, "..", "thumbnail.png");
const VIDEO_ID = process.env.YOUTUBE_VIDEO_ID;

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/oauth2callback";

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

async function garantirAccessToken() {
  const r = await oauth2Client.getAccessToken();
  const token = typeof r === "string" ? r : r?.token;

  if (!token) throw new Error("Não foi possível obter access_token via refresh_token.");

  oauth2Client.setCredentials({
    ...oauth2Client.credentials,
    access_token: token,
  });

  return token;
}

async function setThumbnail() {
  try {
    await garantirAccessToken();

    if (!VIDEO_ID) throw new Error("YOUTUBE_VIDEO_ID não definido no .env");
    if (!fs.existsSync(CAMINHO_THUMBNAIL)) throw new Error("Thumbnail não encontrada.");

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    await youtube.thumbnails.set({
      videoId: VIDEO_ID,
      media: { body: fs.createReadStream(CAMINHO_THUMBNAIL) },
    });

    console.log("🧩 Thumbnail definida com sucesso.");
  } catch (error) {
    console.error("❌ Erro ao definir a thumbnail:", error.message);
    if (error.response?.data) {
      console.error("Resposta da API:", JSON.stringify(error.response.data, null, 2));
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
