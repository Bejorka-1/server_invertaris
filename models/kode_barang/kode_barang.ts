import DB from "../../config/db_config"

const RepoAddKodeBarang = async (datas: any) => {
    try {
        // 1. Cek apakah golongan, kelompok, dan sub_kelompok sudah ada (tanpa melihat tipe_barang)
        const cekExisting = await DB`
            SELECT id_kode FROM Kode_Barang 
            WHERE golongan = ${datas.golongan} 
              AND kelompok = ${datas.kelompok} 
              AND sub_kelompok = ${datas.sub_kelompok}
        `;

        if (cekExisting.length > 0) {
            return { 
                message: "Gagal: Golongan, kelompok, dan sub-kelompok tersebut sudah terdaftar!", 
                status: 400 
            };
        }

        // 2. Jika belum ada, masukkan data baru ke tabel Kode_Barang
        const insertKode = await DB`
            INSERT INTO Kode_Barang (golongan, kelompok, sub_kelompok, tipe_barang)
            VALUES (${datas.golongan}, ${datas.kelompok}, ${datas.sub_kelompok}, ${datas.tipe_barang})
            RETURNING id_kode
        `;

        return { 
            message: "Berhasil Menambahkan Kode Barang", 
            status: 200, 
            id_kode: insertKode[0].id_kode 
        };

    } catch (error) {
        console.log("Error saat menambah kode barang:", error);
        return { message: "Gagal Menambahkan Kode Barang", status: 500 };
    }
}

const RepoGetKodeBarang = async () => {
    try {
        const result = await DB`
            SELECT id_kode, golongan, kelompok, sub_kelompok, tipe_barang 
            FROM Kode_Barang
            ORDER BY golongan, kelompok, sub_kelompok ASC
        `;

        if (result.length === 0) {
            return { message: "Tidak Ada Data Kode Barang", status: 404, data: [] };
        }

        return { message: "Berhasil Mengambil Data Kode Barang", status: 200, data: result };

    } catch (error) {
        console.log("Error saat mengambil data kode barang:", error);
        return { message: "Gagal Mengambil Data Kode Barang", status: 500, data: [] };
    }
}

export {
    RepoAddKodeBarang,
    RepoGetKodeBarang
}