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
}

export = UploadCtrl;
