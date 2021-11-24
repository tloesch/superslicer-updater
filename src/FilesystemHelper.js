const fs = require('fs');
const { http, https } = require('follow-redirects');
const unzipper = require('unzipper');

module.exports = class FilesystemHelper {

    static async extract(filePath, targetPath) {
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(unzipper.Extract({ path: targetPath }))
                .on('close', () => resolve(targetPath))
                .on('error', (error) => reject(error))
            ;
        });
    }

    static download(url, targetFilePath) {
        return new Promise((resolve, reject) => {
            https.get(url, (response) => {
                const file = fs.createWriteStream(targetFilePath);
                response
                    .pipe(file)
                    .on('finish', () => resolve(targetFilePath))
                    .on('error', (error) => reject(error))
                ;
            });
        });
    }

}