require("dotenv").config();
const axios = require("axios");

function decodificarEntidadesHTML(texto) {
  const entidades = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
  };

  return texto
    .replace(/&[#\w]+;/g, (entidade) => {
      if (entidade.startsWith("&#")) {
        const codigo = entidade.match(/&#(\d+);/)[1];
        return String.fromCodePoint(parseInt(codigo));
      }
      return entidades[entidade] || entidade;
    })
    .replace(/\\u[\dA-F]{4}/gi, (match) =>
      String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16))
    );
}

function removerTagsHTML(texto) {
  return texto.replace(/<(?!br\s*\/?>)[^>]+>/g, "");
}

async function obterUltimoComentario() {
  try {
    const resposta = await axios.get(
      "https://www.googleapis.com/youtube/v3/commentThreads",
      {
        params: {
          part: "snippet",
          videoId: process.env.YOUTUBE_VIDEO_ID,
          key: process.env.YOUTUBE_API_KEY,
          maxResults: 1,
          order: "time",
        },
      }
    );

    if (resposta.data.items && resposta.data.items.length > 0) {
      const comentario = resposta.data.items[0].snippet.topLevelComment.snippet;

      return {
        nomeAutor: decodificarEntidadesHTML(comentario.authorDisplayName),
        textoComentario: removerTagsHTML(
          decodificarEntidadesHTML(comentario.textDisplay)
        ),
        dataPublicacao: comentario.publishedAt,
        dataPublicacaoFormatada: new Date(comentario.publishedAt),
        imagemPerfilAutor: comentario.authorProfileImageUrl,
      };
    }
    return null;
  } catch (erro) {
    console.error("❌ Erro ao buscar comentários:", erro.message);
    throw erro;
  }
}

module.exports = { obterUltimoComentario };
