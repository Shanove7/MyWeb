// Simpan file ini di dalam folder bernama "api", beri nama "index.js"
// Endpoint nanti: https://domain-kamu.vercel.app/api?url=LINK_IG

export default async function handler(req, res) {
    // 1. Setup CORS agar API bisa dipakai website orang lain
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle Preflight Request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { url } = req.query;

    // 2. Validasi URL
    if (!url) {
        return res.status(400).json({
            status: false,
            creator: "Shanove7",
            message: "Parameter 'url' wajib diisi. Contoh: /api?url=https://instagram.com/..."
        });
    }

    try {
        // 3. Tembak ke Provider Asli (Faa)
        const response = await fetch(`https://api-faa.my.id/faa/igdl?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        // 4. Custom Response (Ganti Creator jadi nama kamu)
        if (data.result) {
            return res.status(200).json({
                status: true,
                creator: "Shanove7 (X-SNZ)", // Branding kamu
                data: {
                    media: data.result.url,
                    metadata: data.result.metadata
                }
            });
        } else {
            throw new Error("Media tidak ditemukan");
        }

    } catch (error) {
        return res.status(500).json({
            status: false,
            creator: "Shanove7",
            message: "Gagal mengambil data. Pastikan link publik atau coba lagi nanti."
        });
    }
}
