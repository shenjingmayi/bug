CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py XblGameSave manual run", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py XboxNetApiSvc manual run", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py XblAuthManager manual run", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py XboxGipSvc manual run", "", "runas", 0