import {Skyflow} from "../../src/index";
import {XMLHttpRequest} from 'xmlhttprequest-ts';

const skyflow = Skyflow.init({
  vaultID: "<VaultID>",
  vaultURL: "<VaultURL>",
  getBearerToken: () => {
    return new Promise((resolve, reject) => {
      const Http = new XMLHttpRequest();

      Http.onreadystatechange = () => {
        if (Http.readyState == 4) {
          if (Http.status == 200) {
            const response = JSON.parse(Http.responseText);
            resolve(response.accessToken);
          } else {
            reject("Error occured");
          }
        }
      };

      Http.onerror = (error) => {
        reject("Error occured");
      };

      const url = "TOKEN Endpoint";
      Http.open("GET", url);
      Http.send();
    });
  },
});


  const result = skyflow.getById({
    records: [
      {
       ids:["id"],
       redaction : Skyflow.RedactionType.PLAIN_TEXT,
       table: "cards"
      },
      {
        ids:["id","id"],
        redaction : Skyflow.RedactionType.PLAIN_TEXT,
        table: "persons"
       }
    ],
  });
    
  result
  .then((res) => {
        console.log("getByID result:");
        console.log(JSON.stringify(res));
  })
  .catch((err) => {
    console.log("getByID error: ");
    console.log(JSON.stringify(err));
  });