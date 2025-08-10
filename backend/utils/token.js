export const jsontoken = (user, message, statusCode, res) => {
    const token = user.generateJsonWebToken();
    let cookieName;
    switch (user.role) {
        case "Admin":
            cookieName="adminToken";
            break;
        case "Kasir":
            cookieName="kasirToken";
            break;
        default:
            throw new Error("Invalid role user");
    }
    res.status(statusCode).cookie(cookieName,token,{
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    }).json({
        success: true,
        message,
        user,
        token
    });
};