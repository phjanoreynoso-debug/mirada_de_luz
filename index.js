const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando sistema BOTWP completo...');

// Función auxiliar para ejecutar comandos
function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    // En Windows npm es un batch file
    const cmd = process.platform === 'win32' ? `${command}.cmd` : command;
    
    const proc = spawn(cmd, args, {
      cwd: cwd,
      stdio: 'inherit',
      shell: true
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando "${command} ${args.join(' ')}" falló con código ${code}`));
      }
    });
  });
}

async function start() {
  try {
    const serverPath = path.join(__dirname, 'server');
    const clientPath = path.join(__dirname, 'bitacora');

    // 1. Instalar dependencias Server si faltan
    if (!fs.existsSync(path.join(serverPath, 'node_modules'))) {
        console.log('📦 Instalando dependencias del servidor...');
        await runCommand('npm', ['install'], serverPath);
    }

    // 2. Instalar dependencias Cliente si faltan
    if (!fs.existsSync(path.join(clientPath, 'node_modules'))) {
        console.log('📦 Instalando dependencias del cliente...');
        await runCommand('npm', ['install'], clientPath);
    }

    // 3. Build del cliente si falta dist
    if (!fs.existsSync(path.join(clientPath, 'dist'))) {
        console.log('🏗️ Construyendo frontend...');
        await runCommand('npm', ['run', 'build'], clientPath);
    } else {
        console.log('✅ Frontend ya construido. Saltando build (elimina bitacora/dist si quieres forzar rebuild).');
    }

    // 4. Iniciar servidor
    console.log('🌍 Iniciando servidor unificado en http://localhost:3000 ...');
    
    const serverProc = spawn('node', ['index.js'], {
        cwd: serverPath,
        stdio: 'inherit',
        shell: true
    });

    // Abrir navegador automáticamente después de unos segundos
    setTimeout(() => {
        const startCommand = process.platform === 'win32' ? 'start' : 'open';
        spawn(startCommand, ['http://localhost:3000'], { shell: true });
        console.log('🌐 Navegador abierto automáticamente.');
    }, 3000);
    
    serverProc.on('close', (code) => {
        console.log(`Servidor detenido con código ${code}`);
    });

  } catch (error) {
    console.error('❌ Error al iniciar:', error);
  }
}

start();
