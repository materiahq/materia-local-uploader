import { createReadStream, stat, readFile } from 'fs';

class UploadedFile {
    constructor(private app: any) { }

    getFileContent(params) {
        return new Promise((resolve, reject) => {
            this._getFileByName(params).then(file => {
                if (!file) {
                    reject(new Error(`File not found`));
                }
                this._checkIfFile(file.path).then((isFile) => {
                    if (isFile) {
                        readFile(params.path, 'utf8', (err, contents) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(contents);
                            }
                        });
                    } else {
                        reject(new Error(`The specified path does not match a file`));
                    }
                });
            }).catch(err => reject(err.message));
        });
    }

    getFileContentStream(params) {
        return new Promise((resolve, reject) => {
            this._getFileByName(params.name).then(file => {
                if (!file) {
                    reject(new Error(`File not found`));
                }
                this._checkIfFile(file.path).then((isFile) => {
                    if (isFile) {
                        const readStream = createReadStream(file.path);
                        resolve(readStream);
                    } else {
                        reject(new Error(`The specified path does not match a file`));
                    }
                });
            }).catch(err => reject(err.message));
        });
    }

    private async _getFileByName(params) {
        const file = await this.app.entities.get('uploaded_file').getQuery('getByName').run(params);
        return file;
    }

    private _checkIfFile(file) {
        return new Promise((resolve, reject) => {
            return stat(file, (err, stats) => {
                if (err) {
                    reject(new Error(`The path does not exists`));
                } else {
                    resolve(stats.isFile());
                }
            });
        });
    }
}
export = UploadedFile;
