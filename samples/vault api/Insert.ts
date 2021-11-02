import Skyflow from "../../src/vault-api/Skyflow";
import {XMLHttpRequest} from 'xmlhttprequest-ts';
console.log(Skyflow);

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


  const response = skyflow.insert({
    records: [
      {
        fields: {
            cvv: "234",
            card_number: "411111111111111",
            fullname: "san",
            expiry_date: "11/22",
        },
        table: "cards",
      },
    ],
  });
  response
    .then(
      (res) => {
        console.log("insert result:");
        console.log(res);
        console.log(res.records[0].fields);
      },
      (err) => {
        console.log("insert error:");
        console.log(err);
      }
    )
    .catch((err) => {
      console.log("insert exception:");
        console.log(err)
    });