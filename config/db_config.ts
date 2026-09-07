import { SQL } from "bun";

const DB = new SQL("sqlite:./db/inventaris.db");

export default DB;