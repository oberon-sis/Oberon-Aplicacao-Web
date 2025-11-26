const homeModel = require('../models/homeModel');

exports.getTopCriticas = async (req, res) => {
    const { fkEmpresa } = req.query; 

    if (!fkEmpresa || isNaN(fkEmpresa)) {
        return res.status(400).json({ message: "O ID da empresa é obrigatório e deve ser um número válido." });
    }

    try {
        const data = await homeModel.getTopCriticalMachines(fkEmpresa);
        return res.status(200).json(data);
    } catch (error) {
        console.error("Erro ao buscar top máquinas:", error);
        return res.status(500).json({ message: "Erro interno do servidor ao buscar máquinas críticas.", error: error.message });
    }
};

exports.getScatterData = async (req, res) => {
    const { fkEmpresa } = req.query; 

    if (!fkEmpresa || isNaN(fkEmpresa)) {
        return res.status(400).json({ message: "O ID da empresa é obrigatório e deve ser um número válido." });
    }

    try {
        const data = await homeModel.getScatterPlotData(fkEmpresa);
        return res.status(200).json(data);
    } catch (error) {
        console.error("Erro ao buscar dados do scatter plot:", error);
        return res.status(500).json({ message: "Erro interno do servidor ao buscar dados do gráfico.", error: error.message });
    }
};