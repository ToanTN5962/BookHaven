const prisma = require("../prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
    try {
        const {fullName, email, phoneNum, password, dateOfBirth, sex} = req.body;

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

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                fullName, 
                email, 
                phoneNum, 
                password: hashedPassword, 
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null, 
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
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                message: "Missing email or password"
            });
        }

        const user = await prisma.user.findUnique({
            where: {email}
        });

        const isMatch = user && await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(401).json({
                message: "Incorrect login information"
            });
        }

        const token = jwt.sign({
            sub: user.id,
            email: user.email,
            name: user.fullName,
            role: user.role
        },
        process.env.JWT_SECRET,
        {expiresIn: "1h"});

        //Bo password ra khoi user truoc khi tra ve cho FE
        const {password: pass, ...userWithoutPassword} = user;

        return res.status(200).json({
            message: "Login successfully",
            token,
            user: userWithoutPassword
        });
    }
    catch(error){
        console.error("Login error: ", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    signup,
    login
};