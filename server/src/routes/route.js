function route(app){
    app.use("/api/auth", require("./auth.route"));
    app.use("/api/complaints", require("./complaint.route"));
    app.use("/api/users", require("./users.route"));
    app.use("/api/books", require("./books.route"));
    app.use("/api/admin", require("./admin.route"));
    app.use("/api/review", require("./review.route"));
    app.use("/api/notifications", require("./notification.route"));
}

module.exports = route;
