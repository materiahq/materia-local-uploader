import { Injectable } from "@angular/core";
import { IEndpoint, IApp } from "@materia/interfaces";
import { MateriaEndpointsService } from "./materia-endpoints.service";
import { ILocalUploaderEndpoint } from "../models/upload-endpoint.model";

@Injectable()
export class UploadEndpointsService {

  constructor(
    private endpointsService: MateriaEndpointsService
  ) {}

  add(baseUrl: string, endpoint: ILocalUploaderEndpoint) {
    let p: Promise<any> = Promise.resolve();
    const uploadEndpoint: IEndpoint = {
      method: "post",
      type: 'code',
      url: endpoint.url,
      controller: "upload",
      action:
        endpoint.type && endpoint.type === "single"
          ? "uploadSingle"
          : "uploadMultiple",
      permissions: endpoint.permissions ? endpoint.permissions : [],
      fromAddon: {
        package: "@materia/local-uploader"
      }
    };
    p = p.then(() => this.endpointsService.add(baseUrl, uploadEndpoint, {save: false}));
    if (endpoint.fetch_uploaded_file) {
      const fetchEndpoint =
        {
          method: "get",
          type: 'code',
          url: endpoint.fetch_uploaded_file_url,
          controller: "upload",
          action: "getFileContent",
          permissions: endpoint.fetch_uploaded_file_permissions,
          fromAddon: {
            package: "@materia/local-uploader"
          },
          params: [
            {
              name: "name",
              required: true,
              component: "input",
              type: "text"
            }
          ]
        };
        p = p.then(() => this.endpointsService.add(baseUrl, fetchEndpoint, {save: false}));
    }
    return p;
  }

  delete(baseUrl: string, endpoint: ILocalUploaderEndpoint) {
    let p: Promise<any> = Promise.resolve();
    p = p.then(() => this.endpointsService.delete(baseUrl, 'post', endpoint.url));
    if (endpoint.fetch_uploaded_file) {
      p = p.then(() => this.endpointsService.delete(baseUrl, 'get', endpoint.fetch_uploaded_file_url));
    }
    return p;
  }
}
