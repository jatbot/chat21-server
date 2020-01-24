//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

var User = require('../models/user');
var Message = require('../models/message');
var Conversation = require('../models/conversation');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();

// chai.config.includeStack = true;

var expect = chai.expect;
var assert = chai.assert;

chai.use(chaiHttp);

describe('MessageRoute', () => {

  describe('/send', () => {
 
   
    // curl -v -X POST -H 'Content-Type: application/json'  -u andrea.leo@f21.it:123456 -d '{"sender_fullname":"SFN", "text": "hi"}' http://localhost:3200/app1/conversations/recipient_id/messages
    it('sendDirect', (done) => {
        var email = "andrea.leo-"+ Date.now() + "@email.com";
        var pwd = "123456"
                     
        
        chai.request(server)
        .post('/auth/signup')
        .auth(email, pwd)
        .send({email:email, password: pwd})
        .end((err, res) => {
            //console.log("res",  res);
            console.log("res.body",  res.body);
            res.should.have.status(200);
            res.body.should.be.a('object');
             var user = res.body.user;                                                                         
        
            //  {"type":"text","channel_type":"direct","_id":"5e2b6afaf77008c211ef939a","message_id":"0c748fd2-169b-41fa-9def-30f57225cab0","sender_id":"5e2b69cb08e53bb770ef9e7e","sender_fullname":"SFN","recipient_id":"recipient_id","text":"hi","app_id":"app1","createdBy":"5e2b69cb08e53bb770ef9e7e","timelineOf":"5e2b69cb08e53bb770ef9e7e","path":"/apps/app1/users/5e2b69cb08e53bb770ef9e7e/messages/recipient_id","status":"sent","createdAt":"2020-01-24T22:08:58.211Z","updatedAt":"2020-01-24T22:08:58.211Z","__v":0}
            chai.request(server)
                .post('/app1/conversations/recipient_id/messages')
                .auth(email, pwd)
                .send({"sender_fullname":"SFN", "text": "hi"})
                .end((err, res) => {
                    //console.log("res",  res);
                    console.log("res.body",  res.body);
                    res.should.have.status(200);
                    res.body.should.be.a('object');

                    expect(res.body.channel_type).to.equal("direct");                                                                                                                                                                              
                    expect(res.body.sender_id).to.equal(user._id);                                                                              
                    expect(res.body.text).to.equal("hi");                                                                              
                    expect(res.body.recipient_id).to.equal("recipient_id");  
                    expect(res.body.type).to.equal("text");                                                                              
                    expect(res.body.sender_fullname).to.equal("SFN");                                                                              
                    expect(res.body.timelineOf).to.equal(user._id);                                                                              
                    
                    Message.find({message_id: res.body.message_id, timelineOf:"recipient_id"}, function(err, recipientMessages) {
                        expect(recipientMessages.length).to.equal(1);   
                        var recipientMessage = recipientMessages[0];
                        expect(recipientMessage.channel_type).to.equal("direct");                                                                                                                                                                              
                        expect(recipientMessage.sender_id).to.equal(user._id);                                                                              
                        expect(recipientMessage.text).to.equal("hi");                                                                              
                        expect(recipientMessage.recipient_id).to.equal("recipient_id");  
                        expect(recipientMessage.type).to.equal("text");                                                                              
                        expect(recipientMessage.sender_fullname).to.equal("SFN");                                                                              
                        expect(recipientMessage.timelineOf).to.equal("recipient_id"); 

                        Conversation.find({sender: res.body.sender_id, recipient: res.body.recipient_id, timelineOf:res.body.sender_id}, function(err, senderConversations) {
                            expect(senderConversations.length).to.equal(1);   
                            var senderConversation = senderConversations[0];
                            expect(senderConversation.channel_type).to.equal("direct");                                                                                                                                                                              
                            expect(senderConversation.sender).to.equal(user._id);                                                                              
                            expect(senderConversation.last_message_text).to.equal("hi");                                                                              
                            expect(senderConversation.recipient).to.equal("recipient_id");  
                            expect(senderConversation.type).to.equal("text");                                                                              
                            expect(senderConversation.sender_fullname).to.equal("SFN");                                                                              
                            expect(senderConversation.timelineOf).to.equal(res.body.sender_id); 


                            Conversation.find({sender: res.body.sender_id, recipient: res.body.recipient_id, timelineOf:res.body.recipient_id}, function(err, recipientConversations) {
                                expect(recipientConversations.length).to.equal(1);   
                                var recipientConversation = recipientConversations[0];
                                expect(recipientConversation.channel_type).to.equal("direct");                                                                                                                                                                              
                                expect(recipientConversation.sender).to.equal(user._id);                                                                              
                                expect(recipientConversation.last_message_text).to.equal("hi");                                                                              
                                expect(recipientConversation.recipient).to.equal("recipient_id");  
                                expect(recipientConversation.type).to.equal("text");                                                                              
                                expect(recipientConversation.sender_fullname).to.equal("SFN");                                                                              
                                expect(recipientConversation.timelineOf).to.equal(res.body.recipient_id); 
    
    
                            done();
                        });
                    });
                });
                    
                });

        });


           

           
                
    // }).timeout(20000);






       // curl -v -X POST -H 'Content-Type: application/json'  -u andrea.leo@f21.it:123456 -d '{"sender_fullname":"SFN", "text": "hi","channel_typ":"group"}' http://localhost:3200/app1/conversations/g1/messages
       it('sendGroup', (done) => {
        var email = "andrea.leo-"+ Date.now() + "@email.com";
        var pwd = "123456"
                     
        
        chai.request(server)
        .post('/auth/signup')
        .auth(email, pwd)
        .send({email:email, password: pwd})
        .end((err, res) => {
            //console.log("res",  res);
            console.log("res.body",  res.body);
            res.should.have.status(200);
            res.body.should.be.a('object');
             var user = res.body.user;                                                                         
        
            //  {"type":"text","channel_type":"group","_id":"5e2b6afaf77008c211ef939a","message_id":"0c748fd2-169b-41fa-9def-30f57225cab0","sender_id":"5e2b69cb08e53bb770ef9e7e","sender_fullname":"SFN","recipient_id":"recipient_id","text":"hi","app_id":"app1","createdBy":"5e2b69cb08e53bb770ef9e7e","timelineOf":"5e2b69cb08e53bb770ef9e7e","path":"/apps/app1/users/5e2b69cb08e53bb770ef9e7e/messages/recipient_id","status":"sent","createdAt":"2020-01-24T22:08:58.211Z","updatedAt":"2020-01-24T22:08:58.211Z","__v":0}
            chai.request(server)
                .post('/app1/conversations/g1/messages')
                .auth(email, pwd)
                .send({"sender_fullname":"SFN", "text": "hi", "channel_type":"group"})
                .end((err, res) => {
                    //console.log("res",  res);
                    console.log("res.body",  res.body);
                    res.should.have.status(200);
                    res.body.should.be.a('object');

                    expect(res.body.channel_type).to.equal("group");                                                                                                                                                                              
                    expect(res.body.sender_id).to.equal(user._id);                                                                              
                    expect(res.body.text).to.equal("hi");                                                                              
                    expect(res.body.recipient_id).to.equal("g1");  
                    expect(res.body.type).to.equal("text");                                                                              
                    expect(res.body.sender_fullname).to.equal("SFN");                                                                              
                    expect(res.body.timelineOf).to.equal(user._id);                                                                              
                    
                    Message.find({message_id: res.body.message_id, timelineOf:"messages"}, function(err, recipientMessages) {
                        expect(recipientMessages.length).to.equal(1);   
                        var recipientMessage = recipientMessages[0];
                        expect(recipientMessage.channel_type).to.equal("group");                                                                                                                                                                              
                        expect(recipientMessage.sender_id).to.equal(user._id);                                                                              
                        expect(recipientMessage.text).to.equal("hi");                                                                              
                        expect(recipientMessage.recipient_id).to.equal("g1");  
                        expect(recipientMessage.type).to.equal("text");                                                                              
                        expect(recipientMessage.sender_fullname).to.equal("SFN");                                                                              
                        expect(recipientMessage.timelineOf).to.equal("messages"); 

                        Conversation.find({sender: res.body.sender_id, recipient: res.body.recipient_id, timelineOf:res.body.sender_id}, function(err, senderConversations) {
                            expect(senderConversations.length).to.equal(1);   
                            var senderConversation = senderConversations[0];
                            expect(senderConversation.channel_type).to.equal("group");                                                                                                                                                                              
                            expect(senderConversation.sender).to.equal(user._id);                                                                              
                            expect(senderConversation.last_message_text).to.equal("hi");                                                                              
                            expect(senderConversation.recipient).to.equal("g1");  
                            expect(senderConversation.type).to.equal("text");                                                                              
                            expect(senderConversation.sender_fullname).to.equal("SFN");                                                                              
                            expect(senderConversation.timelineOf).to.equal(res.body.sender_id); 


                            Conversation.find({sender: res.body.sender_id, recipient: res.body.recipient_id, timelineOf:res.body.recipient_id}, function(err, recipientConversations) {
                                expect(recipientConversations.length).to.equal(1);   
                                var recipientConversation = recipientConversations[0];
                                expect(recipientConversation.channel_type).to.equal("group");                                                                                                                                                                              
                                expect(recipientConversation.sender).to.equal(user._id);                                                                              
                                expect(recipientConversation.last_message_text).to.equal("hi");                                                                              
                                expect(recipientConversation.recipient).to.equal("g1");  
                                expect(recipientConversation.type).to.equal("text");                                                                              
                                expect(recipientConversation.sender_fullname).to.equal("SFN");                                                                              
                                expect(recipientConversation.timelineOf).to.equal(res.body.recipient_id); 
    
    
                            done();
                        });
                    });
                });
                    
                });

        });


           

           
                
    }).timeout(20000);





    });
});

});


