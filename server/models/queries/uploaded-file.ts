import { createReadStream, stat, readFile, unlink } from 'fs';

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
                        const config = this.app.addons.addonsConfig['@materia/local-uploader'].endpoints.find(e => e.url === file.from);
                        if (config && ! config.fetch_uploaded_file) {
                            reject(new Error('Fetching is not allowed for this file'));
                        }
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
            this._getFileByName(params).then(file => {
                if (!file) {
                    reject(new Error(`File not found`));
                }
                const config = this.app.addons.addonsConfig['@materia/local-uploader'].endpoints.find(e => e.url === file.from);
                if (config && ! config.fetch_uploaded_file) {
                    reject(new Error('Fetching is not allowed for this file'));
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

    deleteByName(params) {
        return new Promise((resolve, reject) => {
            this._getFileByName(params).then(file => {
                if (!file) {
                    reject(new Error(`File not found`));
                }
                unlink(file.path, (err) => {
                    if (err) {
                        reject(err.message);
                    }
                    const deleteQuery = this.app.entities.get('uploaded_file').getQuery('delete');
                    deleteQuery.run({id_uploaded: file.id_uploaded}).then((result) => {
                        resolve(result);
                    }).catch((error) => reject(error.message));
                });
            });
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
