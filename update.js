const SuperSlicer = require('./src/SuperSlicer');

const tempDir = `${__dirname}/.tmp`;
const backupDir = `${__dirname}/.backup`;
const versionFile = `${__dirname}/version.info`;
const appDir = `${__dirname}/SuperSlicer`;

const sSlicer = new SuperSlicer(appDir, versionFile, backupDir, tempDir);

async function run() {
    console.log('Current Version is: ', await sSlicer.getLocalVersion());
    console.log('Looking for Update...');
    if (!await sSlicer.isUpdateAvailable()) {
        console.log('No Update found!');
        return;
    }
    await sSlicer.install();
}

run();
