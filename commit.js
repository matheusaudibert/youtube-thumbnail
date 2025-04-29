const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs").promises;
const path = require("path");

async function atualizarReadme() {
  try {
    await exec("git add .");

    // Criar commit com timestamp
    const dataHora = new Date().toISOString();
    console.log(`💾 Criando commit com data: ${dataHora}`);
    await exec(`git commit -m "new thumbnail - ${dataHora}"`);

    // Push para o repositório (opcional)
    console.log("🚀 Enviando alterações para o GitHub...");
    await exec("git push origin main");

    console.log("✅ README e thumbnail atualizados com sucesso no GitHub!");
  } catch (error) {
    console.error("❌ Erro ao atualizar o README:", error);

    // Log do status atual do Git para diagnóstico
    try {
      const { stdout } = await exec("git status");
      console.log("Status atual do Git:", stdout);
    } catch (statusError) {
      console.error("Erro ao verificar status do git:", statusError);
    }

    throw error;
  }
}

module.exports = { atualizarReadme };
