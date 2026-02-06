CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py edgeupdate stop disabled", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py edgeupdatem stop disabled", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py edgeupdate1db8fc699f9368b stop disabled", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py edgeupdate1dbf14fa58159f6 stop disabled", "", "runas", 0