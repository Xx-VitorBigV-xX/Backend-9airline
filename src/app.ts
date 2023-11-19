
// recursos/modulos necessarios.
import express from "express";
import oracledb, { Connection, ConnectionAttributes } from "oracledb";
import dotenv from "dotenv";

// usando o módulo de CORS
import cors from "cors";

// preparar o servidor web de backend na porta 3000
const app = express();
const port = 3000;
// preparar o servidor para dialogar no padrao JSON 
app.use(express.json());
app.use(cors());

// já configurando e preparando o uso do dotenv para 
// todos os serviços.
dotenv.config();

// criando um TIPO chamado CustomResponse.
// Esse tipo vamos sempre reutilizar.
type CustomResponse = {
  status: string,
  message: string,
  payload: any
};



// servicos de backend
app.get("/listarAeronaves", async(req,res)=>{

  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try{
    const connAttibs: ConnectionAttributes = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    }
    const connection = await oracledb.getConnection(connAttibs);
    let resultadoConsulta = await connection.execute("SELECT * FROM SYS.AERONAVES");
  
    await connection.close();
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    cr.payload = resultadoConsulta.rows;

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);  
  }

});

app.put("/inserirAeronave", async(req,res)=>{
  
  // para inserir a aeronave temos que receber os dados na requisição. 
  const modelo = req.body.modelo as string;
  const fabricante = req.body.fabricante as string;
  const qtdAssento = req.body.qtdAssento as number;
  const ano_de_fabricação = req.body.ano_de_fabricação as number; 

  

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsertAero = "INSERT INTO SYS.AERONAVES(NUMERO_DE_IDENTIFICACAO, MODELO, FABRICANTE, ANO_DE_FABRICAÇÃO, QTDASSENTO)VALUES(SYS.SEQ_AERONAVES.NEXTVAL, :1, :2, :3, :4)"

    const dados = [modelo, fabricante, ano_de_fabricação,qtdAssento];
    let resInsert = await conn.execute(cmdInsertAero, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Aeronave inserida.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});

app.delete("/excluirAeronave", async(req,res)=>{
  // excluindo a aeronave pelo código dela:
  const  Numero_de_identificacao= req.body.Numero_de_identificacao as number;
 
  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  // conectando 
  try{
    const connection = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdDeleteAero = `DELETE SYS.AERONAVES WHERE Numero_de_identificacao = :1`
    const dados = [Numero_de_identificacao];

    let resDelete = await connection.execute(cmdDeleteAero, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await connection.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsDeleted = resDelete.rowsAffected
    if(rowsDeleted !== undefined &&  rowsDeleted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Aeronave excluída.";
    }else{
      cr.message = "Aeronave não excluída. Verifique se o código informado está correto.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    // devolvendo a resposta da requisição.
    res.send(cr);  
  }
});

app.listen(port,()=>{
  console.log("Servidor HTTP funcionando...");
});

//***********************************************ATUALIZAR*AERONAVE******************************************************** */

app.put("/atualizarAeronave",async(req,res)=>{
  const modelo = req.body.modelo as string;
  const fabricante = req.body.fabricante as string;
  const qtdAssento = req.body.qtdAssento as number;
  const ano_de_fabricação = req.body.ano_de_fabricação as number;
  const Numero_de_identificacao=req.body.Numero_de_identificacao as number;

  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };
  let conn;
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });
    const cmdupdateAeronave = "UPDATE SYS.AERONAVES SET  MODELO = :1,FABRICANTE=:2,QTDASSENTO=:3,ANO_DE_FABRICAÇÃO=:4 WHERE Numero_de_identificacao=:5"
    const dados = [modelo,fabricante,qtdAssento,ano_de_fabricação,Numero_de_identificacao];
    let resInsert = await conn.execute(cmdupdateAeronave, dados);
    await conn.commit();
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Aeronave Atualizado.";
    }

}catch(e){
  if(e instanceof Error){
    cr.message = e.message;
    console.log(e.message);
  }else{
    cr.message = "Erro ao conectar ao oracle. Sem detalhes";
  }
} finally {
  //fechar a conexao.
  if(conn!== undefined){
    await conn.close();
  }
  res.send(cr);  
}

});



//************************************************************************************************************* */

//----------------------------------LISTAR-AEROPORTO--------------------------------------------------//

app.get("/listarAeroporto", async(req,res)=>{

  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try{
    const connAttibs: ConnectionAttributes = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    }
    const connection = await oracledb.getConnection(connAttibs);
    let resultadoConsulta = await connection.execute("SELECT * FROM SYS.AEROPORTOS");
  
    await connection.close();
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    cr.payload = resultadoConsulta.rows;

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);  
  }

});


