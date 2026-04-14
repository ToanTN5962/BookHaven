const prisma = require("../prisma/client");

const signup = async (req, res) => {
    try {
        const {fullName, email, phoneNum, password, dateOfBirth, sex} = res.body;

        if(!email || !password){
            return res.status(400).json({
                message: "Missing email or password"
            });
        }

        const existedUser = await prisma.user.findUnique({
            where: {email}
        });

        if(existedUser){
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        const user = await prisma.user.create({
            data: {
                fullName, 
                email, 
                phoneNum, 
                password, 
                dateOfBirth, 
                sex
            }
        }); 

        return res.status(201).json({
            message: "Signup succesfully!",
            user
        });
    }
    catch(error) {
        console.error("Signup error: ", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const login = async (req, res) => {

};

module.exports = {
    signup,
    login
};