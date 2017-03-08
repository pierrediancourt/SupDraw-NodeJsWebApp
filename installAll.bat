@echo off

echo "You need a Windows 10 installation with build number equal or above 14393"
echo "If not, this script won't work"
pause
echo "You have to turn on the DevelopperMode : https://msdn.microsoft.com/fr-fr/commandline/wsl/install_guide"
echo "Open Settings -> Update and Security -> For developers"
echo "Select the Developer Mode radio button"
pause
echo "You might need to re-run this script as administrator if it fails"

powershell.exe Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux

pause

start cmd.exe /K %~dp0\scripts\installMongodb.bat
start cmd.exe /K %~dp0\scripts\installNode.bat