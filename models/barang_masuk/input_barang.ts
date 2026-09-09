import DB from "../../config/db_config"

const RepoInputBarang = async (datas: any) => {
    try {
        // 1. Ambil ID dari tabel master (Kode_Barang) berdasarkan kecocokan tipe_barang
        // Asumsi datas mengirimkan `datas.tipe_barang` (misal: "LAPTOP", "MEJA KANTOR", dll)
        let kodeBarang = await DB`
            SELECT id_kode FROM Kode_Barang 
            WHERE LOWER(tipe_barang) = LOWER(${datas.tipe_barang})
        `;
        
        let id_kode_barang;
        if (kodeBarang.length > 0) {
            id_kode_barang = kodeBarang[0].id_kode;
        } else {
            // Jika tipe barang belum terdaftar di master Kode_Barang, buat baru atau berikan penanganan default
            const insertKode = await DB`
                INSERT INTO Kode_Barang (tipe_barang)
                VALUES (${datas.tipe_barang})
                RETURNING id_kode
            `;
            id_kode_barang = insertKode[0].id_kode;
        }

        // 2. Masukkan master data pendukung lainnya (merk_nomor_ukuran & keterangan)
        const insertMerk = await DB`
            INSERT INTO merk_nomor_ukuran (nama_merk, nomor, ukuran)
            VALUES (${datas.nama_merk}, ${datas.nomor}, ${datas.ukuran})
            RETURNING id_merk_nomor_ukuran
        `;
        const id_merk_nomor_ukuran = insertMerk[0].id_merk_nomor_ukuran;

        const insertKeterangan = await DB`
            INSERT INTO keterangan (ruang, status, tempat, pembelian)
            VALUES (${datas.ruang}, ${datas.status_ket}, ${datas.tempat}, ${datas.pembelian})
            RETURNING id_keterangan
        `;
        const id_keterangan = insertKeterangan[0].id_keterangan;

        // 3. Masukkan data utama ke tabel "barang" (menggunakan tahun_pembuatan langsung)
        const insertBarang = await DB`
            INSERT INTO barang (
                id_kode_barang, 
                nama_barang, 
                nama_satuan, 
                kondisi_barang, 
                harga_barang, 
                tahun_pembuatan, 
                id_merk_nomor_ukuran, 
                id_sekolah, 
                id_keterangan
            ) VALUES (
                ${id_kode_barang}, 
                ${datas.nama_barang}, 
                ${datas.nama_satuan}, 
                ${datas.kondisi_barang}, 
                ${datas.harga_barang}, 
                ${datas.tahun_pembuatan}, 
                ${id_merk_nomor_ukuran}, 
                ${datas.id_sekolah}, 
                ${id_keterangan}
            )
            RETURNING id_barang
        `;
        
        const id_barang = insertBarang[0].id_barang;

        // 4. Masukkan data ke tabel barang_masuk
        if (datas.asal_barang || datas.status_upgrade || datas.tanggal_masuk) {
            await DB`
                INSERT INTO barang_masuk (id_barang, asal_barang, status_upgrade, tanggal_masuk)
                VALUES (${id_barang}, ${datas.asal_barang}, ${datas.status_upgrade}, ${datas.tanggal_masuk})
            `;
        }

        return { message: "Berhasil Input Barang", status: 200 };

    } catch (error) {
        console.log("Error saat input barang:", error);
        return { message: "Gagal Input Barang", status: 500 };
    }
}

const RepoGetBarang = async (tipe_lembaga: string) => {
    try {
        const result = await DB`
            SELECT 
                b.id_barang,
                b.nama_barang,
                b.nama_satuan,
                b.kondisi_barang,
                b.harga_barang,
                b.tahun_pembuatan,
                -- Menggunakan COALESCE agar otomatis mencari data valid jika id_kode_barang menunjuk ke baris kosong
                COALESCE(kb.golongan, sub_kb.golongan, '-') AS golongan,
                COALESCE(kb.kelompok, sub_kb.kelompok, '-') AS kelompok,
                COALESCE(kb.sub_kelompok, sub_kb.sub_kelompok, '-') AS sub_kelompok,
                COALESCE(kb.tipe_barang, sub_kb.tipe_barang, b.nama_barang) AS tipe_barang,
                jl.tipe_lembaga,
                mnu.nama_merk,
                mnu.nomor,
                mnu.ukuran,
                k.ruang,
                k.status AS status_keterangan,
                k.tempat,
                k.pembelian,
                bm.asal_barang,
                bm.status_upgrade,
                bm.tanggal_masuk,
                bk.status_keluar,
                bk.tanggal_keluar,
                bk.keterangan AS keterangan_keluar
            FROM barang b
            INNER JOIN jenis_lembaga jl ON b.id_sekolah = jl.id_sekolah
            LEFT JOIN Kode_Barang kb ON b.id_kode_barang = kb.id_kode
            -- Fallback join berdasarkan kecocokan nama/tipe jika relasi utama kosong/null
            LEFT JOIN Kode_Barang sub_kb ON LOWER(sub_kb.tipe_barang) = LOWER(b.nama_barang)
            LEFT JOIN merk_nomor_ukuran mnu ON b.id_merk_nomor_ukuran = mnu.id_merk_nomor_ukuran
            LEFT JOIN keterangan k ON b.id_keterangan = k.id_keterangan
            LEFT JOIN barang_masuk bm ON b.id_barang = bm.id_barang
            LEFT JOIN barang_keluar bk ON b.id_barang = bk.id_barang
            WHERE LOWER(jl.tipe_lembaga) = LOWER(${tipe_lembaga})
        `;

        if(result.length === 0) {
            return { message: "Tidak Ada Data Barang", status: 404, data: [] };
        }
        
        return { message: "Berhasil Mengambil Data", status: 200, data: result };

    } catch (error) {
        console.log("Error saat mengambil data barang:", error);
        return { message: "Gagal Mengambil Data", status: 500, data: [] };
    }
}

export {
    RepoInputBarang,
    RepoGetBarang
}