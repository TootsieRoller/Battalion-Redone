@echo off
start C:\Users\elllllliiiiraaar\Documents\mongo\bin\mongod --dbpath "C:\Users\elllllliiiiraaar\Documents\mongo\db"
title BattalionServer
@echo Starting up Battalion Server...
:loop
node server
@echo ********** Server Closed **********
@echo Restarting Server...
goto loop