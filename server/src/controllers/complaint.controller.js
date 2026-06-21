const prisma = require("../prisma/client");

const createComplaint = async (req, res) => {
    try{
        const {type, description} = req.body;
        const userId = req.user.sub;

        if(!description){
            return res.status(400).json({
                message: "Description is missing"
            });
        }

        const complaint = await prisma.complaint.create({
            data: {
                userId,
                description,
                type,
            }
        });

        return res.status(201).json({message: "Your complaint has been sent successfully!", complaint});
    }
    catch(error){
        return res.status(500).json({message: "Internal server error", error});
    }
};

const getMyComplaints = async (req, res) => {
    try{
        const userId = Number(req.user.sub);

        const complaints = await prisma.complaint.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { handledBy: { select: { id: true, fullName: true } } }
        });

        return res.status(200).json({ complaints });
    }
    catch(error){
        return res.status(500).json({message: "Internal server error", error: error.message});
    }
};

module.exports = {
    createComplaint,
    getMyComplaints
};
