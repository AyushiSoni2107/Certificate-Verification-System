import app from "../src/app.js";
import { connectDb } from "../src/utils/connectDb.js";

let dbConnectionPromise;

const ensureDatabaseConnection = () => {
  if (!dbConnectionPromise) {
    dbConnectionPromise = connectDb();
  }

  return dbConnectionPromise;
};

export default async function handler(req, res) {
  await ensureDatabaseConnection();
  return app(req, res);
}
