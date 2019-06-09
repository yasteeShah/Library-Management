const AWS = require('aws-sdk');
var Book = require("./book");
var Author = require("./author");
var Registration= require("./Registration");
var DBHandler=require("./DBHandler");
var Issuedbook=require("./Issuedbook");
var APP_ID = 'amzn1.ask.skill.6d7e4a57-249c-4466-97c4-871a7c967b7f';
/*amzn1.ask.skill.6d7e4a57-249c-4466-97c4-871a7c967b7f*/


exports.handler = (event, context, callback) => {
    try {
        
         if (APP_ID !== '' && event.session.application.applicationId !== APP_ID) {
            context.fail('Invalid Application ID');
        }
        
        var request = event.request;
        var docClient = new AWS.DynamoDB.DocumentClient();
        let options = {};
        var count=0;
        var ava_books = 0;
        var bookid;
        if (request.type === "LaunchRequest") {
            var para = {
                TableName: "book",
                Key:{
                    "id": 0
                }
            };
            docClient.delete(para, function(err, data) {
                if (err) {
                    context.fail(err);
                } else {
                }
            });
            var param = {
                TableName: "author",
                Key:{
                    "id": 0
                }
            };
            docClient.delete(param, function(err, data) {
                if (err) {
                    context.fail(err);
                } else {
                }
            });
            context.succeed(buildResponse({
                speechText: "Welcome to library, You can ask me for any of the book which you want.",
                repromptText: "You can say for example, home remedy for headache",
                endSession: false
            }));
        }
        else if (request.type === "IntentRequest") {
            if (request.intent.name === "CheckBookIntent") {
                var bookName = request.intent.slots.bookname.value;
                var Id=0;
                var check=0;
                var author='';
                var par = {
                    TableName: "book",
                    Key:{
                        "id": 0
                    },
                    UpdateExpression: "set BookName = :newBookName",
                    ExpressionAttributeValues: {
                        ":newBookName" : bookName,
                    },
                    ReturnValues:"UPDATED_NEW"
                };
                docClient.update(par, (() => {
                                        
                }));
                Author.getItems(Id,function (err, data) {
                        if (err) {
                            context.fail(err);
                        }
                        else{
                            if (data.Item !== undefined) {
                                author=data.Item.AuthorName;
                                var param={
                                    TableName: "bookdata"
                                };
                                docClient.scan(param,function(err,data){
                                if(err){
                                    context.fail(err);
                                }
                                else{
                                    data.Items.forEach(function(element, index, array) {
                                        if(element.Author == author && element.BookName == bookName){
                                            bookid=element.BookId;
                                            check=element.AvailableBooks;
                                             var param = {
                                                TableName: "temp",
                                                Key:{
                                                    "Id": "0"
                                                },
                                                UpdateExpression: "set BookId = :newBookId, BookName = :newBookName, AuthorName = :newAuthorName",
                                                ExpressionAttributeValues: {
                                                    ":newBookId" : bookid,
                                                    ":newBookName" : bookName,
                                                    ":newAuthorName" : author
                                                },
                                                ReturnValues:"UPDATED_NEW"
                                            };
                                            docClient.update(param, (() => {
                                            }));
                                            options.speechText = "yes, " + bookName +" by " + author + " is available , If you want it then please give me your id number";
                                            options.endSession = false;
                                            context.succeed(buildResponse(options)); 
                                        }
                                    });
                                     if(check==0){
                                        options.speechText = "Sorry, " + bookName +" by " + author + " is not available.";
                                        options.endSession = false;
                                        context.succeed(buildResponse(options)); 
                                    }
                                    }
                                });
                            }
                            else{
                                var params={
                                    TableName: "bookdata"
                                };
                                docClient.scan(params,function(err,data){
                                    if(err){
                                        context.fail(err);
                                    }
                                    else{
                                        data.Items.forEach(function(element, index, array) {
                                            if(element.BookName == bookName){
                                                if(count==0){
                                                    bookid=element.BookId;
                                                    author=author+element.Author;
                                                    check=element.AvailableBooks;
                                                }
                                                else
                                                    author=author+ " ," +element.Author;
                                                count++;
                                            }
                                        });
                                        if(count==1){
                                             var param = {
                                                TableName: "temp",
                                                Key:{
                                                    "Id": "0"
                                                },
                                                UpdateExpression: "set BookId = :newBookId, BookName = :newBookName, AuthorName = :newAuthorName",
                                                ExpressionAttributeValues: {
                                                    ":newBookId" : bookid,
                                                    ":newBookName" : bookName,
                                                    ":newAuthorName" : author
                                                },
                                                ReturnValues:"UPDATED_NEW"
                                            };
                                            docClient.update(param, (() => {
                                            }));
                                            options.speechText = "yes, " + bookName +" by " + author + " is available , If you want it then please give me your id number";
                                    
                                            }
                                        else if(count>1)
                                            options.speechText = "yes, " + bookName +" by " + count + " authors " + author + " is available , which author's book you want? ";
                                        else
                                            options.speechText = "I am Sorry, I couldn't find any data!";
                                        options.endSession = false;
                                        context.succeed(buildResponse(options)); 
                                    }
                                });
                            }
                        }
                });
            }
            else if (request.intent.name === "CheckAuthorIntent") {
                var Id = 0;
                var check=0;
                var book='';
                var authorName = request.intent.slots.authorname.value;
                var author = authorName.toLowerCase();
                var par = {
                    TableName: "author",
                    Key:{
                        "id": 0
                    },
                    UpdateExpression: "set AuthorName = :newAuthorName",
                    ExpressionAttributeValues: {
                        ":newAuthorName" : author,
                    },
                    ReturnValues:"UPDATED_NEW"
                };
                docClient.update(par, (() => {
                                        
                }));
                Book.getItems(Id,function (err, data) {
                        if (err) {
                            context.fail(err);
                        }
                        else{
                            if (data.Item !== undefined) {
                                book=data.Item.BookName;
                                var param={
                                    TableName: "bookdata"
                                };
                                docClient.scan(param,function(err,data){
                                if(err){
                                    context.fail(err);
                                }
                                else{
                                    data.Items.forEach(function(element, index, array) {
                                        if(element.Author == author && element.BookName == book){
                                            bookid=element.BookId;
                                            check=1;
                                             var param = {
                                                TableName: "temp",
                                                Key:{
                                                    "Id": "0"
                                                },
                                                UpdateExpression: "set BookId = :newBookId, BookName = :newBookName, AuthorName = :newAuthorName",
                                                ExpressionAttributeValues: {
                                                    ":newBookId" : bookid,
                                                    ":newBookName" : book,
                                                    ":newAuthorName" : author
                                                },
                                                ReturnValues:"UPDATED_NEW"
                                            };
                                            docClient.update(param, (() => {
                                            }));
                                            options.speechText = "yes, " + book +" by " + author + " is available , If you want it then please give me your id number";
                                            options.endSession = false;
                                            context.succeed(buildResponse(options)); 
                                        }
                                    });
                                    }
                                    if(check==0){
                                        options.speechText = "Sorry, " + book +" by " + author + " is not available.";
                                        options.endSession = false;
                                        context.succeed(buildResponse(options)); 
                                    }
                                });
                            }
                           else{
                                var param={
                                    TableName: "bookdata"
                                };
                                docClient.scan(param,function(err,data){
                                    if(err){
                                        context.fail(err);
                                    }
                                    else{
                                        data.Items.forEach(function(element, index, array) {
                                            if(element.Author == author){
                                                if(count==0){
                                                    bookid=element.BookId;
                                                    book=book+element.BookName;
                                                }
                                                else
                                                    book=book+ " and " +element.BookName;
                                                count++;
                                            }
                                        });
                                        if(count==1){
                                            var param = {
                                                TableName: "temp",
                                                Key:{
                                                    "Id": "0"
                                                },
                                                UpdateExpression: "set BookId = :newBookId, BookName = :newBookName, AuthorName = :newAuthorName",
                                                ExpressionAttributeValues: {
                                                    ":newBookId" : bookid,
                                                    ":newBookName" : book,
                                                    ":newAuthorName" : author
                                                },
                                                ReturnValues:"UPDATED_NEW"
                                            };
                                            docClient.update(param, (() => {
                                            }));
                                            options.speechText = "yes, " + book +" by " + author + " is available , If you want it then please give me your id number";
                                        }
                                        else if(count>1)
                                            options.speechText = "yes, Total " + count + " books " + book +" by " + author + " are available , which book you want? ";
                                        else
                                            options.speechText = "I am Sorry, I couldn't find any data!";
                                        options.endSession = false;
                                        context.succeed(buildResponse(options));
                                    }
                                });
                            }
                        }
                });
                //var authorName = request.intent.slots.authorname.value;
             //   var author = authorName.toLowerCase();
              //  var book='';
            /*    var param={
                    TableName: "charusat_bookdata"
                };
                docClient.scan(param,function(err,data){
                    if(err){
                        context.fail(err);
                    }
                    else{
                        data.Items.forEach(function(element, index, array) {
                            if(element.Author == author){
                                if(count==0)
                                    book=book+element.BookName;
                                else
                                    book=book+ " and " +element.BookName;
                                count++;
                            }
                        });
                        if(count==1)
                            options.speechText = "yes, " + book +" by " + author + " is available , If you want it then please give me your id number";
                        else if(count>1)
                            options.speechText = "yes, " + book +" by " + author + " are available , which book you want? ";
                        else
                             options.speechText = "I am Sorry, I couldn't find any data!";
                        options.endSession = false;
                        context.succeed(buildResponse(options)); 
                    }
                });*/
            }
            else if (request.intent.name === "StudentIntent") {
                var idNo = request.intent.slots.idnumber.value;
                
                            Registration.getItems(idNo, function (err, data) {
                                if (err) {
                                    context.fail(err);
                                } else {
                                    if (data.Item !== undefined) {
                                        var param = {
                                            TableName: "temp2",
                                            Key:{
                                                "Id": "0"
                                            },
                                            UpdateExpression: "set StudentID = :newStudentID, LibraryID = :newLibraryID, EmailID= :newEmailID",
                                            ExpressionAttributeValues: {
                                                ":newStudentID" : idNo,
                                                ":newLibraryID" : data.Item.LibraryID,
                                                ":newEmailID" : data.Item.EmailID
                                            },
                                            ReturnValues:"UPDATED_NEW"
                                        };
                                        docClient.update(param, (() => {
                                            options.speechText = "Please give me your Librarycard number";
                                            options.endSession = false;
                                            context.succeed(buildResponse(options));
                                        }));
                            
                                    }
                                    else{
                                        options.speechText = "Invalid StudentID !! You have not issued your library card yet.";
                                        options.endSession = false;
                                        context.succeed(buildResponse(options));
                                    }
                                }
                            });
              
            }
            else if (request.intent.name === "LibraryIDIntent") {
                
                var lib_id = request.intent.slots.libraryid.value;
                
                /*options.speechText = lib_id;
                options.endSession = false;
                context.succeed(buildResponse(options));*/
                
                var params={
                    TableName:"temp2",
                    Key: {
                        "Id": "0"
                    },
                };
                docClient.get(params,function (err, data) {
                    if(err){
                        context.fail(err);
                    }
                    else{
                        if(data.Item!==undefined){
                           var stu_id = data.Item.StudentID;
                           var Lib_id = data.Item.LibraryID;
                           var Email = data.Item.EmailID;
                           
                            /*options.speechText = "lib" + Lib_id;
                            options.endSession = false;
                            context.succeed(buildResponse(options));*/
                           
                           if(Lib_id === lib_id){
                                var params={
                                    TableName:"temp",
                                    Key: {
                                        "Id": "0"
                                    },
                                };
                                docClient.get(params,function (err, data) {
                                    if(err){
                                        context.fail(err);
                                    }
                                    else{
                                        if(data.Item!==undefined){
                                            var book = data.Item.BookName;
                                            var author = data.Item.AuthorName;
                                            var bid= data.Item.BookId;
                                            
                                          /*  options.speechText = bid;
                                            options.endSession = false;
                                            context.succeed(buildResponse(options));*/
                                        
                                        
                                            DBHandler.getItems(bid, function (err, data) {
                                                if (err) {
                                                    context.fail(err);
                                                } else {
                                                    if(data.Item !== undefined){
                                                        ava_books = data.Item.AvailableBooks;
                                                        if(ava_books==0){
                                                            options.speechText = "Sorry, all the "+data.Item.BookName+" books are already issued ! check after some days.";
                                                            options.endSession = false;
                                                            context.succeed(buildResponse(options));
                                                        }
                                                        else{
                                                            ava_books = ava_books-1;
                                                            
                                                            
                                                            Issuedbook.getItems(Lib_id,function(err, data) {
                                                                if(err){
                                                                    context.fail(err);
                                                                } 
                                                                else{
                                                                    if(data.Item !== undefined){
                                                                        var d = new Date();
                                                                        var theMonth = d.getMonth()+ 2;
                                                                        if(theMonth == 13){
                                                                            theMonth = 1;
                                                                        }
                                                                        var theDay = d.getDate();
                                                                        if(theDay == 31){
                                                                            theDay=30;
                                                                        }
                                                                        var theYear = d.getFullYear();
                                                                        var formattedDueDate = theYear + "-" + theMonth + "-" + theDay;
                                                                        
                                                                        var d = new Date();
                                                                        var theMonth = d.getMonth()+ 1;
                                                                        var theDay = d.getDate();
                                                                        var theYear = d.getFullYear();
                                                                        var formattedIssuedDate = theYear + "-" + theMonth + "-" + theDay;
                                                                        
                                                                        if(data.Item.BookName2 === undefined){
                                                                            var par={
                                                                                TableName:"bookdata",
                                                                                Key :{
                                                                                    "BookId" : bid,
                                                                                },
                                                                                UpdateExpression: "set AvailableBooks = :newImageNumber",
                                                                                ExpressionAttributeValues: {
                                                                                    ":newImageNumber" : ava_books
                                                                                },
                                                                                ReturnValues:"UPDATED_NEW"
                                                                            };
                                                                            docClient.update(par, (() => {
                                                                                options.speechText =book + " book is issued by you take it from the library.";
                                                                                options.endSession = false;
                                                                                context.succeed(buildResponse(options));
                                                                            }));
                                                            
                                                                            var par={
                                                                                TableName:"issuedbook",
                                                                                Key :{
                                                                                    "LibraryID" : Lib_id,
                                                                                },
                                                                                UpdateExpression: " set BookName2 = :book2, AuthorName2 = :author2, IssuedDate2 = :issuedDate2, DueDate2 = :dueDate2",
                                                                                ExpressionAttributeValues:{
                                                                                    ":book2" : book,
                                                                                    ":author2" : author,
                                                                                    ":issuedDate2" : formattedIssuedDate ,
                                                                                    ":dueDate2" : formattedDueDate
                                                                                },
                                                                                ReturnValues:"UPDATED_NEW"
                                                                            };
                                            
                                                                            docClient.update(par, (() => {
                                                                               
                                                                            }));  
                                                                        }
                                                                        else if(data.Item.BookName3 === undefined){
                                                                            var par={
                                                                                TableName:"bookdata",
                                                                                Key :{
                                                                                    "BookId" : bid,
                                                                                },
                                                                                UpdateExpression: "set AvailableBooks = :newImageNumber",
                                                                                ExpressionAttributeValues: {
                                                                                    ":newImageNumber" : ava_books
                                                                                },
                                                                                ReturnValues:"UPDATED_NEW"
                                                                            };
                                                                            docClient.update(par, (() => {
                                                                                options.speechText =book + " book is issued by you take it from the library.";
                                                                                options.endSession = false;
                                                                                context.succeed(buildResponse(options));
                                                                            }));
                                                            
                                                                            var par={
                                                                                TableName:"issuedbook",
                                                                                Key :{
                                                                                    "LibraryID" : Lib_id,
                                                                                },
                                                                                UpdateExpression: " set BookName3 = :book3, AuthorName3 = :author3, IssuedDate3 = :issuedDate3, DueDate3 = :dueDate3",
                                                                                ExpressionAttributeValues:{
                                                                                    ":book3" : book,
                                                                                    ":author3" : author,
                                                                                    ":issuedDate3" : formattedIssuedDate,
                                                                                    ":dueDate3": formattedDueDate
                                                                                },
                                                                                ReturnValues:"UPDATED_NEW"
                                                                            };
                                            
                                                                            docClient.update(par, (() => {
                                                                               
                                                                            })); 
                                                                        }else{
                                                                            options.speechText = "Sorry, you can't issued more than three books!! you have already issued "+data.Item.BookName1 +" "+data.Item.BookName2+" and "+data.Item.BookName3+ " books";
                                                                            options.endSession = false;
                                                                            context.succeed(buildResponse(options));
                                                                        }
                                                                        
                                                                    }
                                                                    else{
                                                                        var par={
                                                                            TableName:"bookdata",
                                                                            Key :{
                                                                                "BookId" : bid,
                                                                            },
                                                                            UpdateExpression: "set AvailableBooks = :newImageNumber",
                                                                            ExpressionAttributeValues: {
                                                                                ":newImageNumber" : ava_books
                                                                            },
                                                                            ReturnValues:"UPDATED_NEW"
                                                                        };
                                                                        docClient.update(par, (() => {
                                                                            options.speechText =book + " book is issued by you take it from the library.";
                                                                            options.endSession = false;
                                                                            context.succeed(buildResponse(options));
                                                                        }));
                                                                        
                                                                        var d = new Date();
                                                                        var theMonth = d.getMonth()+ 2;
                                                                        if(theMonth == 13){
                                                                            theMonth = 1;
                                                                        }
                                                                        var theDay = d.getDate();
                                                                        if(theDay == 31){
                                                                            theDay=30;
                                                                        }
                                                                        var theYear = d.getFullYear();
                                                                        var formattedDueDate = theYear + "-" + theMonth + "-" + theDay;
                                                                        
                                                                        var d = new Date();
                                                                        var theMonth = d.getMonth()+ 1;
                                                                        var theDay = d.getDate();
                                                                        var theYear = d.getFullYear();
                                                                        var formattedIssuedDate = theYear + "-" + theMonth + "-" + theDay;
                                                                        
                                                                        var par={
                                                                            TableName:"issuedbook",
                                                                            Item:{
                                                                                LibraryID : Lib_id,
                                                                                StudentID : stu_id,
                                                                                EmailID : Email,
                                                                                BookName1 : book,
                                                                                AuthorName1 : author,
                                                                                IssuedDate1 : formattedIssuedDate,
                                                                                DueDate1: formattedDueDate
                                                                            },
                                                                        };
                                                                        docClient.put(par, function (err, data) {
                                                                            if(err){
                                                                                options.speechText = "error";
                                                                                options.endSession = false;
                                                                                context.succeed(buildResponse(options));
                                                                            }
                                                                            else{
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    }
                                                }
                                            }); 
                                       }
                                    }
                                });   
                                    
                           }else{
                                options.speechText = "Invalid Library ID";
                                options.endSession = false;
                                context.succeed(buildResponse(options));
                           }
                        }
                    }
                });
            }
            else if (request.intent.name === "AMAZON.StopIntent" || request.intent.name === "AMAZON.CancelIntent") {
                options.speechText = "ok, thanks for using my skill.";
                options.endSession = true;
                context.succeed(buildResponse(options));
            }

            else {
                context.fail("Unknown Intent");
            }
        }
    }catch (e) {}
};

function buildResponse(options) {
    var response = {
        version: "1.0",
        response: {
            outputSpeech: {
                "type": "SSML",
                "ssml": `<speak>${options.speechText}</speak>`
            },
             shouldEndSession: options.endSession
           
        }
    };
    return response;
}

