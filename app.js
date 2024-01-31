const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const OrderingApp = require('./orderingApp')


const app =express()
const server = http.createServer(app)
const io= socketIO(server)
const path = require('path')

//Routes
app.get('/', (req,res)=>{
    res.send('Welcome to Order App')
})

app.get('/sender', (req,res)=>{
    res.sendFile(path.join(__dirname + '/sender.html'))
})

app.get('/driver', (req,res)=>{
    res.sendFile(path.join(__dirname + '/driver.html'))
})

const orderingApp = new OrderingApp()

io.on('connection', (socket)=>{
    console.log('A user is Connected', socket.id)

    socket.on('join',(user_type, Username)=>{
        const userInfo={
            socket: socket,
            user_type:user_type,
            name:Username
        }

        orderingApp.joinSession(userInfo)
    })

    socket.on('requestOrder', (order)=>{
        orderingApp.requestOrder(order)
    })
    socket.on('acceptOrder', (id, driverId)=>{
        orderingApp.acceptOrder(id, driverId)
    })
    socket.on('rejectOrder', (id, driverId)=>{
        orderingApp.rejectOrder(id, driverId)
    })
    socket.on('finishRide', (id, driverId)=>{
        orderingApp.finishRide(id, driverId)
    })

})
const PORT = 3600
server.listen(PORT, ()=>{
    console.log('app listening')
})
