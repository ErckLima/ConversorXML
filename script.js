document.getElementById('processarBtn').addEventListener('click', processarArquivos);

function processarArquivos() {
    const xmlImportacaoFile = document.getElementById('xmlImportacao').files[0];
    const xmlNfInternaFile = document.getElementById('xmlNfInterna').files[0];
    const xmlSaida = document.getElementById('xmlSaida').value;

    if (!xmlImportacaoFile || !xmlNfInternaFile || !xmlSaida) {
        exibirMensagem("Todos os campos devem ser preenchidos.");
        return;
    }

    // Leitura dos arquivos XML
    const readerImportacao = new FileReader();
    const readerNfInterna = new FileReader();

    readerImportacao.onload = function(event) {
        const xmlImportacao = event.target.result;
        readerNfInterna.onload = function(event) {
            const xmlNfInterna = event.target.result;

            // Processamento dos XMLs
            try {
                const parser = new DOMParser();
                const xmlDocImportacao = parser.parseFromString(xmlImportacao, "application/xml");
                const xmlDocNfInterna = parser.parseFromString(xmlNfInterna, "application/xml");

                modificarTpNF(xmlDocImportacao);
                substituirDest(xmlDocImportacao, xmlDocNfInterna);
                modificarCFOP(xmlDocImportacao);

                // Remove os namespaces indesejados
                removeNamespaces(xmlDocImportacao.documentElement);

                // Gerar o arquivo de saída
                const serializer = new XMLSerializer();
                const xmlString = serializer.serializeToString(xmlDocImportacao);

                baixarArquivo(xmlSaida + '.xml', xmlString);
                exibirMensagem("Processamento concluído com sucesso!", "green");

            } catch (e) {
                exibirMensagem("Erro ao processar os arquivos: " + e.message);
            }
        };

        readerNfInterna.readAsText(xmlNfInternaFile);
    };

    readerImportacao.readAsText(xmlImportacaoFile);
}

function modificarTpNF(xmlDoc) {
    const tpNF = xmlDoc.querySelector('tpNF');
    if (tpNF && tpNF.textContent === '0') {
        tpNF.textContent = '1';
    }
}

function substituirDest(xmlDocImportacao, xmlDocNfInterna) {
    const destImportacao = xmlDocImportacao.querySelector('dest');
    const destNfInterna = xmlDocNfInterna.querySelector('dest');

    if (destImportacao && destNfInterna) {
        destImportacao.innerHTML = destNfInterna.innerHTML;
    }
}

function modificarCFOP(xmlDoc) {
    const cfopTags = xmlDoc.querySelectorAll('CFOP');
    cfopTags.forEach(cfop => {
        if (cfop.textContent.startsWith('3')) {
            cfop.textContent = '7' + cfop.textContent.substring(1);
        }
    });
}

// Função para remover namespaces de todo o documento XML
function removeNamespaces(element) {
    if (element.hasAttribute('xmlns')) {
        element.removeAttribute('xmlns');
    }
    
    // Recursivamente remove os namespaces de todos os elementos filhos
    for (let i = 0; i < element.children.length; i++) {
        removeNamespaces(element.children[i]);
    }
}

function baixarArquivo(nomeArquivo, conteudo) {
    const blob = new Blob([conteudo], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    link.click();
}

function exibirMensagem(mensagem, cor = "red") {
    const mensagemDiv = document.getElementById('mensagem');
    mensagemDiv.style.color = cor;
    mensagemDiv.textContent = mensagem;
}
