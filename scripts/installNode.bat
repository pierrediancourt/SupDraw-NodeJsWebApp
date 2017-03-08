@echo off

echo "InstallNode.bat"
msiexec.exe /i %~dp0\node-v6.10.0-x64.msi
echo "Hit a key when node is installed successfully to install npm packages"
pause
npm install
echo "Hit a key to close"
pause