import express from "express";

const route = express.Router();

//Get All Users

route.get("/", getAllUsers);

//Get Single User

route.get("/:id", getSingleUser);

//Create User

route.post("/create", createUser);

// Update User

route.patch("/user/:id", updateUser);

//Update User Profile Image

route.put("/profile-image", updateUserProfileImage);

//Delete User

route.delete("/:id", deleteUser);
