import SkyflowError from '../../libs/SkyflowError';
import {
  IInsertRecordInput, IDetokenizeInput, RedactionType, IGetByIdInput, IGatewayConfig, RequestMethod,
} from '../common';
import SKYFLOW_ERROR_CODE from '../constants';


export const validateInsertRecords = (recordObj: IInsertRecordInput) => {
  if (!('records' in recordObj)) {
    throw new SkyflowError(SKYFLOW_ERROR_CODE.RECORDS_KEY_NOT_FOUND, [], true);
  }
  const { records } = recordObj;
  if (records.length === 0) {
    throw new SkyflowError(SKYFLOW_ERROR_CODE.EMPTY_RECORDS, [], true);
  }
  records.forEach((record, index) => {
    if (!('table' in record && 'fields' in record)) {
      throw new SkyflowError(SKYFLOW_ERROR_CODE.EMPTY_TABLE_AND_FIELDS, [`${index}`], true);
    }
    if (record.table === '') {
      throw new SkyflowError(SKYFLOW_ERROR_CODE.EMPTY_TABLE, [`${index}`], true);
    }
  });
};

export const validateDetokenizeInput = (detokenizeInput: IDetokenizeInput) => {
  if (!Object.prototype.hasOwnProperty.call(detokenizeInput, 'records')) throw new SkyflowError(SKYFLOW_ERROR_CODE.MISSING_RECORDS);

  const { records } = detokenizeInput;
  if (records.length === 0) throw new SkyflowError(SKYFLOW_ERROR_CODE.EMPTY_RECORDS);
  records.forEach((record) => {
    if (Object.keys(record).length === 0) {
      throw new SkyflowError(SKYFLOW_ERROR_CODE.EMPTY_RECORDS);
    }

    const recordToken = record.token;
    if (!recordToken) {
      throw new SkyflowError(SKYFLOW_ERROR_CODE.MISSING_TOKEN);
    }
    if (recordToken === '' || typeof recordToken !== 'string') { throw new SkyflowError(SKYFLOW_ERROR_CODE.INVALID_TOKEN_ID); }

  });
};

export const validateGetByIdInput = (getByIdInput: IGetByIdInput) => {
  if (!Object.prototype.hasOwnProperty.call(getByIdInput, 'records')) {
    throw new SkyflowError(SKYFLOW_ERROR_CODE.MISSING_RECORDS);
  }
  const { records } = getByIdInput;
  if (records.length === 0) {
    throw new SkyflowError(SKYFLOW_ERROR_CODE.EMPTY_RECORDS);
  }

  records.forEach((record) => {
    if (Object.keys(record).length === 0) {
      throw new SkyflowError(SKYFLOW_ERROR_CODE.EMPTY_RECORDS);
    }

    const recordIds = record.ids;
    if (!recordIds) {
      throw new SkyflowError(SKYFLOW_ERROR_CODE.MISSING_IDS);
    }
    if (recordIds.length === 0) throw new SkyflowError(SKYFLOW_ERROR_CODE.EMPTY_RECORD_IDS);
    recordIds.forEach((skyflowId) => {
      if (typeof skyflowId !== 'string') throw new SkyflowError(SKYFLOW_ERROR_CODE.INVALID_RECORD_ID_TYPE);
    });

    const recordRedaction = record.redaction;
    if (!recordRedaction) throw new SkyflowError(SKYFLOW_ERROR_CODE.MISSING_REDACTION);
    if (!Object.values(RedactionType).includes(recordRedaction)) {
      throw new SkyflowError(SKYFLOW_ERROR_CODE.INVALID_REDACTION_TYPE);
    }

    const recordTable = record.table;
    if (!Object.prototype.hasOwnProperty.call(record, 'table')) { throw new SkyflowError(SKYFLOW_ERROR_CODE.MISSING_TABLE); }

    if (recordTable === '' || typeof recordTable !== 'string') { throw new SkyflowError(SKYFLOW_ERROR_CODE.INVALID_RECORD_TABLE_VALUE); }
  });
};

export const isValidURL = (url: string) => {
  if (url.substring(0, 5).toLowerCase() !== 'https') {
    return false;
  }
  try {
    const tempUrl = new URL(url);
    if (tempUrl) return true;
  } catch (err) {
    return false;
  }

  return true;
};

export const validateGatewayConfig = (config: IGatewayConfig) => {
  if (!Object.prototype.hasOwnProperty.call(config, 'gatewayURL')) {
    throw new SkyflowError(SKYFLOW_ERROR_CODE.MISSING_GATEWAY_URL);
  }
  if (typeof config.gatewayURL !== 'string') {
    throw new SkyflowError(SKYFLOW_ERROR_CODE.INVALID_GATEWAY_URL_TYPE);
  }
  if (!isValidURL(config.gatewayURL)) {
    throw new SkyflowError(SKYFLOW_ERROR_CODE.INVALID_GATEWAY_URL);
  }

  if (!Object.prototype.hasOwnProperty.call(config, 'methodName')) {
    throw new SkyflowError(SKYFLOW_ERROR_CODE.MISSING_METHODNAME_KEY);
  }
  if (!Object.values(RequestMethod).includes(config.methodName)) {
    throw new SkyflowError(SKYFLOW_ERROR_CODE.INVALID_METHODNAME_VALUE);
  }
};
