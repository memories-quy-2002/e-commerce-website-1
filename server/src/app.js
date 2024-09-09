const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require('express-rate-limit');
const bodyParser = require("body-parser");
const db = require("./database/models");
const limiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 100000,
	message: 'Too many requests, please try again later.'
});

const PORT = process.env.PORT || 4000;

const app = express();
const allowedOrigins = ["http://localhost:3000", "https://e-commerce-website-1-1899.vercel.app"];

const corsOptions = {
	origin: function (origin, callback) {
		// Nếu không có origin hoặc origin nằm trong danh sách cho phép
		if (!origin || allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true, // Để cho phép credentials (cookies, authorization headers, etc.)
}
/* Middleware */
app.options('/api/users/login', cors(corsOptions));
app.options('*', (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', 'https://e-commerce-website-1-1899.vercel.app');
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
	res.sendStatus(204);  // Không có nội dung trong phản hồi OPTIONS
});
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(cookieParser());

app.use(limiter)

// User
app.get("/api/session/check", db.checkSessionToken)
app.get("/api/users/:id", db.getUserLoginById);
app.post("/api/users/login", cors(corsOptions), db.userLogin);
app.post("/api/users/logout", db.userLogout);
app.get("/api/users/", db.getAllUsers)
app.post("/api/users", db.addUser);

// Product
app.get("/api/products/:id", db.getSingleProduct);
app.get("/api/products/", db.getListProduct);
app.post("/api/products/add", db.addSingleProduct)
app.post("/api/products/delete/", db.deleteProduct)
app.get("/api/products/relevant/:pid", db.retrieveRelevantProducts)

// Wishlist
app.post("/api/wishlist/", db.addItemToWishlist);
app.get("/api/wishlist/:uid", db.getWishlist);
app.post("/api/wishlist/delete/", db.deleteWishlistItem)

// Cart
app.post("/api/cart/", db.addItemToCart);
app.get("/api/cart/:uid", db.getCartItems);
app.post("/api/cart/delete", db.deleteCartItem)

// Purchase
app.post("/api/purchase/:uid", db.makePurchase);
app.get("/api/orders/", db.getOrders)
app.get("/api/orders/item", db.getOrderItems)
app.post("/api/discount", db.applyDiscount)

// Review
app.post("/api/reviews/", db.addReview)
app.get("/api/reviews/:pid", db.getReviews)

app.get('/getuser', (req, res) => {
	//shows all the cookies 
	res.send(req.cookies);
});

app.get('/clearuser', (request, response) => {
	response.clearCookie("username");
	response.clearCookie("userInfo");
	response.clearCookie("rememberMe");
	response.send("All cookies are clear")
})

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});

module.exports = app;