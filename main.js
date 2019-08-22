cSelected = false;

iconRand = ['🍟', '🥩', '🍖', '☎', '👍', '😎', '💖', '🙌', '🎞', '🕶', '🛴', '🚲', '🚍', '🏎', '💤', '😂', '😊', '🤣', '⚖', '🔫', '🛹', '🛴'];

if (!localStorage.flagEtapa) {
    localStorage.setItem('flagEtapa', 0);
}

//Simular click
function simulateMouseEvents(element, eventName) {
    var mouseEvent = document.createEvent('MouseEvents');
    mouseEvent.initEvent(eventName, true, true);
    if (element) {
        element.dispatchEvent(mouseEvent);
        return true;
    }
    return false;
}

function dataHora() {
    return new Date().toLocaleString();
}

function icones(qtd) {
    var icon = '';

    for (i = 1; i <= qtd; i++) {
        icon += iconRand[Math.floor(Math.random() * iconRand.length)];
    }

    return icon;
}

function selecionarContato(contato) {
    var el = document.querySelector('[title="' + contato + '"]');
    if (simulateMouseEvents(el, 'mousedown')) {
        cSelected = true;
    }
    console.log('Contato selecionado:' + contato);
}

function enviarMensagem(message) {

    if (localStorage.index == 0)
        return false;

    console.log('Mensagem tentando envio.');

    var messageBox = document.querySelectorAll("[contenteditable='true']")[0];
    var event = document.createEvent("UIEvents");
    if (messageBox) {
        messageBox.innerHTML = message;
        event.initUIEvent("input", true, true, window, 1);
        messageBox.dispatchEvent(event);

        //document.querySelector('span[data-icon="send"]').click();
        if (simulateMouseEvents(document.querySelector('span[data-icon="send"]'), 'click')) {


            console.log('Mensagem enviada: ' + dataHora());

            var contact = JSON.parse(localStorage.contato);
            if (contact) {

                axios.get('https://wpback.000webhostapp.com/mensagem-update/?id=' + contact.id)
                    .then(function(response) {
                        console.log('Mensagem marcada como enviada no servidor: ' + dataHora());
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
            }

            localStorage.setItem('flagEtapa', 0);

            //cSelected = false;
            messageBox, event = null;
            return true;
        }
    }
}


//Verificar fila de msg
var setIntervalID = setInterval(function() {

    var cc = window.WAPI.getAllContacts();
    console.log(cc);

    if (localStorage.flagEtapa == 0) {

        axios.get('https://wpback.000webhostapp.com/mensagem-next')
            .then(function(response) {

                console.log(response.data);
                console.log('Verificando se existe msg pendente: ' + dataHora());

                if(response.data.dados.id){

                    var contato = {
                        "id": response.data.dados.id,
                        "contato": response.data.dados.contato,
                        "msg": response.data.dados.msg,
                        "status": response.data.dados.status
                    };

                    localStorage.setItem('contato', JSON.stringify(contato));
                    localStorage.setItem('flagEtapa', 1);

                    console.log('Salvar contato: ' + dataHora());
                }

            })
            .catch(function(error) {
                console.log(error);
            });

    }

}, 10000);


//SELECIONAR CONTATO
var setIntervalID = setInterval(function() {

    //Etapa 1
    if (localStorage.flagEtapa == 1) {

        var contact = JSON.parse(localStorage.contato);

        localStorage.setItem('flagEtapa', 2);

        window.location.href = window.location.href + 'send?phone=+55' + contact.contato;
        console.log('Selecionar contato');

    }

}, 15000);

//ENVIAR MSG
var setIntervalID = setInterval(function() {

    if (localStorage.flagEtapa == 2) {
        var contact = JSON.parse(localStorage.contato);
        if (contact) {
            var message = contact.msg + "\n";
            //message += icones(5) + "\n";
            message += "\n" + dataHora();

            enviarMensagem(message);

            message = null;
        }
    }

}, 20000);