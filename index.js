require("dotenv").config();
const express = require("express");
const app = express();

const { obterUltimoComentario } = require("./src/obterComentario");
const { processarComentario } = require("./src/processarComentario");
const { setThumbnail } = require("./src/setarThumb");

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("server on");
});

app.listen(PORT, () => {});

async function pegarComentario() {
  try {
    console.log("🔍 Buscando o último comentário...");
    const comentario = await obterUltimoComentario();
    if (comentario) {
      console.log("💭 Comentário encontrado:", comentario.textoComentario);
      return comentario;
    } else {
      console.log("❌ Nenhum comentário encontrado.");
      return null;
    }
  } catch (error) {
    console.error("❌ Erro ao pegar o comentário:", error.message);
    throw error;
  }
}

async function moderarComentario(comentario) {
  try {
    console.log("🔍 Moderando comentário e verificando imagem de perfil...");
    const comentarioProcessado = await processarComentario(comentario);
    return comentarioProcessado;
  } catch (error) {
    console.error("❌ Erro ao moderar o comentário:", error.message);
    throw error;
  }
}

async function gerarThumbnail(comentarioModerado) {
  try {
    await setThumbnail(comentarioModerado);

    const { atualizarReadme } = require("./commit.js");
    await atualizarReadme();
  } catch (error) {
    console.error("❌ Erro ao definir a thumbnail:", error.message);
    throw error;
  }
}

async function main() {
  try {
    const comentario = await pegarComentario();

    if (comentario) {
      const comentarioModerado = await moderarComentario(comentario);
      await gerarThumbnail(comentarioModerado);
    }
  } catch (error) {
    console.error("❌ Erro no fluxo principal:", error.message);
  }
}

function iniciarTimerExecucao() {
  const INTERVALO_MINUTOS = 15; // 14 deu erro yt fdp
  const INTERVALO_MS = INTERVALO_MINUTOS * 60 * 1000;

  main();

  setInterval(() => {
    console.log(`\n[${new Date().toLocaleString()}] Executando novamente...`);
    main();
  }, INTERVALO_MS);
}
iniciarTimerExecucao();
