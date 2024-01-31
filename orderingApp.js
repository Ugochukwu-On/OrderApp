const Sender = require('./sender')
const Driver = require('./driver')

class OrderingApp{
    constructor(){
        this.senders =[]
        this.drivers =[]
        this.orders =[]
        this.socketUserMap = new Map()
    }
    joinSession({user_type, name, socket}){
        console.log('UserInfo about to be processed')
        this.createUser({socket, name, user_type})
    }

    createUser({socket, name, user_type}){
        switch(user_type){
            case 'driver':
                const driver = new Driver(name);
                    this.drivers.push(driver);
                    this.assignSocket({socket, user: driver});
                    this.sendEvent({socket, data: { driver }, eventname: 'driverCreated'})
                    console.log('Driver created',this.drivers);
                    return driver;
            case 'sender':
                const sender = new Sender (name);
                this.senders.push(sender);
                this.assignSocket({socket, user: sender});
                this.sendEvent({socket, data:{sender}, eventname: 'senderCreated'})
                console.log('Sender created', this.senders)
                return sender;
            default:
                throw new Error('Invalid user type')

        }
    }
    assignSocket({socket, user}){
        this.socketUserMap.set(user.id, socket)
    }

    sendEvent({socket, data, eventname}){
        socket.emit(eventname, data)
    }
    requestOrder({current_location, destination, price, senderId}){
        const sender = this.senders.find(sender=>sender.id == senderId)
        const order = new Order ({current_location,destination,price,sender})

        const timer = setTimeout(() => {
            // codes to execute after 1min
            for(const order of this.orders){
                if(order.status == "pending"){
                    order.status = 'expired'

                const senderSocket = this.socketUserMap.get(sender.id)
                console.log('sending expired order to the sender')
                senderSocket.emit("orderExpired", {order})
                }
            }
        }, 60000)

        const updateOrder = {...order, timer:timer}

        this.orders.push(updateOrder)

        for(const driver of thisdrivers){
            if(driver.in_ride)continue
            const driverSocket = thus.socketUserMap.get(driver.id)
            driverSocket.emit('orderRequested', order)
        }

        return updateOrder
    }
    acceptOrder(id, drivderId){
        const order = this.orders.find(order=>order.id == id)
        const sender = this.senders.find(sender => sender.id == order.sender.id)
        const driver = this.drivers.find(driver=>driver.id==driverId)

        driver.in_ride = true
        order.status ="accepted"
        order.driver = driver
        clearTimeout(order.timer)

        const senderSocket = this.socketUserMap.get(sender.id)
        senderSocket.emit('orderAccepted', {order})

        for(const driver of this.drivers){
            if(driver.id == driverId){
                const driverSocket = this.socketUserMap.get(driver.id)

                driverSocket.emit('orderAccepted', {order})

            }else{
                const otherSocket = this.socketUserMap.get(driver.id)
                otherSocket.emit('orderMissed', {order}) 
            }
            
        }
    }

    rejcetedOrder(id, driverId){
        const order = this.orders.find(order=>order.id==id)
        const sender = this.senders.find(sender=>sender.id == order.sender.id)
        const driver = this.drivers.find(driver=>driver.id == driverId)

        order.status = 'rejected'
        clearTimeout(order.timer)

        const senderSocket = this.socketUserMap.get(sender.id)
        senderSocket.emit('orderRejected', {order})
        
        const driverSocket = this.socketUserMap.get(driver.id)
        driverSocket.emit('orderRejected',{order})
    }
    finishRide(id, driverId){
        const order = this.orders.find(order=>order.id == id)
        const sender = this.senders.find(sender=>sender.id ==order.id)
        const driver = this.drivers.find(driver=>driver.id == driverId)

        driver.in_ride = false 

        const senderSocket = this.socketUserMap.get(sender.id)
        senderSocket.emit("rideFinished", {order})

        const driverSocket = this.socketUserMap.get(sender.id)
        driverSocket.emit('rideFinished', {order})
    }
}


module.exports = OrderingApp