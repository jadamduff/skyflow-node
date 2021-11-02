import SkyflowError from '../libs/SkyflowError';
import { ISkyflow } from '../Skyflow';
import SKYFLOW_ERROR_CODE from '../utils/constants';
import logs from '../utils/logs';
import {XMLHttpRequest} from 'xmlhttprequest-ts';

export interface IClientRequest {
  body?: Record<string, any>;
  headers?: Record<string, string>;
  requestMethod:
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'PATCH';
  url: string;
}

class Client {
  config: ISkyflow;

  #metaData: any;

  constructor(config: ISkyflow, metadata) {
    this.config = config;
    this.#metaData = metadata;
  }

  toJSON() {
    return {
      config: this.config,
      metaData: this.#metaData,
    };
  }

  static fromJSON(json) {
    return new Client(json.config, json.metadata);
  }

  request = (request: IClientRequest) => new Promise((resolve, reject) => {

    const httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
      reject(new SkyflowError(SKYFLOW_ERROR_CODE.CONNECTION_ERROR, [], true));
      return;
    }

    httpRequest.open(request.requestMethod, request.url);

    if (request.headers) {
      const { headers } = request;
      Object.keys(request.headers).forEach((key) => {
        httpRequest.setRequestHeader(key, headers[key]);
      });
    }

    httpRequest.send(JSON.stringify({ ...request.body }));

    httpRequest.onload = () => {
      const responseHeaders = httpRequest.getAllResponseHeaders();
      const headersList = responseHeaders!!.trim().split(/[\r\n]+/);
      const headerMap = {};
      headersList.forEach((line) => {
        const parts = line.split(': ');
        const header = parts.shift() || '';
        const value = parts.join(': ');
        headerMap[header] = value;
      });
      const contentType = headerMap['content-type'];
      if (httpRequest.status < 200 || httpRequest.status >= 400) {
        if (contentType.includes('application/json')) {
          reject(new SkyflowError({
            code: httpRequest.status,
            description: JSON.parse(httpRequest.responseText)?.error?.message,
          }, [], true));
        } else if (contentType.includes('text/plain')) {
          reject(new SkyflowError({
            code: httpRequest.status,
            description: httpRequest.responseText,
          }, [], true));
        } else {
          reject(new SkyflowError({
            code: httpRequest.status,
            description: logs.errorLogs.ERROR_OCCURED,
          }, [], true));
        }
      }
      if (contentType.includes('application/json')) {
        resolve(JSON.parse(httpRequest.responseText));
      }
      resolve(httpRequest.responseText);
    };

    httpRequest.onerror = () => {
      reject(new SkyflowError(SKYFLOW_ERROR_CODE.TRANSACTION_ERROR, [], true));
    };
  });
}

export default Client;
