const express = require('express');

const app = express();

app.get('*', (req, res) => {
    res.end('handleCallback({"status": true, "user": "admin"})')
})

app.listen(3000, () => {
    console.log('http server run on http://localhost:3000')
})