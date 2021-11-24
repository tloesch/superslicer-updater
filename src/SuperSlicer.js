const fs = require('fs');
const fse = require('fs-extra');
const cheerio = require('cheerio');
const got = require('got');
const FilesystemHelper = require('./FilesystemHelper');

module.exports = class SuperSlicer {

    constructor(appDirPath, versionFilePath, backupDirPath, tempDirPath) {
        this.appDirPath = appDirPath;
        this.versionFilePath = versionFilePath;
        this.backupDirPath = backupDirPath;
        this.tempDirPath = tempDirPath;
    }

    async setupEnvironment() {
        await fs.existsSync(this.tempDirPath) || await fs.mkdirSync(this.tempDirPath);
        await fs.existsSync(this.appDirPath) || await fs.mkdirSync(this.appDirPath);
        await fs.existsSync(this.backupDirPath) && await fs.rmdirSync(this.backupDirPath, { recursive: true, force: true});
        await fs.mkdirSync(this.backupDirPath);
    }

    async getLatestReleasePage() {
        if (!this.releasePage) {
            const releaePageContent = await got('https://github.com/supermerill/SuperSlicer/releases/latest').then((response) => response.body);
            this.releasePage = cheerio.load(releaePageContent);
        }
        return this.releasePage;
    }

    async getDownloadLink() {
        const fullVersionName = `SuperSlicer_${await this.getLatestVersion()}_win64`;
        const releasePage = await this.getLatestReleasePage();
        let url = 'https://github.com';
        url += releasePage('a[rel="nofollow"]')
            .toArray()
            .map(a => a.attribs.href)
            .find(url => url.includes(fullVersionName))
        ;
        return url;
    }

    async getLocalVersion() {
        let version = null;
        if (fs.existsSync(this.versionFilePath)) {
            version = await fs.readFileSync(this.versionFilePath).toString();
        }
        return version;
    }

    async getLatestVersion() {
        const releasePage = await this.getLatestReleasePage();
        return releasePage('#repo-content-pjax-container nav li.breadcrumb-item-selected a').text().replace(/ /g, '').replace(/\r?\n|\r/g, '');
    }

    async isUpdateAvailable() {
        return await this.getLatestVersion() !== await this.getLocalVersion();
    }

    async install() {
        const latestVersion = await this.getLatestVersion();
        const fullLatestVersionName = `SuperSlicer_${latestVersion}_win64`;
        console.log('Trying to get Update', latestVersion, '...');
        await this.setupEnvironment();
        const zippedReleaseFilePath = await FilesystemHelper.download(await this.getDownloadLink(), `${this.tempDirPath}/${fullLatestVersionName}.zip`);
        const unzippedDirPath = await FilesystemHelper.extract(zippedReleaseFilePath, `${this.tempDirPath}/unzipped/`);
        const unzippedDirEntities = await fs.readdirSync(unzippedDirPath);
        if (unzippedDirEntities.length !== 1) {
            console.log('Failed to fetch Update', latestVersion);
            return;
        }
        await this.backup();
        console.log('Installing Update', latestVersion)
        const newVersionPath = unzippedDirPath + unzippedDirEntities.shift();
        const newVersionEntities = await fs.readdirSync(newVersionPath);
        newVersionEntities.forEach(async (entity) => {
            await fse.copySync(`${newVersionPath}/${entity}`, `${this.appDirPath}/${entity}`, { overwrite: true });
        });
        await fs.writeFileSync(this.versionFilePath, latestVersion);
        console.log('Update', latestVersion, 'installed!')
        await this.cleanup();
        console.log('Installation finished. Have fun :)');
    }

    async backup() {
        console.log('Creating Backup of current Version...');
        const fsEntities = await fs.readdirSync(this.appDirPath);
        fsEntities.forEach(async(entity) => await fse.copySync(`${this.appDirPath}/${entity}`, `${this.backupDirPath}/${entity}`));
        console.log('Backup created!');
    }

    async cleanup() {
        console.log('Cleaning Up...');
        await fs.rmdirSync(this.tempDirPath, { recursive: true, force: true});
    }

}