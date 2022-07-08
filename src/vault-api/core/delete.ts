import Client from "../client";
import { ISkyflowIdRecordWithoutReveal } from "../utils/common";

export const deleteSkyflowIdRecordsFromVault = async (
  skyflowIdRecord: ISkyflowIdRecordWithoutReveal,
  client: Client,
  authToken: string,
) => {

  const vaultEndPointurl: string = `${client.config.vaultURL}/v1/vaults/${client.config.vaultID}/${skyflowIdRecord.table}`;

  return client.request<{ RecordIDResponse: string[] }>({
    requestMethod: 'DELETE',
    url: vaultEndPointurl,
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      skyflow_ids: skyflowIdRecord.ids
    }
  });
}


/** SKYFLOW ID */

export const deleteRecordsBySkyflowID = async (
  skyflowIdRecords: ISkyflowIdRecordWithoutReveal[],
  client: Client,
  authToken: string
): Promise<{ records: ISkyflowIdRecordWithoutReveal[] }> => new Promise((rootResolve, rootReject) => {
  let vaultResponseSet: Promise<ISkyflowIdRecordWithoutReveal>[];
  vaultResponseSet = skyflowIdRecords.map(
    (skyflowIdRecord) => new Promise((resolve, reject) => {
      deleteSkyflowIdRecordsFromVault(skyflowIdRecord, client, authToken as string)
        .then(
          (resolvedResult: { RecordIDResponse: string[] }) => {
            resolve({
              ids: resolvedResult.RecordIDResponse,
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
                ids: skyflowIdRecord.ids,
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
    const recordsResponse: ISkyflowIdRecordWithoutReveal[] = [];
    const errorsResponse: any[] = [];
    resultSet.forEach((result) => {
      if (result.status === 'fulfilled') {
        recordsResponse.push(result.value);
      } else {
        errorsResponse.push(result.reason);
      }
    });
    if (errorsResponse.length === 0) {
      rootResolve({ records: recordsResponse });
    } else if (recordsResponse.length === 0) rootReject({ errors: errorsResponse });
    else rootReject({ records: recordsResponse, errors: errorsResponse });
  });
});