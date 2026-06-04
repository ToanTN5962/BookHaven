const prisma = require("../prisma/client");

const getStatInfo = async (req, res) => {
    try {
        const bookCount = await prisma.user.count({
            where: {
                role: 'USER',
            },
        });
        const solvingComplaint = await prisma.complaint.findMany({
            where: {
                solvingStatus: 'SOLVING',
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const complaintCount = solvingComplaint.length;

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
            bookCount,
            complaintCount,
            solvingComplaint,
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