class Driver {
    constructror(name){
        this.id = Math.floor(Math.random()*1000000)
        this.name = name
        this.in_ride = false
    }
}

module.exports = Driver