const prisma = require("../prisma/client");

const getInfo = async (req, res) => {
    try{
        const userId = req.user.sub;
        console.log("userId từ token:", userId);

        const user = await prisma.user.findUnique({
            where: {id: userId},
            select: {
                fullName: true,
                dateOfBirth: true,
                sex: true,
                phoneNum: true,
                email: true,
                role: true,
                createdAt: true
            }
        })

        console.log("user từ DB:", user);

        const {password: pass, ...userWithoutPassword} = user;

        return res.status(200).json({message: "Get user information successfully!", user});
    }
    catch(error){
        console.error("Lỗi getInfo:", error);
        return res.status(500).json({message: "Server error", error});
    }
};

module.exports = {
    getInfo
};