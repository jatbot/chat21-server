# chat21-server

# LOCALHOST REST API

## Signup

```
curl -v -X POST -d 'email=andrea.leo@f21.it&password=123456' http://localhost:3200/auth/signup
```
```
curl -v -X POST -d 'email=andrea.leo@f21.it&password=123456' https://chat21-server.herokuapp.com/auth/signup
```



## Signin

```
curl -v -X POST -d 'email=andrea.leo@f21.it&password=123456' http://localhost:3200/auth/signin
```

curl -v -X POST http://localhost:3200/auth/signinAnonymously


## App

### Create

```
curl -v -X POST -H 'Content-Type:application/json' -u andrea.leo@f21.it:123456 -d '{"name":"testprj"}' http://localhost:3200/apps
```

```
curl -v -X POST -H 'Content-Type:application/json' -u andrea.leo@f21.it:123456 -d '{"name":"testprj"}' https://chat21-server.herokuapp.com/apps
```


## Group

### Create

```
curl -v -X POST -H 'Content-Type:application/json' -u andrea.leo@f21.it:123456 -d '{"group_name":"g1","group_members":{"io":1}}' http://localhost:3200/app1/groups

```

```
curl -v -X POST -H 'Content-Type:application/json' -u andrea.leo@f21.it:123456 -d '{"group_name":"g1","group_members":{"io":1}}' https://chat21-server.herokuapp.com/app1/groups

```

## Message

### Send Direct

```
curl -v -X POST -H 'Content-Type: application/json'  -u andrea.leo@f21.it:123456 -d '{"sender_fullname":"SFN", "text": "hi"}' http://localhost:3200/app1/conversations/recipient_id/messages
```
```
curl -v -X POST -H 'Content-Type: application/json'  -u andrea.leo@f21.it:123456 -d '{"sender_fullname":"SFN", "text": "hi"}' https://chat21-server.herokuapp.com/app1/conversations/recipient_id/messages
```

### Send Group
```
curl -v -X POST -H 'Content-Type: application/json'  -u andrea.leo@f21.it:123456 -d '{"sender_fullname":"SFN", "text": "hi","channel_typ":"group"}' http://localhost:3200/app1/conversations/g1/messages
```

## Conversation
### Get
```
curl -v -X GET   -u andrea.leo@f21.it:123456  http://localhost:3200/app1/conversations/recipient_id
```


## Subscription

### Create

```
curl -v -X POST -H 'Content-Type:application/json' -u andrea.leo@f21.it:123456 -d '{"target":"https://webhook.site/ab85eb43-3a3e-4bdb-a098-e467c6bbb7cc","event":"message.create"}' http://localhost:3200/app1/subscriptions
```