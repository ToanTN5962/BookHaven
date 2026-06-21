const prisma = require("../prisma/client");

const getStatInfo = async (req, res) => {
    try {
        const userStat = await prisma.user.findMany({
            where: {
                role: 'USER',
            },
        });

        const userCount = userStat.length;

        const complaintStat = await prisma.complaint.groupBy({
            by: ['solvingStatus'],
            _count: {
                solvingStatus: true
            }
        });

        const complaintCount = complaintStat.reduce((acc, item) => {
            acc[item.solvingStatus] = item._count.solvingStatus;
            return acc;
        }, {});

        const complaintsList = await prisma.complaint.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { id: true, email: true, fullName: true } }, handledBy: { select: { id: true, fullName: true } } },
            take: 100
        });

        const nytList = req.query.nytList || 'hardcover-fiction';
        let nytCount = null;
        try {
            const apiKey = process.env.NYT_API_KEY;
            if(apiKey){
                const url = `https://api.nytimes.com/svc/books/v3/lists/current/${encodeURIComponent(nytList)}.json?api-key=${apiKey}`;
                const resp = await fetch(url);
                if(resp.ok){
                    const data = await resp.json();
                    const books = data?.results?.books || [];
                    nytCount = Array.isArray(books) ? books.length : 0;
                }
            }
        }
        catch(e) {
            nytCount = null;
        }

        return res.status(200).json({
            user: {listUser: userStat, userCount: userCount},
            complaintCount,
            complaintStat,
            complaints: complaintsList,
            nyt: { list: nytList, count: nytCount }
        });
    }
    catch(error){
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }

};

const getComplaintNotificationText = (status) => {
    if (status === 'SOLVED') {
        return {
            title: 'Your complaint has been resolved',
            message: 'An admin has reviewed your complaint and marked it as resolved.',
        };
    }

    return {
        title: 'Your complaint has been rejected',
        message: 'An admin has reviewed your complaint and marked it as rejected.',
    };
};

const updateComplaintStatus = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: "Admin permission is required" });
        }

        const id = Number(req.params.id);
        const { status } = req.body;
        const allowedStatuses = ['SOLVED', 'REJECTED'];

        if (!id) {
            return res.status(400).json({ message: "Complaint id is invalid" });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Status must be SOLVED or REJECTED" });
        }

        const complaint = await prisma.complaint.findUnique({
            where: { id },
            include: { user: { select: { id: true, email: true, fullName: true } } },
        });

        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        const notificationText = getComplaintNotificationText(status);

        const result = await prisma.$transaction(async (tx) => {
            const updatedComplaint = await tx.complaint.update({
                where: { id },
                data: {
                    solvingStatus: status,
                    handledById: req.user.sub,
                    handleAt: new Date(),
                },
                include: {
                    user: { select: { id: true, email: true, fullName: true } },
                    handledBy: { select: { id: true, fullName: true } },
                },
            });

            const notification = await tx.notification.create({
                data: {
                    userId: complaint.userId,
                    complaintId: complaint.id,
                    title: notificationText.title,
                    message: `${notificationText.message} Complaint type: ${complaint.type}.`,
                },
            });

            return { complaint: updatedComplaint, notification };
        });

        return res.status(200).json({
            message: "Complaint status updated",
            complaint: result.complaint,
            notification: result.notification,
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = {
    getStatInfo,
    updateComplaintStatus,
}
