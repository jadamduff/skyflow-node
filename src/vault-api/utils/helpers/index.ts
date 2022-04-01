import { ContentType, IConnectionConfig } from "../common";
const qs = require('qs');
export function fillUrlWithPathAndQueryParams(url:string,
  pathParams?:object,
  queryParams?:object) {
  let filledUrl = url;
  if (pathParams) {
    Object.entries(pathParams).forEach(([key, value]) => {
      filledUrl = url.replace(`{${key}}`, value);
    });
  }
  if (queryParams) {
    filledUrl += '?';
    Object.entries(queryParams).forEach(([key, value]) => {
      filledUrl += `${key}=${value}&`;
    });
    filledUrl = filledUrl.substring(0, filledUrl.length - 1);
  }
  return filledUrl;
}

export function formatVaultURL(vaultURL) {
  if (typeof vaultURL !== 'string') return vaultURL;
  return (vaultURL?.trim().slice(-1) === '/') ? vaultURL.slice(0, -1) : vaultURL.trim();
}

export function toLowerKeys(obj) {
  if (obj && typeof obj === 'object') {
  return Object.keys(obj).reduce((accumulator, key) => {
    accumulator[key.toLowerCase()] = obj[key];
    return accumulator;
  }, {});
  }
  return {}
}

export function updateRequestBodyInConnection(config: IConnectionConfig) {
  let tempConfig = { ...config };
  if (config && config.requestHeader && config.requestBody) {
    const headerKeys = toLowerKeys(config.requestHeader);
    if (headerKeys['content-type'].includes(ContentType.FORMURLENCODED)) {
      tempConfig = {
        ...tempConfig,
        requestBody: qs.stringify(config.requestBody),
      };
    }
  }
  return tempConfig;
}