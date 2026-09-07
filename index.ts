import DB from "./config/db_config"

const server = Bun.serve({
    port: 4000,
    routes: {
        "/api/test": async (req) => {
            const result = await DB`select * from jenis_lembaga;`
            console.log(result)
            return new Response(JSON.stringify({ message: "Duhhhhh" }), { status: 200 })
        }
    }
})

console.log(`Server is running on http://localhost:${server.port}`)