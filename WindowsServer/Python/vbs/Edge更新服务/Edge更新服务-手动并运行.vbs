CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py edgeupdate manual run", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py edgeupdatem manual run", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py edgeupdate1db8fc699f9368b manual run", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py edgeupdate1dbf14fa58159f6 manual run", "", "runas", 0