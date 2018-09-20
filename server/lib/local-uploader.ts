import * as multer from 'multer';

export class LocalUploader {
    app: any;

    constructor(app) {
        this.app = app;
    }

    getEndpointConfig(url) {
        let config = this.app.addons.addonsConfig['@materia/local-uploader'].endpoints.find(e => e.url === url);
        if (!config) {
            config = {};
        }
        return config;
    }

    uploadMultiple(req, res) {
        const upload = this.configureMulter(req, res);
        const config = this.getEndpointConfig(req.url);
        return new Promise((resolve, reject) => {
            upload.array(config.input_name, config.max_file_count ? config.max_file_count : null)(req, res, err => {
                if (err) {
                    return reject(err);
                }
                let p: Promise<any> = Promise.resolve();
                const files = [];
                req.files.forEach(file => {
                    p = p.then(() => {
                        return this.app.entities.get('uploaded_file').getQuery('create').run({
                            name: file.filename,
                            original_name: file.originalname,
                            from: req.url,
                            path: file.path,
                            type: file.mimetype,
                            size: file.size,
                            uploaded_at: new Date()
                        });
                    }).then((result) => {
                        files.push(result);
                        return files;
                    }).catch((error) => reject(error));
                });

                p.then((result) => resolve(files))
                .catch((error) => reject(error));
            });
        });
    }

    uploadSingle(req, res) {
        const upload = this.configureMulter(req, res);
        return new Promise((resolve, reject) => {
            const config = this.getEndpointConfig(req.url);
            upload.single(config.input_name)(req, res, err => {
                if (err) {
                    return reject(err);
                }
                this.app.entities.get('uploaded_file').getQuery('create').run({
                    name: req.file.filename,
                    original_name: req.file.originalname,
                    from: req.url,
                    path: req.file.path,
                    type: req.file.mimetype,
                    size: req.file.size,
                    uploaded_at: new Date()
                }).then((result) => resolve(result)
                ).catch((error) => reject(error));
            });
        });
    }

    configureMulter(req, res) {
        const config = this.getEndpointConfig(req.url);
        return multer({
            dest: `${this.app.path}/${config.dest ? config.dest : 'uploads'}`,
            limits: {
                fileSize: config.size_limit ? config.size_limit : 10000000
            },
            fileFilter: (_req, file, cb) => {
                if (config.mime_types && config.mime_types.length) {
                    let match = false;
                    config.mime_types.forEach(type => {
                        if (file.mimetype === type) {
                            match = true;
                        }
                    });
                    if (match) {
                        cb(null, true);
                    } else {
                        return cb(`Only following ${config.mime_types} mime_types are allowed`);
                    }
                } else {
                    cb(null, true);
                }
            }
        });
    }
}
