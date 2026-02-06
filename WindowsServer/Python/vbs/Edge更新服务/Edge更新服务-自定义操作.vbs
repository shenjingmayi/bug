CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py edgeupdate ", "", "runas"
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py edgeupdatem ", "", "runas"
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py edgeupdate1db8fc699f9368b ", "", "runas"
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py edgeupdate1dbf14fa58159f6 ", "", "runas"