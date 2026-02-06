CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py XblGameSave stop disabled", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py XboxNetApiSvc stop disabled", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py XblAuthManager stop disabled", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py XboxGipSvc stop disabled", "", "runas", 0