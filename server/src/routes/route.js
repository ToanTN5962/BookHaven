function route(app){
    app.use("/api/auth", require("./auth.route"));
    app.use("/api/complaints", require("./complaint.route"));
    app.use("/api/users", require("./users.route"));
}

module.exports = route;