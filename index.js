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

app.listen(PORT, () => {
  console.log(`Servidor escutando na porta ${PORT}`);
});

async function pegarComentario() {
  try {
    console.log("🤓 Buscando o último comentário...");
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
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Erro no fluxo principal:", error.message);
    process.exit(1);
  }
}

main();
