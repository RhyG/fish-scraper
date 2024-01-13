import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

import creds from "../serverless-metrics-fa47d69392ab.json";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.file"];
const SHEET_KEY = "1Ln10QZC8n_1PWnVFtD1HupgS0j4RM85glGndSXxj7P4";

const serviceAccountAuth = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: SCOPES,
});

export const FishDoc = new GoogleSpreadsheet(SHEET_KEY, serviceAccountAuth);
