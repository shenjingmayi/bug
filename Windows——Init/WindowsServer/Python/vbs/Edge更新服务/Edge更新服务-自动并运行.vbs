CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py edgeupdate auto run", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py edgeupdatem auto run", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py edgeupdate1db8fc699f9368b auto run", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py edgeupdate1dbf14fa58159f6 auto run", "", "runas", 0