const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");

//thumbnail
const TELA = {
  largura: 1280,
  altura: 720,
};

const FOTO_AUTOR = {
  raio: 140,
  tamanho: 280,
};

const NOME_AUTOR = {
  tamanhoFonte: 60,
};

const COMENTARIO = {
  tamanhoFonte: 58,
  larguraMaxima: 780,
  espacamentoLinhas: 1.2, //1.7, 1.5 sla
  maximoLinhas: 7,
};

async function gerarImagemComentario(comentario) {
  try {
    if (!comentario) {
      throw new Error("Comentário não fornecido");
    }

    if (!comentario.textoComentario) {
      throw new Error("Texto do comentário não fornecido");
    }

    if (!comentario.imagemPerfilAutor) {
      throw new Error("Imagem do perfil do autor não fornecida");
    }

    if (!comentario.nomeAutor) {
      throw new Error("Nome do autor não fornecido");
    }
    const canvas = createCanvas(TELA.largura, TELA.altura);
    const ctx = canvas.getContext("2d");

    function quebrarTexto(texto, larguraMaxima) {
      // Substituir sequências de <br> por um único <br>
      const textoNormalizado = texto.replace(/(<br\s*\/?>\s*){2,}/gi, "<br>");

      const paragrafos = textoNormalizado.split(/<br\s*\/?>/gi);
      const linhas = [];
      ctx.font = `${COMENTARIO.tamanhoFonte}px Arial`;

      for (
        let p = 0;
        p < paragrafos.length && linhas.length < COMENTARIO.maximoLinhas;
        p++
      ) {
        const palavras = paragrafos[p].split(" ");
        let linhaAtual = "";

        for (let i = 0; i < palavras.length; i++) {
          let palavra = palavras[i];

          while (
            ctx.measureText(palavra).width > larguraMaxima &&
            palavra.length > 1
          ) {
            let corte = palavra.length;

            while (
              ctx.measureText(palavra.slice(0, corte) + "-").width >
                larguraMaxima &&
              corte > 1
            ) {
              corte--;
            }

            const parte1 = palavra.slice(0, corte) + "-";
            linhas.push((linhaAtual + parte1).trim());

            palavra = palavra.slice(corte);
            linhaAtual = "";

            if (linhas.length >= COMENTARIO.maximoLinhas - 1) {
              linhas.push("...");
              return linhas;
            }
          }

          const linhaTestada = linhaAtual + palavra + " ";
          const metricas = ctx.measureText(linhaTestada);

          if (linhas.length === COMENTARIO.maximoLinhas - 1) {
            const linhaComReticencias = linhaAtual + palavra + "...";
            if (ctx.measureText(linhaComReticencias).width > larguraMaxima) {
              linhas.push(linhaAtual.trim() + "...");
            } else {
              linhas.push(linhaComReticencias.trim());
            }
            return linhas;
          }

          if (metricas.width > larguraMaxima && linhaAtual !== "") {
            linhas.push(linhaAtual.trim());
            linhaAtual = palavra + " ";
          } else {
            linhaAtual = linhaTestada;
          }
        }

        if (linhaAtual !== "" && linhas.length < COMENTARIO.maximoLinhas) {
          linhas.push(linhaAtual.trim());
        }
      }

      return linhas;
    }

    ctx.font = `${COMENTARIO.tamanhoFonte}px Arial`;
    const linhas = quebrarTexto(
      comentario.textoComentario,
      COMENTARIO.larguraMaxima
    );

    const alturaComentario =
      linhas.length * COMENTARIO.tamanhoFonte * COMENTARIO.espacamentoLinhas;

    const alturaRetangulo = Math.max(alturaComentario + 200, 400);
    const larguraRetangulo = 1160;

    const retanguloX = (TELA.largura - larguraRetangulo) / 2;
    const retanguloY = (TELA.altura - alturaRetangulo) / 2;

    const fundo = await loadImage("src/background.jpg");
    ctx.drawImage(fundo, 0, 0, TELA.largura, TELA.altura);

    ctx.fillStyle = "rgba(25, 25, 25, 255)";
    ctx.beginPath();
    ctx.roundRect(
      retanguloX,
      retanguloY,
      larguraRetangulo,
      alturaRetangulo,
      30
    );
    ctx.fill();

    const imagemAutor = await loadImage(comentario.imagemPerfilAutor);
    const fotoX = retanguloX + 30 + FOTO_AUTOR.raio; // margem esquerda
    const fotoY = retanguloY + 60 + FOTO_AUTOR.raio;

    ctx.save();
    ctx.beginPath();
    ctx.arc(fotoX, fotoY, FOTO_AUTOR.raio, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
      imagemAutor,
      fotoX - FOTO_AUTOR.raio,
      fotoY - FOTO_AUTOR.raio,
      FOTO_AUTOR.tamanho,
      FOTO_AUTOR.tamanho
    );
    ctx.restore();

    // Nome do autor
    const nomeX = fotoX + FOTO_AUTOR.raio + 30;
    const nomeY = retanguloY + 100;

    ctx.fillStyle = "#3EA6FF";
    ctx.font = `bold ${NOME_AUTOR.tamanhoFonte}px Arial`;
    ctx.fillText(comentario.nomeAutor, nomeX, nomeY);

    // Comentário
    const textoX = nomeX;
    const textoY = nomeY + 50;

    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${COMENTARIO.tamanhoFonte}px Arial`;

    linhas.forEach((linha, i) => {
      const y =
        textoY +
        i * COMENTARIO.tamanhoFonte * COMENTARIO.espacamentoLinhas +
        40;
      ctx.fillText(linha, textoX, y);
    });

    // Salvar
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync("thumbnail.png", buffer);

    console.log("🎨 Miniatura gerada com sucesso!");
  } catch (erro) {
    console.error("❌ Erro ao gerar miniatura:", erro);
  }
}

module.exports = { gerarImagemComentario };