//---------------------------------INSERIR AERONAVE-------------------------------------------------------------//

app.put("/inserirAeroporto", async(req,res)=>{
  
  // para inserir a aeronave temos que receber os dados na requisição. 
  const nome = req.body.nome as string;
  const nomeCidade = req.body.fk_nome_cidade as string;

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsertAerop = "INSERT INTO SYS.AEROPORTOS ( NOME,ID_AEROPORTO,fk_nome_cidade)VALUES(:1, SYS.SEQ_AEROPORTOS.NEXTVAL,:2)"

    const dados = [nome,nomeCidade];
    let resInsert = await conn.execute(cmdInsertAerop, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Aeroporto inserido.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});



app.delete("/excluirAeroporto", async(req,res)=>{
  // excluindo a aeronave pelo código dela:
  const  id_aeroporto = req.body.id_aeroporto as number;
 
  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  // conectando 
  try{
    const connection = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdDeleteAeroP = `DELETE SYS.AEROPORTOS WHERE ID_AEROPORTO = :1`
    const dados = [id_aeroporto];

    let resDelete = await connection.execute(cmdDeleteAeroP, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await connection.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsDeleted = resDelete.rowsAffected
    if(rowsDeleted !== undefined &&  rowsDeleted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Aeroporto excluído.";
    }else{
      cr.message = "Aeroporto não excluída. Verifique se o código informado está correto.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    // devolvendo a resposta da requisição.
    res.send(cr);  
  }
});
//-------------------------------------------------ATUALIZAE AEROPORTO--------------------------------------------------
app.put("/atualizarAeroporto",async(req,res)=>{
  const nome = req.body.nome as String;
  const id_aeroporto=req.body.id_aeroporto as number;

  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };
  let conn;
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });
    const cmdupdateAeroporto = "UPDATE SYS.AEROPORTOS SET  nome = :1 WHERE id_aeroporto=:2"
    const dados = [nome,id_aeroporto];
    let resInsert = await conn.execute(cmdupdateAeroporto, dados);
    await conn.commit();
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Aeroporto Atualizado.";
    }

}catch(e){
  if(e instanceof Error){
    cr.message = e.message;
    console.log(e.message);
  }else{
    cr.message = "Erro ao conectar ao oracle. Sem detalhes";
  }
} finally {
  //fechar a conexao.
  if(conn!== undefined){
    await conn.close();
  }
  res.send(cr);  
}

});
//--------------------------------------------------LISTAR-CIDADE----------------------------------------------------------------------------------------------
app.get("/listarCidades", async(req,res)=>{

  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try{
    const connAttibs: ConnectionAttributes = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    }
    const connection = await oracledb.getConnection(connAttibs);
    let resultadoConsulta = await connection.execute("SELECT * FROM SYS.CIDADES");
  
    await connection.close();
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    cr.payload = resultadoConsulta.rows;

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);  
  }

});


//----------------------------------------------INSERIR-CIDADES-------------------------------------------------------------------------------------------
app.put("/inserirCidade", async(req,res)=>{
  
  // para inserir a  temos que receber os dados na requisição. 
  const nome = req.body.nome as string;


  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsertcity = "INSERT INTO SYS.CIDADES ( NOME,ID_CIDADE)VALUES(:1, SYS.SEQ_CIDADES.NEXTVAL)"

    const dados = [nome];
    let resInsert = await conn.execute(cmdInsertcity, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "cidade inserida.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});
//*********************************************************************************************************** */
app.delete("/excluirCidade", async(req,res)=>{
  // excluindo a aeronave pelo código dela:
  const  id_cidade = req.body.id_cidade as number;
 
  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  // conectando 
  try{
    const connection = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdDeletecity = `DELETE SYS.CIDADE WHERE ID_CIDADE = :1`
    const dados = [id_cidade];

    let resDelete = await connection.execute(cmdDeletecity, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await connection.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsDeleted = resDelete.rowsAffected
    if(rowsDeleted !== undefined &&  rowsDeleted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "cidade excluído.";
    }else{
      cr.message = "cidade não excluída. Verifique se o código informado está correto.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    // devolvendo a resposta da requisição.
    res.send(cr);  
  }
});

app.put("/atualizarCidade",async(req,res)=>{
  const nome = req.body.nome as string;
  const id_cidade = req.body.id_cidade as number;

  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });


    const cmdupdateCidade = "UPDATE SYS.cidade SET  nome = :1 WHERE id_cidade=:2"
    const dados = [nome,id_cidade];

    let resInsert = await conn.execute(cmdupdateCidade, dados);

    await conn.commit();

    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "cidade atualizada.";
    }else{
      cr.message = "cidade não ATUALIZADA. Verifique se o código informado está correto.";
    }


  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});










//---------------------------------------------LISTAR-VOO--------------------------------------------------
app.get("/listarVoo", async(req,res)=>{

   

  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try{
    const connAttibs: ConnectionAttributes = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    }
    const connection = await oracledb.getConnection(connAttibs);
    let resultadoConsulta = await connection.execute('SELECT * FROM SYS.VOOS')
  
    await connection.close();
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    cr.payload = resultadoConsulta.rows;

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);  
  }

});

