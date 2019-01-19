import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { IEndpoint } from "@materia/interfaces";

@Injectable()
export class MateriaEndpointsService {
  constructor(private http: HttpClient) {}

  add(baseUrl: string, endpoint: IEndpoint, options?: any) {
    let payload: any = { endpoint: endpoint };
    if (options) {
      payload.options = options;
    }
    return this.http.post(`${baseUrl}/endpoints`, payload).toPromise();
  }

  delete(baseUrl: string, method: string, url: string) {
    return this.http.delete(`${baseUrl}/endpoints/${btoa(method + url)}`).toPromise();
  }

  findAll(baseUrl: string) {
    return this.http.get(`${baseUrl}/endpoints`).toPromise();
  }
}
