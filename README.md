# chat21-server

# LOCALHOST REST API

## Signup

```
curl -v -X POST -d 'email=andrea.leo@f21.it&password=123456' http://localhost:3200/auth/signup
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

## Sub

### Create

```
curl -v -X POST -H 'Content-Type:application/json' -u andrea.leo@f21.it:123456 -d '{"target":"https://webhook.site/ab85eb43-3a3e-4bdb-a098-e467c6bbb7cc","event":"message.create"}' http://localhost:3200/app1/subscriptions
```


## Message

### Create

```
curl -v -X POST -H 'Content-Type: application/json'  -u andrea.leo@f21.it:123456 -d '{"sender_fullname":"SFN", "text": "hi"}' http://localhost:3200/app1/conversations/recipient_id/messages
```

## Conversation
### Get
```
curl -v -X GET   -u andrea.leo@f21.it:123456  http://localhost:3200/app1/conversations/recipient_id
```
