const express = require('express');

const app = express();

app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000 //look for environment variable called PORT to use (heroku will grab or default to 5000)

app.listen(PORT, () => console.log(`Server started on port ${PORT}`)); //connect to port and log if successful

