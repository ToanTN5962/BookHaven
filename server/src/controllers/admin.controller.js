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

module.exports = {
    getStatInfo
}