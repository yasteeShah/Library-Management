const AWS = require('aws-sdk');
AWS.config.update({
    region: "us-east-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var table = "issuedbook";

var getItems = (id,callback) => {   
  
    var params = {
        TableName: table,
        Key: {
            "LibraryID": id
        },
    };

    docClient.get(params, function (err, data) {
        callback(err, data);
    });

};

module.exports = {
    getItems
};
