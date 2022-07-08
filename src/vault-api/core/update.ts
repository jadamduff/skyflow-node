import Client from "../client";
import { IUpdateRecord, IUpdateRecordResponse } from "../utils/common";


export const updateSkyflowIdRecordFromVault = async (
  skyflowIdRecord: IUpdateRecord,
  client: Client,
  authToken: string,
) => {

  const vaultEndPointurl: string = `${client.config.vaultURL}/v1/vaults/${client.config.vaultID}/${skyflowIdRecord.table}`;

  return client.request<{ records: IUpdateRecordResponse["records"] }>({
    requestMethod: 'PUT',
    url: vaultEndPointurl,
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      objectName: skyflowIdRecord.table,
      vaultID: client.config.vaultID,
      records: skyflowIdRecord.records,
      tokenization: skyflowIdRecord.tokenization
    }
  });

}


/** SKYFLOW ID */

export const updateRecordsBySkyflowID = async (
  skyflowIdRecords: IUpdateRecord[],
  client: Client,
  authToken: string
): Promise<IUpdateRecordResponse[]> => new Promise((rootResolve, rootReject) => {
  let vaultResponseSet: Promise<IUpdateRecordResponse>[];
  vaultResponseSet = skyflowIdRecords.map(
    (skyflowIdRecord) => new Promise((resolve, reject) => {
      updateSkyflowIdRecordFromVault(skyflowIdRecord, client, authToken as string)
        .then(
          (resolvedResult) => {
            resolve({
              ...resolvedResult,
              table: skyflowIdRecord.table
            });
          },
          (rejectedResult) => {
            let errorResponse = rejectedResult;
            if (rejectedResult && rejectedResult.error) {
              errorResponse = {
                error: {
                  code: rejectedResult?.error?.code,
                  description: rejectedResult?.error?.description,
                },
                ids: skyflowIdRecord.records.map(record => record.ID),
              };
            }
            reject(errorResponse);
          },
        )
        .catch((error) => {
          reject(error);
        });
    }),
  );
  Promise.allSettled(vaultResponseSet).then((resultSet) => {
    const recordsResponse: IUpdateRecordResponse[] = [];
    const errorsResponse: any[] = [];
    resultSet.forEach((result) => {
      if (result.status === 'fulfilled') {
        recordsResponse.push(result.value);
      } else {
        errorsResponse.push(result.reason);
      }
    });
    if (errorsResponse.length === 0) {
      rootResolve(recordsResponse);
    } else if (recordsResponse.length === 0) rootReject({ errors: errorsResponse });
    else rootReject({ records: recordsResponse, errors: errorsResponse });
  });
});