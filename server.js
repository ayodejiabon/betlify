const dotenv = require('dotenv');
const cluster = require('cluster');
const os = require('os');
dotenv.config({path: './config.env'});
const app = require('./app');

const port = process.env.PORT || 3000;


// const numCpu = os.cpus().length;

// if (cluster.isMaster) {

// 	for (let i = 0; i < numCpu; i++) {
// 		cluster.fork()
// 	}
// 	//to kill cluster
// 	//cluster.worker.kill();

// 	cluster.on('exit', (Worker, code, signal) => {
// 		//console.log('worker died', worker.process.pid);
// 		cluster.fork();
// 	});

// }else{

// 	const server = app.listen(port, function(err){
// 	    if (err) console.log("Error in server setup")
// 	    console.log("Server listening on port", process.pid);
// 	});
// }


const server = app.listen(port, function(err){
    if (err) console.log("Error in server setup")
    console.log("Server listening on port", port);
});

// process.on('uncaughtException', err => {
// 	process.exit(1);
// });

// process.on('unhandledRejection', err => {
// 	server.close(() => {
// 		process.exit(1);
// 	})
// });