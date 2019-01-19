export interface ILocalUploaderEndpoint {
  type: string,
  url: string,
  dest: string,
  input_name: string,
  size_limit: number,
  max_file_count?: number,
  mime_types?: string[],
  permissions?: string[],
	fetch_uploaded_file?: boolean,
  fetch_uploaded_file_permissions?: string[],
  fetch_uploaded_file_url?: string
}
export interface ILocalUploaderSetting {
  endpoints?: ILocalUploaderEndpoint[]
}
