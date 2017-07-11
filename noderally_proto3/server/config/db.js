var host = process.env.mongodb || 'localhost';
console.log("env", host);
module.exports = {
  "url": "mongodb://" + host + ":27017/rallygame"
}