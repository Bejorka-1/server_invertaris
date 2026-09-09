import { RepoGetBarang, RepoInputBarang } from "../../models/barang_masuk/input_barang"

const ServiceInputBarang = async (datas: any) => {
    let data: any

    try {
        data = await datas.json()
    } catch (error) {
        console.error(error)
        return { status: 400, message: "There is no datas" }
    }

    try {
        const result = await RepoInputBarang(data)
        return result
    } catch (error) {
        console.log(error)
    }
}

const ServiceGetBarang = async (tipe_lembaga: string) => {
    try {
        const result = await RepoGetBarang(tipe_lembaga)
        return result
    } catch (error) {
        console.log("Error saat mengambil data barang:", error);
    }
}

export {
    ServiceInputBarang,
    ServiceGetBarang
}