import { createClient } from "@xlabs-libs/wormscan-sdk";
const client = createClient(process.env.WORMSCAN_API_BASE_URL);
export default client;
