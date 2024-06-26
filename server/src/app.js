const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const bodyParser = require("body-parser");
const db = require("./database/models");

const PORT = process.env.PORT || 4000;
const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(
	cors({
		origin: "http://localhost:3000",
		credentials: true,
	})
);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});

// User
app.get("/api/users/:id", db.getUserLoginById);
app.get("/api/users/", db.getAllUsers)
app.post("/api/users", db.addUser);
app.post("/api/users/login", db.userLogin);

// Product
app.get("/api/products/:id", db.getSingleProduct);
app.get("/api/products/", db.getListProduct);
app.post("/api/products/delete/", db.deleteProduct)
app.get("/api/products/relevant/:pid", db.retrieveRelevantProducts)

// Wishlist
app.post("/api/wishlist/", db.addItemToWishlist);
app.get("/api/wishlist/:uid", db.getWishlist);
app.post("/api/wishlist/delete/:wid", db.deleteWishlistItem)

// Cart
app.post("/api/cart/", db.addItemToCart);
app.get("/api/cart/:uid", db.getCartItems);
app.post("/api/cart/delete", db.deleteCartItem)

// Purchase
app.post("/api/purchase/:uid", db.makePurchase);
app.get("/api/orders/", db.getOrders)
