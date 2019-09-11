const express = require("express");
const mongoose = require("mongoose");
const databaseConfig = require("./config/database");
const validate = require("express-validation");
const Youch = require("youch");

class App {
	constructor() {
		this.express = express();
		this.isDev = process.env.NODE_ENV !== "production";

		this.database();
		this.middlewares();
		this.routes();
		this.exception();
	}

	database() {
		mongoose.connect(databaseConfig.uri, {
			useCreateIndex: true,
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
	}

	middlewares() {
		this.express.use(express.json());
	}

	routes() {
		this.express.use(require("./routes"));
	}

	exception() {
		this.express.use(async (err, req, res, next) => {
			if (err instanceof validate.ValidationError) {
				return res.status(err.status).json(err);
			}

			if (process.env.NODE_ENV !== "production") {
				const youch = new Youch(err, req);
				return res.send(await youch.toHTML());
			}

			return res
				.status(err.status || 500)
				.json({ error: "Internal Server Error" });
		});
	}
}

module.exports = new App().express;
