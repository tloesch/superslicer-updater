# superslicer-updater ( Windows Version )
Superslicer Installer &amp; Updater for Windows. Written in NodeJs.

## Prerequisites
+ https://nodejs.org/

## How to use:
+ Execute `npm install` within Powershell or CMD
+ Run the Installer/Updater with `npm start` or just execute the `update.bat`

## Additional Information
+ The Updater got created with the reason of personal use
+ The Install/Update directory is currently within the superslicer-updater folder
+ Before any update your current version will be copied into the .backup folder

## How it works
The Updater will look into the lastest Release Page of the Superslicer Repositoriy (https://github.com/supermerill/SuperSlicer/releases/latest)
to check the if an update is available. 
When an update is available it will use the Download Link of the win64 zip file (Windows) to downlad the update.
Before updating a backup of your current installed Version will be created.

## Contributing Improvements
Currently there are no contributing templates or rules for issues or pull requests.
For the moment just create them with enough explaination.
You should always try to answer following questions: What? and Why?

Simple Example:
I want the updater to be linux compatible (What)
to make use of it on linux (Why)
