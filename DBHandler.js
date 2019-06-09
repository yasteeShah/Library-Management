const AWS = require('aws-sdk');
AWS.config.update({
    region: "us-east-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var table = "bookdata";

var getItems = (bid,callback) => {   
  
    var params = {
        TableName: table,
        Key: {
            "BookId": bid
        },
    };

    docClient.get(params, function (err, data) {
        callback(err, data);
    });

};

module.exports = {
    getItems
};
