const { gerarImagemComentario } = require("./gerarThumb");
const { processarImagemPerfil } = require("./processarImagem");

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "models/gemini-1.5-flash";

async function moderarComentario(texto) {
  const prompt = `
Você é um moderador inteligente de comentários do YouTube.

Objetivo:
- Censurar apenas palavras ou expressões claramente ofensivas, de baixo calão, sexuais explícitas ou violentas.
- Seja moderado: não censure palavras comuns ou elogios.
- Não censure variações inofensivas ou gírias que não sejam ofensivas de verdade, como "caraca", "gay", "mizeravi", entre outros.

Regras:
1. Substitua palavras ofensivas por asteriscos (*) com o mesmo número de letras. Ex: "caralho" -> "*******"
2. Não remova risadas como "kkkk", "KKKK", "haha", "HAHA", etc.
3. Mantenha todos os links no comentário.
4. Remova apenas tags HTML como <br>, <p>, etc.
5. Substitua '/n' por '<br>'.
6. Preserve o restante do texto, pontuação, emojis e formatação original.
7. **Não censure palavras neutras ou elogiosas como "muito bom", "massa", "legal", "top", etc.**

Comentário a moderar:
"${texto}"

Retorne apenas o comentário censurado, sem explicações ou observações adicionais.
    `.trim();

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const json = await res.json();
    console.log(json);

    const censurado = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    console.log("🔍 Comentário censurado:", censurado);
    return censurado;
  } catch (err) {
    console.error("❌ Erro na moderação:", err.message);
    return texto;
  }
}

async function processarComentario(comentario) {
  // Moderar o texto do comentário
  const comentarioModerado = await moderarComentario(
    comentario.textoComentario
  );

  // Verificar a imagem de perfil
  const imagemPerfilProcessada = await processarImagemPerfil(
    comentario.imagemPerfilAutor
  );

  if (comentarioModerado) {
    comentario.textoComentario = comentarioModerado;
    comentario.imagemPerfilAutor = imagemPerfilProcessada;
    await gerarImagemComentario(comentario);
  } else {
    console.warn("GEMINI CABACOU");
  }

  return comentario;
}

module.exports = { processarComentario };
