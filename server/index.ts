import { App } from '@materia/server';

export default class MateriaLocalUploader {
    public static displayName = 'Local Uploader';
    public static logo = 'https://raw.githubusercontent.com/materiahq/materia-website-content/master/logo/addons/local-uploader.png';
    public static installSettings = [];

    constructor(private app: App, private config: any) { }

    afterLoadAPI() {
        if (this.config && this.config.endpoints && this.config.endpoints.length) {
            this.registerEndpoints();
        }
    }

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
                fromAddon: this.app.addons.get('materia/local-uploader')
            }, { save: false });
            if (endpoint.fetch_uploaded_file) {
                this.app.api.add({
                    method: 'get',
                    url: endpoint.fetch_uploaded_file_url,
                    controller: 'upload',
                    action: 'getFileContent',
                    permissions: endpoint.fetch_uploaded_file_permissions,
                    fromAddon: this.app.addons.get('materia/local-uploader'),
                    params: [
                        {
                            name: 'name',
                            required: true,
                            component: 'input',
                            type: 'text'
                        }
                    ]
                }, { save: false });
            }
        });
    }
}
