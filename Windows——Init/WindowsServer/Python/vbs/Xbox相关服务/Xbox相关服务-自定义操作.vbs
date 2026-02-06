CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py XblGameSave ", "", "runas"
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py XboxNetApiSvc ", "", "runas"
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py XblAuthManager ", "", "runas"
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py XboxGipSvc ", "", "runas"