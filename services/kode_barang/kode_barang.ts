import { RepoAddKodeBarang, RepoGetKodeBarang } from "../../models/kode_barang/kode_barang"

const ServiceAddKodeBarang = async (req: Request) => {
    let data: any

    try {
        data = await req.json()
    } catch (error) {
        console.error(error)
        return { status: 400, message: "There is no datas" }
    }

    try {
        const result = await RepoAddKodeBarang(data)

        return result
    } catch (error) {
        console.log(error)
    }
}

const ServiceGetKodeBarang = async () => {
    try {
        const result = await RepoGetKodeBarang()

        return result
    } catch (error) {
        console.log(error)
    }
}

export {
    ServiceAddKodeBarang,
    ServiceGetKodeBarang
}