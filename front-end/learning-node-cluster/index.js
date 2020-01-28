const cluster = require('cluster')
const http = require('http')
const os = require('os')

const cpusLen = os.cpus().length / 2

if (cluster.isMaster) {
    console.log('Master process started with PID:', process.pid)
    for (let i=0; i<cpusLen; i++) {
        cluster.fork()
    }
    cluster.on('death', (worker) => {
        console.log('Worker ' + worker.pid + 'died')
        cluster.fork()
    })
} else {
    console.log('Worker process started with PID:', process.pid)
    http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end('hello world\n')
    }).listen(3000)
}