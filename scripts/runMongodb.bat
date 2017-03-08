@echo off

echo "RunMongodb.bat"
bash -c "sudo rm /var/lib/mongodb/mongod.lock"
bash -c "sudo service mongodb start && echo 'Hit a key to stop the service' && read && sudo service mongodb stop"
echo "Hit a key to close"
pause
exit