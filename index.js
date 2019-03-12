const env = require('dotenv').config().parsed;
const app = require('./server')(env);

const { PORT, DOMAIN } = env;
app.listen(PORT, () => console.log(`Listening on ${DOMAIN}`));
