const { createCanvas, loadImage } = require("canvas");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "models/gemini-2.5-flash";

async function converterImagemParaBase64(imagemUrl) {
  try {
    const response = await fetch(imagemUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString("base64");
  } catch (error) {
    console.error("❌ Erro ao converter imagem para base64:", error.message);
    throw error;
  }
}

async function analisarImagem(imagemUrl) {
  try {
    console.log("💀 Analisando imagem de perfil...");

    const imagemBase64 = await converterImagemParaBase64(imagemUrl);

    const prompt =
      "Analise esta imagem de perfil e determine se contém conteúdo inapropriado, como: nudez, pornografia, violência explícita, conteúdo ofensivo extremo ou algo que não seria adequado exibir em uma thumbnail de YouTube. Responda apenas com 'SIM' se a imagem contiver conteúdo inapropriado ou 'NAO' se a imagem for apropriada.";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: imagemBase64,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const json = await response.json();
    const resultado = json.candidates?.[0]?.content?.parts?.[0]?.text
      ?.trim()
      .toUpperCase();

    return resultado === "SIM";
  } catch (error) {
    console.error("❌ Erro ao analisar imagem:", error.message);
    return true;
  }
}

async function processarImagemPerfil(imagemUrl) {
  try {
    const imagemInapropriada = await analisarImagem(imagemUrl);

    if (imagemInapropriada) {
      console.log(
        "⚠️ Imagem de perfil considerada inapropriada. Usando imagem padrão."
      );
      return "default.png";
    } else {
      console.log("✅ Imagem de perfil aprovada.");
      return imagemUrl;
    }
  } catch (error) {
    console.error("❌ Erro ao processar imagem de perfil:", error.message);
    return "default.png"; // padrao
  }
}

module.exports = { processarImagemPerfil };
