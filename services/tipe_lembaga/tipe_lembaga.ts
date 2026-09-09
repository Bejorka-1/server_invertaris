import { RepoGetTipeLembaga } from "../../models/tipe_lembaga/tipe_lembaga"

const ServiceGetTipeLembaga = async () => {
    try {
        const result = await RepoGetTipeLembaga()

        return result
    } catch (error) {
        console.log(error)
    }
}

export {
    ServiceGetTipeLembaga
}