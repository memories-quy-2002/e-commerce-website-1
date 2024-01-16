const mysql = require('mysql');
const pool = mysql.createPool({
	host: "localhost",
	user: "root",
	password: "",
	database: "e-commerce-shop",
});

pool.getConnection((err) => {
	if (err) {
		console.error("Error connecting to the MySQL database: ", err);
	} else {
		console.log("Connected to MySQL database");
	}
});

const getUserLogin = (request, response) => {
	pool.query("SELECT * FROM user", (error, results) => {
		if (error) {
			console.error(error);
		} else {
			const user = results[0];
			response.status(200).json({
				user
			})
		}
	});
};

const getUserLoginById = (request, response) => {
	const uid = request.params.uid;
	pool.query("SELECT * FROM user WHERE UID = ?", [uid], (error, results) => {
		if (error) {
			console.error(error);
		} else {
			const user = results[0];
			response.status(200).json({
				user
			})
		}
	});
};

const userLogin = (request, response) => {
	const {user} = request.body
	const {username, password, role} = user;
	pool.query("SELECT * FROM user WHERE UName = ?", [username], (error, results) => {
		if (results.length === 0) {
			response.status(401).json({
				msg: 'Invalid username or password or role'
			})
		}
		const getUser = results[0];
		const resultPassword = results[0].UPassword;
		const resultRole = results[0].URole;
		if (password !== resultPassword){
			response.status(401).json({
				msg: 'Invalid username or password or role'
			})
		}
		else if (role !== resultRole) {
			response.status(401).json({
				msg: 'Invalid username or password or role'
			})
		}
		else {
			
			pool.query("UPDATE user SET ULast_login=CURRENT_TIMESTAMP WHERE UName=?", [username])
			response.status(200).json({
				user: getUser,
				msg: 'Login successfully',
			})
		}
		
	});
};


const addUser = (request, response) => {
	const {user} = request.body;
	pool.query("INSERT INTO user (UName, UEmail, UPassword, URole) VALUES (?, ?, ?, ?)", [user.username, user.email, user.password, user.role], (error, results) => {
		if (error) {
			throw error;
		} else {
			pool.query("SELECT * FROM user WHERE UEmail = ?", [user.email], (error, results) => {
				if (error) {
					throw error;
				}
				const getUser = results[0];
				response.status(200).json({
					user: getUser,
					msg: 'Add user successfully',
				})
			})
			
		}
	});
};

module.exports = {
	getUserLogin,
	getUserLoginById,
	addUser,
	userLogin,
};