import { LocalUploader } from '../lib/local-uploader';

class UploadCtrl {
  localUploader: LocalUploader;

  constructor(private app, entity) {
    this.localUploader = new LocalUploader(this.app);
  }

  uploadSingle(req, res) {
    return this.localUploader.uploadSingle(req, res);
  }

  uploadMultiple(req, res) {
    return this.localUploader.uploadMultiple(req, res);
  }

  getFileContent(req, res) {
    const query = this.app.entities.get('uploaded_file').getQuery('getFileContentStream');
    const params = Object.assign({}, req.body, req.params, req.query);
    query.run({name: params.name}).then((stream) => {
      return stream.pipe(res);
    }).catch(err => res.status(500).send(err.message));
  }
}

export = UploadCtrl;
