CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py XblGameSave manual stop", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py XboxNetApiSvc manual stop", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py XblAuthManager manual stop", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py XboxGipSvc manual stop", "", "runas", 0