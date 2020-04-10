const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const menu = require('./handlers/menu');
app.use('/menu', menu)

app.listen(3000, () => {
  console.log('started')
});

export default app;
