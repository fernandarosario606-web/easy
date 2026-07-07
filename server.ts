import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Gemini API client:", error);
  }
} else {
  console.log("No GEMINI_API_KEY found in environment. Running with local mock simulations for AI features.");
}

// ==========================================
// API ROUTES
// ==========================================

// Chat support API
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Parâmetro 'messages' inválido ou ausente." });
  }

  // Fallback support logic if Gemini is not available
  if (!ai) {
    // Basic automatic rules for simulating customer support
    const userMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
    let reply = "Olá! Sou o assistente Easy. No momento estou operando no modo de simulação offline. Como posso te ajudar hoje?";
    
    if (userMessage.includes("sincronizacao") || userMessage.includes("banco") || userMessage.includes("conexão")) {
      reply = "Para sincronizar seu banco, vá na aba **Contas**, clique em **Conectar Banco**, escolha sua instituição financeira simulada (ex: Nubank, Itaú, Banco do Brasil) e insira suas credenciais fictícias de teste. O sistema irá sincronizar automaticamente suas transações recentes!";
    } else if (userMessage.includes("meta") || userMessage.includes("orçamento") || userMessage.includes("planejar")) {
      reply = "Você pode definir metas financeiras personalizadas na seção **Metas**. Defina um valor limite para categorias específicas, como Alimentação ou Lazer, e nós te avisaremos conforme você se aproximar do limite!";
    } else if (userMessage.includes("exportar") || userMessage.includes("pdf") || userMessage.includes("csv")) {
      reply = "Para exportar seus relatórios financeiros, acesse a aba **Relatórios**, selecione o mês desejado e clique nos botões **Exportar CSV** ou **Exportar PDF**. Seu arquivo será gerado imediatamente!";
    } else if (userMessage.includes("segurança") || userMessage.includes("biometria") || userMessage.includes("face id")) {
      reply = "Sua segurança é nossa prioridade! O app Easy possui suporte a **Autenticação Biométrica** (Face ID / Touch ID simulados). Você pode ativar ou desativar esta opção nas configurações a qualquer momento para proteger o acesso aos seus dados.";
    } else if (userMessage.includes("dica") || userMessage.includes("economizar") || userMessage.includes("poupar")) {
      reply = "Aqui vai uma dica rápida de economia: Revise suas assinaturas mensais recorrentes! Serviços que você não usa com frequência podem estar consumindo até 15% do seu orçamento sem você perceber. No painel, você pode ver insights detalhados sobre esses gastos.";
    }

    // Delay a bit to simulate typing
    return setTimeout(() => {
      res.json({ reply });
    }, 800);
  }

  try {
    // Map messages format to Gemini format
    // Chat messages format in easy-app is: { role: "user" | "assistant", content: string }
    // Translate this to prompt with system instruction or simple chat
    const conversation = messages.map(msg => {
      return `${msg.role === "user" ? "Usuário" : "Assistente"}: ${msg.content}`;
    }).join("\n");

    const prompt = `Aqui está a conversa até agora:\n${conversation}\n\nAssistente:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é o 'Easy Assistant', o assistente inteligente oficial de suporte e consultoria financeira do app 'easy'. O usuário fala português do Brasil. Ajude-o com dúvidas sobre finanças, como usar o aplicativo, dicas de economia, planejamento financeiro e dúvidas de contas. Suas respostas devem ser elegantes, amigáveis, fáceis de entender, formatadas em Markdown e motivacionais. Nunca mencione termos de infraestrutura interna ou que você é apenas uma IA, fale com propriedade como o assistente do app Easy."
      }
    });

    res.json({ reply: response.text || "Desculpe, não consegui processar sua resposta." });
  } catch (error: any) {
    console.error("Erro na API Gemini Chat:", error);
    res.status(500).json({ error: "Erro ao gerar resposta da IA.", details: error.message });
  }
});

// Insights / Personalized Savings Tips API
app.post("/api/insights", async (req, res) => {
  const { transactions, goals, balance, currency } = req.body;

  // Fallback structured insights in case Gemini is not available
  const defaultInsights = [
    {
      category: "Alimentação",
      title: "Cozinhar em Casa vs. Delivery",
      description: "Seus gastos com delivery aumentaram 18% este mês. Substituir apenas duas jantas por refeições feitas em casa pode poupar uma quantia considerável.",
      potentialSavings: 150
    },
    {
      category: "Assinaturas",
      title: "Auditoria de Assinaturas",
      description: "Identificamos 3 serviços de streaming ativos. Considere cancelar os que não utilizou nas últimas duas semanas ou compartilhar planos familiares.",
      potentialSavings: 45
    },
    {
      category: "Lazer",
      title: "Entretenimento Gratuito",
      description: "Você atingiu 90% da sua meta de lazer. Busque por atividades culturais e parques públicos na sua cidade para manter a diversão sem estourar o orçamento.",
      potentialSavings: 80
    }
  ];

  if (!ai) {
    return res.json({ insights: defaultInsights });
  }

  try {
    const contextPrompt = `Analise os dados financeiros do usuário para este mês e forneça dicas de economia personalizadas:
- Saldo Atual: ${balance || 5000} ${currency || "BRL"}
- Transações Recentes: ${JSON.stringify(transactions || [])}
- Metas Atuais: ${JSON.stringify(goals || [])}

Gere exatamente 3 ou 4 dicas de economia ultra-personalizadas, realistas e úteis em português do Brasil.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contextPrompt,
      config: {
        systemInstruction: "Você é um consultor financeiro de elite. Gere dicas de economia extremamente acuradas com base nos dados do usuário. Sua resposta deve estar estritamente formatada no formato JSON como um array de objetos. Cada objeto deve conter: 'category' (string, ex: Alimentação, Transporte, Assinaturas, Lazer, Geral), 'title' (string, curto e direto), 'description' (string, detalhando o comportamento observado e a sugestão de mudança), e 'potentialSavings' (número inteiro, valor estimado que pode ser economizado por mês). Não adicione blocos de código markdown como ```json ou texto explicativo extra. Retorne apenas o JSON bruto.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              potentialSavings: { type: Type.NUMBER }
            },
            required: ["category", "title", "description", "potentialSavings"]
          }
        }
      }
    });

    const insightsText = response.text?.trim() || "[]";
    const insights = JSON.parse(insightsText);
    res.json({ insights });
  } catch (error: any) {
    console.error("Erro na API Gemini Insights:", error);
    res.json({ insights: defaultInsights, warning: "Usando insights simulados devido a um erro na IA." });
  }
});

// ==========================================
// VITE OR STATIC SERVING MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Production static files serving loaded from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
