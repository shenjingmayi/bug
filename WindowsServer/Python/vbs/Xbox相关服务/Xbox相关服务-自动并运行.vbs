CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py XblGameSave auto run", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py XboxNetApiSvc auto run", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py XblAuthManager auto run", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py XboxGipSvc auto run", "", "runas", 0