//---------------------------------------INSERIR-VOO-------------------------------------
app.put("/inserirvoo", async(req,res)=>{
  
  // para inserir a vooS temos que receber os dados na requisição. 
  
  const idvoo = req.body.id_voo as number;
  const diaPartida = req.body.dia_partida as string;
  const diaChegada = req.body.dia_chegada as string;
  const horarioChegada = req.body.horario_chegada as string;
  const horarioPartida = req.body.horario_partida as string;
  const valor = req.body.valor as number;
  const modeloAeronave = req.body.FK_Modelo_aeronave as string;
  const NomeTrecho = req.body.FK_NOME_trecho as string;
  const NomeCidadeOrigem = req.body.FK_nome_cidade_origem as String;
  const NomeAeroportoOrigem = req.body.FK_nome_aeroporto_origem as string;
  const NomeCiodadeDestino = req.body.FK_nome_cidade_destino as string;
  const NomeAeroportoDestino = req.body.FK_nome_aeroporto_destino as string;

  


  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsertvoo = "INSERT INTO SYS.VOOS(id_voo,dia_partida, dia_chegada,horario_partida,horario_chegada,valor,FK_Modelo_aeronave,FK_NOME_trecho,FK_nome_cidade_origem,FK_nome_aeroporto_origem,FK_nome_cidade_destino,FK_nome_aeroporto_destino)values(SYS.seq_voo.nextval,:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11)";

    const dados = [diaPartida,diaChegada,horarioChegada,horarioPartida,valor,modeloAeronave,NomeTrecho, NomeCidadeOrigem,NomeAeroportoOrigem,NomeCiodadeDestino,NomeAeroportoDestino];
    let resInsert = await conn.execute(cmdInsertvoo, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "voo inserido.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});
//--------------------------------------------------------LISTAR-TRECHO----------------------------------------------------------
app.get("/listarTrecho", async(req,res)=>{

  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try{
    const connAttibs: ConnectionAttributes = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    }
    const connection = await oracledb.getConnection(connAttibs);
    let resultadoConsulta = await connection.execute('SELECT * FROM SYS.TRECHOS')
  
    await connection.close();
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    cr.payload = resultadoConsulta.rows;

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);  
  }

});

//--------------------------------------------------------INSERIR-TRECHO----------------------------------------------------------


app.put("/inserirTrecho", async(req,res)=>{
  
  const nome = req.body.nome as string;
  const idcidadeOrigem = req.body.FK_id_cidade_origem as number;
  const nomeCidadeOrigem = req.body.FK_nome_cidade_origem as string;
  const idAeroportoOrigem = req.body.FK_id_aeroporto_origem as number;
  const nomeAeroportoOrigem = req.body.FK_nome_aeroporto_origem as string;
  const idCidadeDestino = req.body.FK_id_cidade_destino as number;
  const nomeCidadeDestino = req.body.FK_nome_cidade_destino as string;
  const idAeroportoDestino = req.body.FK_id_aeroporto_destino as number;
  const nomeAeroportoDestino = req.body.FK_nome_aeroporto_destino as string;



  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsertAerop = "INSERT INTO SYS.TRECHOS(ID_TRECHO,NOME,FK_id_cidade_origem,FK_nome_cidade_origem,FK_id_aeroporto_origem, FK_nome_aeroporto_origem,FK_id_cidade_destino, FK_nome_cidade_destino,FK_id_aeroporto_destino,FK_nome_aeroporto_destino)VALUES(SYS.SEQ_TRECHO.NEXTVAL,:1,:2,:3,:4,:5,:6,:7,:8,:9)"

    const dados = [nome,idcidadeOrigem,nomeCidadeOrigem,idAeroportoOrigem,nomeAeroportoOrigem,idCidadeDestino,nomeCidadeDestino,idAeroportoDestino,nomeAeroportoDestino];
    let resInsert = await conn.execute(cmdInsertAerop, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Aeroporto inserido.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});

