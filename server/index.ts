import { join } from 'path';

export default class MateriaLocalUploader {
    public static displayName = 'Local Uploader';
    public static logo = 'https://cdn.pixabay.com/photo/2016/01/03/00/43/upload-1118929_960_720.png';

    public static installSettings = [
    ];

    constructor(private app, private config) { }

    afterLoadAPI() {
        if (this.config && this.config.endpoints && this.config.endpoints.length) {
            this.registerEndpoints();
        }
    }

    uninstall(app) { }

    private registerEndpoints() {
        this.config.endpoints.forEach((endpoint) => {
            if ( ! endpoint.type) {
                endpoint.type = 'single';
            }
            this.app.api.add({
                method: 'post',
                url: endpoint.url,
                controller: 'upload',
                action: endpoint.type && endpoint.type === 'single' ? 'uploadSingle' : 'uploadMultiple',
                permissions: endpoint.permissions ? endpoint.permissions : [],
                fromAddon: {
                    name: MateriaLocalUploader.displayName,
                    package: '@materia/local-uploader',
                    path: join(this.app.path, 'node_modules', '@materia/local-uploader'),
                    logo: MateriaLocalUploader.logo
                }
            }, { save: false });
        });
    }
}
