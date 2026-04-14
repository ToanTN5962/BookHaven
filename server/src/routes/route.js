function route(app){
    app.use("/api/auth", require("./auth.route"));
    
}

module.exports = route;