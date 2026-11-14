import { createServer } from "./server.js";
import { config } from "./config.js";

const app = createServer();
app.listen(config.PORT, config.HOST, () => {
  console.log(`Proof Gatekeeper listening on ${config.HOST}:${config.PORT}`);
});
