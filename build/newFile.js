"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const oracledb_1 = __importDefault(require("oracledb"));
const app_1 = require("./app");
//***********************************************ATUALIZAR*AERONAVE******************************************************** */
app_1.app.put("/atualizarAeronave", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const modelo = req.body.modelo;
    const fabricante = req.body.fabricante;
    const qtdAssento = req.body.qtdAssento;
    const ano_de_fabricação = req.body.ano_de_fabricação;
    const Numero_de_identificacao = req.body.Numero_de_identificacao;
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdupdateAeronave = "UPDATE SYS.AERONAVES SET  MODELO = :1,FABRICANTE=:2,QTDASSENTO=:3,ANO_DE_FABRICAÇÃO=:4 WHERE Numero_de_identificacao=:5";
        const dados = [modelo, fabricante, qtdAssento, ano_de_fabricação, Numero_de_identificacao];
        let resInsert = yield conn.execute(cmdupdateAeronave, dados);
        yield conn.commit();
        const rowsInserted = resInsert.rowsAffected;
        if (rowsInserted !== undefined && rowsInserted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Aeronave Atualizado.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        //fechar a conexao.
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
}));
