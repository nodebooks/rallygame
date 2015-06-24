var Config = {
  // Contents of this file will be send to the client,
  // do not put any hazardous data here
  "domain":     process.env.OPENSHIFT_APP_DNS || '127.0.0.1',

  "serverip":   process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
  "serverport": process.env.OPENSHIFT_NODEJS_PORT || '8080',
  "clientport": (process.env.OPENSHIFT_NODEJS_PORT) ? '8000':'8080',
  "protocol":   'ws://',
  
  "wsclientopts": { reconnection: true, 
                    reconnectionDelay: 2000,
                    reconnectionAttempts: 10,
                    secure: false
  },
  "cpus": require('os').cpus().length,
  "workernameprefix": 'node_worker',
  "mastername" : 'node_master',

  "sockets": {
    "worker":     '/tmp/worker', // + cluster.worker.id + '.sock'
    "master":     '/tmp/master.sock'
  }
};

module.exports = Config;