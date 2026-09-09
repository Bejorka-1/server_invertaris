import DB from "../../config/db_config"

const RepoGetTipeLembaga = async () => {
    try {
        // Melakukan query untuk mengambil semua data dari tabel jenis_lembaga
        const result = await DB`
            SELECT * FROM jenis_lembaga
        `;

        // Pengecekan jika data di dalam tabel masih kosong
        if (result.length === 0) {
            return { 
                message: "Tidak Ada Data Tipe Lembaga", 
                status: 404, 
                data: [] 
            };
        }

        // Jika data ditemukan, kembalikan response sukses beserta datanya
        return { 
            message: "Berhasil Mengambil Data Tipe Lembaga", 
            status: 200, 
            data: result 
        };

    } catch (error) {
        console.log("Error saat mengambil data tipe lembaga:", error);
        return { 
            message: "Gagal Mengambil Data Tipe Lembaga", 
            status: 500, 
            data: [] 
        };
    }
}

export {
    RepoGetTipeLembaga
}