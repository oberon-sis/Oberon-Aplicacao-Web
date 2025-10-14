// controllers/empresaController.js

const empresaModel = require('../models/EmpresaModel');

const empresaController = {

    verificar(req, res) {
        console.log("\n[CONTROLLER] PASSO 1: Cheguei na função 'verificar'.");

        const { razaoSocial, cnpj } = req.body;
        const cnpjLimpo = cnpj ? cnpj.replace(/[^\d]/g, '') : '';
        
        console.log(`[CONTROLLER] PASSO 2: Recebi os dados - Razão Social: ${razaoSocial}, CNPJ Limpo: ${cnpjLimpo}`);

        if (!razaoSocial || !cnpjLimpo) {
            console.log("[CONTROLLER] ERRO: Dados ausentes. Enviando resposta 400.");
            return res.status(400).json({ mensagem: "Razão Social e CNPJ são obrigatórios." });
        }

        console.log("[CONTROLLER] PASSO 3: Vou chamar o Model para consultar o banco...");
        empresaModel.verificarDuplicidade(razaoSocial, cnpjLimpo)
            .then(resultado => {
                console.log("[CONTROLLER] PASSO 4: O Model respondeu. O resultado é:", resultado);

                if (resultado.length > 0) {
                    const duplicado = resultado[0];
                    console.log("[CONTROLLER] Encontrei uma duplicata:", duplicado);

                    if (duplicado.cnpj === cnpjLimpo) {
                        console.log("[CONTROLLER] Conflito de CNPJ. Enviando resposta 409.");
                        return res.status(409).json({ mensagem: "Este CNPJ já está cadastrado." });
                    }
                    
                    if (duplicado.razaoSocial.toLowerCase() === razaoSocial.toLowerCase()) {
                        console.log("[CONTROLLER] Conflito de Razão Social. Enviando resposta 409.");
                        return res.status(409).json({ mensagem: "Esta Razão Social já está em uso." });
                    }

                    // Se chegou aqui, é a falha lógica que suspeitamos
                    console.log("[CONTROLLER] ERRO: Encontrei uma duplicata, mas nenhuma condição específica bateu. Enviando resposta 409 genérica.");
                    return res.status(409).json({ mensagem: "Dados de empresa já cadastrados." });

                } else {
                    console.log("[CONTROLLER] PASSO 5: Nenhuma duplicata encontrada. Enviando resposta 200.");
                    return res.status(200).json({ mensagem: "Dados disponíveis." });
                    
                }
            })
            .catch(erro => {
                console.log("[CONTROLLER] ERRO: A chamada ao Model falhou (bloco catch).");
                console.error("Erro detalhado:", erro);
                res.status(500).json({ mensagem: "Erro interno do servidor.", erro: erro.message });
            });
    }
};

module.exports = empresaController;