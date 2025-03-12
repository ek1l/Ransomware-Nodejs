import { exec } from 'child_process';
import sendLog from './websocket/client';

const executeCommand = (
  command: string,
  usePowerShell: boolean = false,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const shell = usePowerShell ? 'powershell.exe' : 'cmd.exe';
    const commandToRun = usePowerShell
      ? `-Command ${command}`
      : `/c ${command}`;

    exec(`${shell} ${commandToRun}`, (error, stdout, stderr) => {
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

const isActive = async () => {
  const isActive = await executeCommand('Get-MpComputerStatus', true);
  const sadasd = await executeCommand('whoami', true);
  setTimeout(() => sendLog(`[+] -> ANTIVIRUS ATIVO: ${isActive}`), 1000);
};

export default isActive;
