const AWS = require('aws-sdk');
AWS.config.update({
    region: "us-east-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var table = "Student_Registration";

var getItems = (id,callback) => {   
  
    var params = {
        TableName: table,
        Key: {
            "StudentID": id
        },
    };

    docClient.get(params, function (err, data) {
        callback(err, data);
    });

};

module.exports = {
    getItems
};
