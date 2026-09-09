import type { ServerWebSocket } from "bun";
import { ServiceGetBarang, ServiceInputBarang } from "./services/barang_masuk/input_barang";
import { ServiceAddKodeBarang, ServiceGetKodeBarang } from "./services/kode_barang/kode_barang";
import { ServiceGetTipeLembaga } from "./services/tipe_lembaga/tipe_lembaga";

const users = new Map<any, ServerWebSocket>()

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:5500",

    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:5500",

    "https://wieldable-laboring-submersed.ngrok-free.dev",
    "http://192.168.1.9:3000",
    "http://192.168.1.10:5500"
];

function getCorsHeaders(req: Request) {
    const origin = req.headers.get("Origin");

    const headers: Record<string, string> = {
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
    };

    if (origin && allowedOrigins.includes(origin)) {
        headers["Access-Control-Allow-Origin"] = origin;
    }

    return headers;
}

const server = Bun.serve({
    port: 4000,
    routes: {
        "/api/barang_masuk/input_barang": async (req) => {
            if (req.method === "OPTIONS") {
                return new Response(null, {
                    status: 204,
                    headers: getCorsHeaders(req),
                });
            }

            if(req.method !== "POST")
                return new Response(JSON.stringify({
                    message: "Method Not Allowed"
                }), { status: 405, headers: getCorsHeaders(req) })

            const result = await ServiceInputBarang(req)

            return new Response(JSON.stringify(result), { status: result?.status, headers: getCorsHeaders(req) })
        },
        "/api/kode_barang/add": async (req) => {
            if (req.method === "OPTIONS") {
                return new Response(null, {
                    status: 204,
                    headers: getCorsHeaders(req),
                });
            }

            if(req.method !== "POST")
                return new Response(JSON.stringify({
                    message: "Method Not Allowed"
                }), { status: 405, headers: getCorsHeaders(req) })
            
            const result = await ServiceAddKodeBarang(req)

            return new Response(JSON.stringify(result), { status: result?.status, headers: getCorsHeaders(req) })
        },
        "/api/tipe_lembaga/get": async (req) => {
            if (req.method === "OPTIONS") {
                return new Response(null, {
                    status: 204,
                    headers: getCorsHeaders(req),
                });
            }

            if(req.method !== "GET")
                return new Response(JSON.stringify({
                    message: "Method Not Allowed"
                }), { status: 405, headers: getCorsHeaders(req) })

            const result = await ServiceGetTipeLembaga()

            return new Response(JSON.stringify(result), { status: result?.status, headers: getCorsHeaders(req) })
        },
        "/ws/connection": async (req) => {
            if (req.method === "OPTIONS") {
                return new Response(null, {
                    status: 204,
                    headers: getCorsHeaders(req),
                });
            }

            // Ambil username dari URL Query Parameter (contoh: /ws/connection?username=admin)
            const url = new URL(req.url);
            const username = url.searchParams.get("username");

            const newDatas = {
                username: username
            }

            try {
                // Bun.serve secara otomatis meng-upgrade request GET/WebSocket
                const success = server.upgrade(req, {
                    data: newDatas
                } as any)

                if(!success) 
                    return new Response(JSON.stringify({ 
                        message: "Failed To Upgrade Connection" 
                    }), { status: 400 })
            } catch (error) {
                return new Response(JSON.stringify({
                    message: "Internal Server Error"
                }), { status: 500, headers: getCorsHeaders(req) })
            }
        }
    },
    websocket: {
        idleTimeout: 15,
        open(ws: ServerWebSocket<any>) {
            if(!ws.data.username) return ws.close(4001, "Username is required")
            if(users.has(ws.data.username)) return ws.close(4002, "Username already exists")

            users.set(ws.data.username, ws)
            console.log(`WebSocket connection opened, Total Users: ${users.size}`)
        },
        async message(ws: ServerWebSocket<any>, message: string) {
            const text = typeof message === "string" ? message : Buffer.from(message).toString()
            const datas = JSON.parse(text)

            switch (datas.event) {
                case "GetDataBarangMasuk":
                    const result = await ServiceGetBarang(datas.tipe_lembaga)

                    ws.send(JSON.stringify({
                        event: `GetDataBarangMasuk/${datas.tipe_lembaga}`,
                        data: result
                    }))
                    break;
                case "GetDataBarangKeluar":
                    break; 
                case "GetDataKodeBarang":
                    const result2 = await ServiceGetKodeBarang()

                    ws.send(JSON.stringify({
                        event: "GetDataKodeBarang",
                        data: result2
                    }))
                    break;
            }
        },
        close(ws: ServerWebSocket<any>, code: number, reason: string) {
            if(ws.data.username) {
                users.delete(ws.data.username)
                console.log(`WebSocket connection closed, Total Users: ${users.size}`)
            }
        },
    }
})

console.log(`Server is running on http://localhost:${server.port}`)