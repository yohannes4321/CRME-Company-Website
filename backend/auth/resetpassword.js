const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

const resetPassword = async (req, res) => {
    const { id, token } = req.body;
    const { password } = req.body;
console.log("id ",id)
console.log("token",token)
    // Verify the JWT token
    jwt.verify(token, process.env.TOKEN_SECRET_KEY, async (err, decoded) => {
        if (err) {
            console.error("JWT verification error:", err);
            return res.status(403).json({
                message: "Invalid token",
                success: false,
                error: true,
            });
        }

        try {
            // Hash the new password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Update the user's password
            const updatedUser = await userModel.findByIdAndUpdate(
                { _id: id },
                { password: hashedPassword },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({
                    message: "User not found",
                    success: false,
                    error: true,
                });
            }

            res.json({
                message: "Password updated successfully",
                success: true,
                error: false,
            });
        } catch (err) {
            console.error("Error updating password:", err);
            res.status(500).json({
                message: "Error updating password",
                success: false,
                error: true,
            });
        }
    });
};

module.exports = resetPassword;
