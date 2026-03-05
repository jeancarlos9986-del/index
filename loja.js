import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// ADICIONE O 'cat' (categoria) AQUI
window.adicionarAoCarrinho = function (nome, preco, cat = "Lanches") {
    carrinho.push({ nome, preco, cat });
    atualizarInterfaceCarrinho();
    console.log(`Item adicionado: ${nome} | Categoria: ${cat}`);
};

function atualizarInterfaceCarrinho() {
    const btn = document.getElementById('cart-button');
    const count = document.getElementById('cart-count');
    if (btn) btn.style.display = carrinho.length > 0 ? 'block' : 'none';
    if (count) count.innerText = carrinho.length;
}

window.enviarPedidoFirebase = async function () {
    const nome = document.getElementById('cliente-nome').value;
    const fone = document.getElementById('cliente-fone').value;
    const tipo = document.getElementById('tipo-entrega').value;

    if (!nome || !fone) return alert("Preencha nome e telefone!");

    const lanchesFormatados = {};
    const espetosFormatados = {};
    const adicionaisFormatados = {}; 

    // O processamento agora depende do 'item.cat' definido no clique do botão
    carrinho.forEach(item => {
        if (item.cat === "Adicionais") {
            adicionaisFormatados[item.nome] = (adicionaisFormatados[item.nome] || 0) + 1;
        } else if (item.cat === "Espetos") {
            espetosFormatados[item.nome] = (espetosFormatados[item.nome] || 0) + 1;
        } else {
            // Se cat for 'Lanches' ou qualquer outro não definido, cai aqui
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
        espetos: espetosFormatados,
        adicionais: adicionaisFormatados,
        total: carrinho.reduce((acc, i) => acc + i.preco, 0)
    };

    try {
        const docRef = await addDoc(collection(db, "pedidos"), novoPedido);
        alert("🍔 Pedido recebido! Acompanhe o status.");

        carrinho = [];
        // Certifique-se que estas funções existem no seu projeto
        if (typeof fecharModalCarrinho === 'function') fecharModalCarrinho();
        atualizarInterfaceCarrinho();

        window.location.href = `status.html?id=${docRef.id}`;
    } catch (e) {
        console.error("Erro ao enviar:", e);
        alert("Erro ao enviar pedido. Tente novamente.");
    }
};
