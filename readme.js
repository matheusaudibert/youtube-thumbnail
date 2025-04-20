const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

const readmePath = path.join(__dirname, "README.md");
const thumbnailPath = path.join(__dirname, "thumbnail.png");

async function atualizarReadme() {
  try {
    let readmeContent = await fs.readFile(readmePath, "utf8");

    const timestamp = new Date().getTime();
    const imageTag = `![Latest Thumbnail](./thumbnail.png)`;

    const secaoPattern = /## 🎴 Last Thumbnail\s*\n\s*([\s\S]*?)(?=\s*##|$)/;

    if (secaoPattern.test(readmeContent)) {
      readmeContent = readmeContent.replace(
        secaoPattern,
        `## 🎴 Last Thumbnail\n\n${imageTag}`
      );
    } else {
      readmeContent = readmeContent.replace(
        /# 🎬 Youtube Thumbnail\s*\n/,
        `# 🎬 Youtube Thumbnail\n\n## 🎴 Last Thumbnail\n\n${imageTag}`
      );
    }

    await fs.writeFile(readmePath, readmeContent, "utf8");

    await commitParaGithub();
  } catch (error) {
    console.error("Erro ao atualizar o README:", error);
    throw error;
  }
}

async function commitParaGithub() {
  try {
    const dataHora = new Date().toISOString();

    await execPromise("git add README.md thumbnail.png");

    try {
      await execPromise("git add readme.js");
    } catch (e) {
      console.log("erro");
    }

    await execPromise(`git commit -m "new thumbnial - ${dataHora}"`);
    await execPromise("git push");
    console.log("✨ Alterações enviadas para o GitHub com sucesso.");
  } catch (error) {
    console.error("Erro ao fazer commit para o GitHub:", error);

    try {
      const { stdout } = await execPromise("git status");
      console.log("Status atual do Git:", stdout);
    } catch (statusError) {
      console.error("Erro ao verificar status do Git:", statusError);
    }

    throw error;
  }
}

module.exports = { atualizarReadme };
