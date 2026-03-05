import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// COPIE AS CONFIGURAÇÕES DO SEU COZINHA.HTML AQUI
const firebaseConfig = {
    apiKey: "AIzaSyDIcG9NqxQ7PLUB9Qu45FUWwvD1K7of-2s",
    authDomain: "fb-pedidos.firebaseapp.com",
    projectId: "fb-pedidos",
    storageBucket: "fb-pedidos.appspot.com",
    messagingSenderId: "702648413709",
    appId: "1:702648413709:web:6e64ec57c79539a29d5b4e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let carrinho = [];

window.adicionarAoCarrinho = function (nome, preco) {
    carrinho.push({ nome, preco });
    atualizarInterfaceCarrinho();
};

function atualizarInterfaceCarrinho() {
    const btn = document.getElementById('cart-button');
    const count = document.getElementById('cart-count');
    btn.style.display = carrinho.length > 0 ? 'block' : 'none';
    count.innerText = carrinho.length;
}

window.enviarPedidoFirebase = async function () {
    const nome = document.getElementById('cliente-nome').value;
    const fone = document.getElementById('cliente-fone').value;
    const tipo = document.getElementById('tipo-entrega').value;

    if (!nome || !fone) return alert("Preencha nome e telefone!");

    // Estrutura esperada pela cozinha:
    const lanchesFormatados = {};
    const espetosFormatados = {}; // <--- ADICIONADO
    const adicionaisFormatados = {}; 

    carrinho.forEach(item => {
        // Ajuste a lógica de categoria conforme o seu catálogo
        if (item.cat === "Adicionais") {
            adicionaisFormatados[item.nome] = (adicionaisFormatados[item.nome] || 0) + 1;
        } else if (item.cat === "Espetos") { // <--- NOVO FILTRO
            espetosFormatados[item.nome] = (espetosFormatados[item.nome] || 0) + 1;
        } else {
            lanchesFormatados[item.nome] = (lanchesFormatados[item.nome] || 0) + 1;
        }
    });

    const novoPedido = {
        cliente_nome: nome,
        cliente_fone: fone,
        tipo_local: tipo,
        status: "Pendente",
        timestamp: Date.now(),
        lanches: lanchesFormatados,
        espetos: espetosFormatados,   // <--- AGORA A COZINHA VAI LER ISSO
        adicionais: adicionaisFormatados,
        total: carrinho.reduce((acc, i) => acc + i.preco, 0)
    };

    try {
        // 1. Enviamos o pedido e guardamos a referência (docRef)
        const docRef = await addDoc(collection(db, "pedidos"), novoPedido);

        // 2. Pegamos o ID gerado pelo Firebase
        const pedidoId = docRef.id;

        alert("🍔 Pedido recebido! Acompanhe o status na próxima tela.");

        carrinho = [];
        fecharModalCarrinho();
        atualizarInterfaceCarrinho();

        // 3. Redirecionamos para a página de status passando o ID na URL
        window.location.href = `status.html?id=${pedidoId}`;

    } catch (e) {
        console.error("Erro ao enviar:", e);
        alert("Erro ao enviar pedido. Tente novamente.");
    }

};
